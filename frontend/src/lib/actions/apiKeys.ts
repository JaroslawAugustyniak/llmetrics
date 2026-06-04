'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export type ApiKeyStatus = {
  openai: boolean;
  gemini: boolean;
};

export async function getApiKeyStatus(token: string): Promise<ApiKeyStatus> {

  try {
    const response = await fetch(`${API_URL}/api/auth/api-keys`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch API key status: ${response.statusText}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching API key status:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

export async function updateApiKeys(
  token: string,
  data: { openai_key?: string; gemini_key?: string }
): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/auth/api-keys`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Failed to update API keys: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error updating API keys:', error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}