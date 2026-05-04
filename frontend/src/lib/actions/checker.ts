'use server';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://api.llmetrics.localhost/';

export async function checkUrl(url: string, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to check URL');
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getChecks(token: string, page: number = 1) {
  try {
    const res = await fetch(`${API_URL}/api/checks?page=${page}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch checks');
    }

    return { success: true, data: data.data, pagination: data.pagination };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCheck(id: number, token: string) {
  try {
    const res = await fetch(`${API_URL}/api/checks/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch check');
    }

    return { success: true, data: data.data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
