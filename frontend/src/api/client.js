/**
 * EatFish Web API Client
 * Seamless connection to the FastAPI classification backend.
 */

// In Vite local development (port 5173), route through proxy '/api'.
// In production on Render, communicate directly via same-origin relative URLs.
const API_BASE = window.location.port === '5173' ? '/api' : '';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Server returned ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err.message || 'Unable to connect to EatFish classification service.',
    };
  }
}

export async function predictFishImage(fileOrBlob) {
  if (!fileOrBlob) {
    return { success: false, error: 'No image file provided for analysis.' };
  }

  const formData = new FormData();
  const filename = fileOrBlob.name || 'fish_capture.jpg';
  formData.append('file', fileOrBlob, filename);

  try {
    const res = await fetch(`${API_BASE}/predict`, {
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
        ? 'Cannot reach the classification server. Please verify your connection.'
        : err.message || 'An unexpected error occurred during prediction.',
    };
  }
}
