/**
 * Fetch configuration from z.ai API
 * @returns Promise resolving to the configuration JSON data
 */
export async function getConfig(): Promise<any> {
  try {
    const response = await fetch('https://chat.z.ai/api/config', {
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
    console.error('Error fetching config:', error);
    throw error;
  }
}