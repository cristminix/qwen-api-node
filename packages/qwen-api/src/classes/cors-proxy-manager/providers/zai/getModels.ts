/**
 * Fetch available models from z.ai API
 * @returns Promise resolving to the models JSON data
 */
export async function getModels(): Promise<any> {
  try {
    const response = await fetch('https://chat.z.ai/api/models', {
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
    console.error('Error fetching models:', error);
    throw error;
  }
}