import os
import io
import json
import logging
from typing import Dict, List, Any
import numpy as np
from PIL import Image, UnidentifiedImageError
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import keras

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("eatfish-api")

app = FastAPI(
    title="EatFish AI Classification API",
    description="Real-time MobileNetV3 fish species classifier",
    version="1.0.0"
)

# CORS setup for mobile and web frontends
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

# Warm-up model with dummy prediction for rapid subsequent responses
_dummy_input = np.zeros((1, 224, 224, 3), dtype=np.float32)
model.predict(_dummy_input, verbose=0)
logger.info("Model warm-up completed.")


@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint providing model status and loaded classes."""
    return {
        "status": "ok",
        "service": "EatFish AI API",
        "model_loaded": True,
        "model_architecture": "MobileNetV3Small",
        "classes": CLASS_NAMES,
        "classes_count": len(CLASS_NAMES)
    }


@app.post("/predict", tags=["Classification"])
async def predict_fish(file: UploadFile = File(...)):
    """
    Accepts an uploaded image file (JPEG, PNG, WebP),
    processes it through the MobileNetV3 model,
    and returns the predicted species, confidence, and full class probability breakdown.
    """
    # 1. Validate file received
    if not file:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No image file provided."
        )

    # 2. Read bytes
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

    # 3. Validate image format with PIL
    try:
        image = Image.open(io.BytesIO(image_bytes))
        image.verify()  # Verify image integrity
        # Re-open for actual processing as verify closes or damages handle
        image = Image.open(io.BytesIO(image_bytes))
    except (UnidentifiedImageError, Exception) as e:
        logger.warning(f"Invalid image format: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is not a valid image format. Supported formats: JPEG, PNG, WebP."
        )

    # 4. Preprocess image
    try:
        # Convert to RGB (handles RGBA, grayscale, CMYK, etc.)
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Resize to 224x224 required by model
        image = image.resize((224, 224), Image.Resampling.BILINEAR)
        
        # Convert to numpy array float32
        img_array = np.array(image, dtype=np.float32)
        
        # Add batch dimension: shape (1, 224, 224, 3)
        input_tensor = np.expand_dims(img_array, axis=0)
    except Exception as e:
        logger.error(f"Error during image preprocessing: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Image preprocessing error: {str(e)}"
        )

    # 5. Model inference
    try:
        predictions = model.predict(input_tensor, verbose=0)[0]
    except Exception as e:
        logger.error(f"Error during model prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference computation error: {str(e)}"
        )

    # 6. Build response
    try:
        # Build probability map for all classes in class_names.json
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
            "filename": file.filename or "uploaded_fish.jpg"
        }
        logger.info(f"Prediction result: {predicted_class} ({confidence * 100:.1f}%)")
        return JSONResponse(content=response_data)
    except Exception as e:
        logger.error(f"Error packaging response: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error constructing prediction output."
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
