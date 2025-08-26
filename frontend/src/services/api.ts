// API service functions

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: 'Network error occurred',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    email: string;
    password: string;
    business_name: string;
    kvk_number: string;
    btw_number: string;
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(token: string) {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Search endpoints
  async search(params: URLSearchParams) {
    return this.request(`/search?${params.toString()}`);
  }

  // Provider endpoints
  async getProvider(slug: string) {
    return this.request(`/providers/${slug}`);
  }

  async getMyProvider() {
    return this.request('/providers/my');
  }

  async updateProvider(data: any) {
    return this.request('/providers/my', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProviderLanguages(languages: any[]) {
    return this.request('/providers/languages', {
      method: 'PUT',
      body: JSON.stringify({ languages }),
    });
  }

  // Contact endpoints
  async sendMessage(data: {
    provider_id: number;
    service_id?: number;
    sender_name: string;
    sender_email: string;
    preferred_language: string;
    subject: string;
    message: string;
    consent_given: boolean;
  }) {
    return this.request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/categories');
  }

  // Languages endpoints
  async getLanguages() {
    return this.request('/languages');
  }

  // Admin endpoints
  async getPendingProviders(page = 1, limit = 20) {
    return this.request(`/admin/pending-providers?page=${page}&limit=${limit}`);
  }

  async approveProvider(providerId: number) {
    return this.request(`/admin/approve-provider/${providerId}`, {
      method: 'PUT',
    });
  }

  async rejectProvider(providerId: number, reason: string) {
    return this.request(`/admin/reject-provider/${providerId}`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async getAdminStats() {
    return this.request('/admin/stats');
  }
}

export const apiService = new ApiService();
export default apiService;