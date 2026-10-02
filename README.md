# EatFish - Mobile-First AI Fish Classification

EatFish is a minimal, professional mobile-first AI fish classification application powered by a trained **MobileNetV3Small** neural network. It accurately identifies fish species in real-time from device camera captures or photo gallery uploads.

---

## 📱 Primary User Journey
```
Home ➔ Camera / Gallery ➔ Image Preview ➔ Analyze ➔ Prediction Result ➔ Identify Another Fish
```

1. **Home**: EatFish branding, concise overview, real-time backend status badge, and quick start actions.
2. **Camera & Gallery**: Real device camera access with browser WebRTC API, front/rear camera lens switching, reticle frame guides, and gallery image selection.
3. **Image Preview**: High-clarity preview with Retake, Change Image, and Analyze Fish actions.
4. **Analysis**: Fast inference with loading feedback, duplicate submission guards, and error resilience.
5. **Prediction Result**: Top predicted species, confidence percentage, full class probability horizontal bars, statistical disclaimer, and option to identify another fish.
6. **About**: Technical breakdown of the MobileNetV3Small architecture, 224x224 RGB tensor preprocessing, and responsible AI notices.

---

## 🛠 Tech Stack
- **Frontend**: React 19, Tailwind CSS v4, Lucide Icons, Vite
- **Backend**: FastAPI, Uvicorn, Pillow, NumPy
- **Model**: TensorFlow / Keras MobileNetV3Small (`eatfish_mobilenetv3_best.keras`)
- **Classes**: Anchovy (Nethili), Emperor, Sangara (`class_names.json`)

---

## 🚀 Running the Application

### 1. Start the FastAPI Backend
```bash
# From workspace root:
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```
Open in browser or mobile device on local Wi-Fi: [http://localhost:5173](http://localhost:5173)

---

## 📡 API Endpoints
- `GET /health` - Checks model loading status and returns supported class list.
- `POST /predict` - Accepts multipart form data (`file: UploadFile`) and returns predicted class, confidence, and probabilities for every class.
