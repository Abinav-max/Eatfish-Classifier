/**
 * EatFish API Client
 * Connects React frontend (Web & Android APK) with the FastAPI classification backend.
 */

const DEFAULT_SERVER_IP = '10.249.164.1'; // Local Wi-Fi IP of backend host

export function getApiBaseUrl() {
  const custom = localStorage.getItem('eatfish_backend_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }

  // Check if running inside mobile dev server with Vite proxy
  if (window.location.port === '5173') {
    return '/api';
  }

  // Check if running on same host machine
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://127.0.0.1:8000';
  }

  // If accessed from another device (or Capacitor APK):
  // If window.location.hostname is an IP address, point to that IP's port 8000
  if (/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname)) {
    return `http://${window.location.hostname}:8000`;
  }

  // Default fallback for APK / Capacitor
  return `http://${DEFAULT_SERVER_IP}:8000`;
}

export function setApiBaseUrl(url) {
  if (!url || !url.trim()) {
    localStorage.removeItem('eatfish_backend_url');
  } else {
    localStorage.setItem('eatfish_backend_url', url.trim());
  }
}

export async function checkBackendHealth() {
  const baseUrl = getApiBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ok: true, data, url: baseUrl };
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Unable to connect to EatFish classification service.',
      url: baseUrl,
    };
  }
}

export async function predictFishImage(fileOrBlob) {
  if (!fileOrBlob) {
    return { success: false, error: 'No image file provided for analysis.' };
  }

  const baseUrl = getApiBaseUrl();
  const formData = new FormData();
  const filename = fileOrBlob.name || 'fish_capture.jpg';
  formData.append('file', fileOrBlob, filename);

  try {
    const res = await fetch(`${baseUrl}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let errorDetail = `Server error (${res.status})`;
      try {
        const errorJson = await res.json();
        if (errorJson && errorJson.detail) {
          errorDetail = errorJson.detail;
        }
      } catch {
        errorDetail = res.statusText || errorDetail;
      }
      return { success: false, error: errorDetail };
    }

    const data = await res.json();
    return {
      success: true,
      data: {
        predicted_class: data.predicted_class,
        confidence: Number(data.confidence),
        probabilities: data.probabilities || {},
        filename: data.filename || filename,
      }
    };
  } catch (err) {
    return {
      success: false,
      error: err.message === 'Failed to fetch'
        ? `Cannot reach backend at ${baseUrl}. Ensure backend server is running and reachable.`
        : err.message || 'An unexpected error occurred during prediction.',
    };
  }
}
