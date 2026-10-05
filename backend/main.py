import os
import io
import json
import logging
from typing import Dict, List, Any
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import keras

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eatfish-api")

app = FastAPI(
    title="EatFish AI Classification Web & API",
    description="Real-time MobileNetV3 fish species classification web app",
    version="1.0.0"
)

# CORS setup for mobile web and APK clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# File resolution helper
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PARENT_DIR = os.path.dirname(BASE_DIR)

def resolve_file(filename: str) -> str:
    """Find file in current directory, parent directory, or raise error."""
    paths_to_try = [
        os.path.join(BASE_DIR, filename),
        os.path.join(PARENT_DIR, filename),
        os.path.join(os.getcwd(), filename),
    ]
    for p in paths_to_try:
        if os.path.isfile(p):
            return p
    raise FileNotFoundError(f"Could not locate required file: {filename}")

MODEL_PATH = resolve_file("eatfish_mobilenetv3_best.keras")
CLASS_NAMES_PATH = resolve_file("class_names.json")

logger.info(f"Loading class names from {CLASS_NAMES_PATH}...")
with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    CLASS_NAMES: List[str] = json.load(f)
logger.info(f"Loaded {len(CLASS_NAMES)} classes: {CLASS_NAMES}")

logger.info(f"Loading TensorFlow model from {MODEL_PATH}...")
model = keras.models.load_model(MODEL_PATH)
logger.info("Model loaded successfully.")

# Warm-up model with dummy prediction
_dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
model.predict(_dummy_input, verbose=0)
logger.info("Model warm-up completed.")


# --- API Endpoints ---

@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
async def health_check():
    """Health check endpoint providing model status and loaded classes."""
    return {
        "status": "ok",
        "service": "EatFish AI Web & API",
        "model_loaded": True,
        "model_architecture": "MobileNetV3Small",
        "classes": CLASS_NAMES,
        "classes_count": len(CLASS_NAMES)
    }


@app.post("/predict", tags=["Classification"])
@app.post("/api/predict", tags=["Classification"])
async def predict_fish(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file (JPEG, PNG, WebP),
    processes it through the MobileNetV3 model,
    and returns the predicted species, confidence, and full class probability breakdown.
    """
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided."
        )

    try:
        image_bytes = await file.read()
    except Exception as e:
        logger.error(f"Failed to read upload file: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(e)}"
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty (0 bytes)."
        )

    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()
        image = Image.open(io.BytesIO(image_bytes))
    except (UnidentifiedImageError, Exception) as e:
        logger.warning(f"Invalid image format: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image format. Supported formats: JPEG, PNG, WebP."
        )

    try:
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        w, h = image.size
        # Generate multiple high-quality 224x224 views for robust ensemble inference
        # View 1: High-fidelity 224x224 resize using antialiased LANCZOS filter
        v_main = image.resize((224, 224), Image.Resampling.LANCZOS)
        
        # View 2: Horizontal mirror of main view (fish orientation invariance)
        v_flip = v_main.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
        
        # View 3: Proportional center crop (aspect-ratio preserved fit to 224x224)
        from PIL import ImageOps
        v_fit = ImageOps.fit(image, (224, 224), method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))
        
        # Prepare batch tensor for MobileNetV3Small (expects [0, 255] float32 values)
        views = [v_main, v_flip, v_fit]
        batch_arrays = [np.array(v, dtype=np.float32) for v in views]
        input_tensor = np.stack(batch_arrays, axis=0)
    except Exception as e:
        logger.error(f"Error during image preprocessing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image preprocessing error: {str(e)}"
        )

    try:
        # Evaluate multi-view batch through MobileNetV3 model
        batch_predictions = model.predict(input_tensor, verbose=0)
        
        # Weighted ensemble: main view (50%), flipped view (30%), proportional fit (20%)
        weights = np.array([0.5, 0.3, 0.2], dtype=np.float32)
        predictions = np.average(batch_predictions, axis=0, weights=weights)
    except Exception as e:
        logger.error(f"Error during model prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference computation error: {str(e)}"
        )

    try:
        probabilities: Dict[str, float] = {}
        for idx, class_name in enumerate(CLASS_NAMES):
            prob = float(predictions[idx]) if idx < len(predictions) else 0.0
            probabilities[class_name] = round(prob, 4)

        top_idx = int(np.argmax(predictions))
        predicted_class = CLASS_NAMES[top_idx] if top_idx < len(CLASS_NAMES) else "unknown"
        confidence = float(predictions[top_idx])

        response_data = {
            "predicted_class": predicted_class,
            "confidence": round(confidence, 4),
            "probabilities": probabilities,
            "model_input_size": [224, 224, 3],
            "analysis_mode": "multiview_ensemble_lanczos",
            "filename": file.filename or "uploaded_fish.jpg"
        }
        logger.info(f"Prediction result: {predicted_class} ({confidence * 100:.1f}%) [Multi-View 224x224]")
        return JSONResponse(content=response_data)
    except Exception as e:
        logger.error(f"Error packaging response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error constructing prediction output."
        )


# --- Serve Built React Web App & APK ---

FRONTEND_DIST_PATHS = [
    os.path.join(PARENT_DIR, "frontend", "dist"),
    os.path.join(BASE_DIR, "dist"),
    os.path.join(PARENT_DIR, "dist"),
]

FRONTEND_DIST = None
for p in FRONTEND_DIST_PATHS:
    if os.path.isdir(p) and os.path.isfile(os.path.join(p, "index.html")):
        FRONTEND_DIST = p
        break

if FRONTEND_DIST:
    logger.info(f"Mounting React Web App from: {FRONTEND_DIST}")
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_static_or_spa(full_path: str):
        # Allow API endpoints and docs to pass through
        if full_path in ["health", "predict", "docs", "redoc", "openapi.json"] or full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")

        # 1. Check if exact static file exists in frontend dist
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)

        # 2. Fallback to index.html for Single Page Application routing
        index_file = os.path.join(FRONTEND_DIST, "index.html")
        if os.path.isfile(index_file):
            return FileResponse(index_file)

        raise HTTPException(status_code=404, detail="Page not found")
else:
    logger.warning("Frontend dist directory not found. Serving API only.")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
