const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export async function analyzeProduct(target) {
  const response = await fetch(`${API_BASE_URL}/analyze/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ target }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

export async function fetchHistory() {
  const response = await fetch(`${API_BASE_URL}/history/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch history (HTTP ${response.status})`);
  }
  return response.json();
}

export async function deleteHistoryItem(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to delete product history item`);
  }
  return response.json();
}

export async function fetchProductDetail(id) {
  const response = await fetch(`${API_BASE_URL}/products/${id}/`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch product details`);
  }
  return response.json();
}

