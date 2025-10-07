/**
 * Fetch authentication token from z.ai API
 * @returns Promise resolving to the authentication token JSON data
 */
export async function getAuthToken(): Promise<any> {
  try {
    const response = await fetch('https://chat.z.ai/api/v1/auths/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching auth token:', error);
    throw error;
  }
}