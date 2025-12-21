import { API_BASE_URL } from './config';

/**
 * Generic fetch wrapper with error handling
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('API Error:', error);
    throw new Error('Failed to fetch data from server');
  }
}

/**
 * Search by text query
 */
export async function searchByText(query, topK, signal) {
  return fetchAPI('/search/text', {
    method: 'POST',
    body: JSON.stringify({ query, top_k: topK }),
    signal,
  });
}

/**
 * Search by AI prompt
 */
export async function searchByAI(prompt, topK, signal) {
  return fetchAPI('/search/ai', {
    method: 'POST',
    body: JSON.stringify({ prompt, top_k: topK }),
    signal,
  });
}

/**
 * Search by image file
 */
export async function searchByImage(file, topK, signal) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('top_k', String(topK));

  const url = `${API_BASE_URL}/search/image?top_k=${topK}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error;
    }
    console.error('API Error:', error);
    throw new Error('Failed to search by image');
  }
}

/**
 * Get image URL for a product
 */
export function getImageUrl(idx) {
  return `${API_BASE_URL}/image/${idx}`;
}
