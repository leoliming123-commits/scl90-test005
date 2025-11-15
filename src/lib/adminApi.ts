const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
const ADMIN_API_URL = `${SUPABASE_URL}/functions/v1/admin-api`;

interface AccessCode {
  id: string;
  code: string;
  is_active: boolean;
  activated_at: string | null;
  created_at: string;
}

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'X-Admin-Password': ADMIN_PASSWORD,
});

export const adminApi = {
  async listAccessCodes(): Promise<AccessCode[]> {
    const response = await fetch(`${ADMIN_API_URL}/list`, {
      headers: getHeaders(),
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch access codes: ${response.statusText}`);
    }
    const { data } = await response.json();
    return data;
  },

  async createAccessCode(code: string): Promise<AccessCode> {
    const response = await fetch(`${ADMIN_API_URL}/create`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to create access code');
    }

    return result.data[0];
  },

  async resetAccessCode(code: string): Promise<void> {
    const response = await fetch(`${ADMIN_API_URL}/reset`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Failed to reset access code');
    }
  },
};
