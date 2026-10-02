# EatFish - Mobile-First AI Fish Classification Web App

EatFish is a minimal, professional mobile-first AI fish classification web application powered by a trained **MobileNetV3Small** neural network. It accurately classifies fish species in real time directly inside your mobile or desktop web browser using camera snapshots or photo uploads.

---

## 📱 Primary User Journey
```
Home ➔ Camera / Gallery ➔ Image Preview ➔ Analyze ➔ Prediction Result ➔ Identify Another Fish
```

1. **Home**: EatFish branding, concise overview, real-time AI status badge, and quick start actions.
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

## ☁️ Hosting on Render (Web Application)

This repository is pre-configured to host the complete mobile web app and AI backend together under a single Render web service:

1. Create a **New Web Service** on [Render](https://dashboard.render.com).
2. Connect this repository: `Abinav-max/Eatfish-Classifier`.
3. Set the following:
   * **Runtime**: `Python 3`
   * **Build Command**: `pip install -r requirements.txt`
   * **Start Command**: `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   * **Environment Variable**: `PYTHON_VERSION` = `3.11.9`
4. Once deployed, Render gives you a live HTTPS web URL (e.g. `https://eatfish-web.onrender.com`).
5. Open this URL in any mobile browser (Chrome / Safari on Android or iOS) to use the app immediately!

---

## 💻 Running Locally

### Option 1: One-Click Launcher (Windows)
Double-click `run_app.bat` to launch both backend and frontend automatically.

### Option 2: Manual Terminal
```powershell
# Terminal 1: Backend
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```
* **Local Web App**: [http://localhost:5173](http://localhost:5173)
* **Mobile on Wi-Fi**: `http://10.249.164.1:5173`
