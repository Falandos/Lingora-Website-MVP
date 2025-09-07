// Real authentication service for backend integration

interface LoginResponse {
  success: boolean;
  data?: {
    token: string;
    user: {
      id: number;
      email: string;
      role: string;
      email_verified: boolean;
    };
  };
  status?: number;
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  data?: {
    user: any;
    provider: any;
    message: string;
  };
  status?: number;
  message?: string;
}

export class AuthService {
  private static readonly API_BASE = '/api';
  
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      // Handle backend response format: {success: true, data: {token, user}}
      if (response.ok && data.success && data.data?.token && data.data?.user) {
        // Store token and user data
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        return {
          success: true,
          data: {
            token: data.data.token,
            user: data.data.user
          }
        };
      } else {
        return {
          success: false,
          message: data.message || data.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async register(data: {
    email: string;
    password: string;
    business_name: string;
    kvk_number: string;
    btw_number: string;
  }): Promise<RegisterResponse> {
    try {
      const response = await fetch(`${this.API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  static async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`${this.API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Handle backend response format: {success: true, data: {user}}
        if (data.success && data.data) {
          return data.data;
        }
        return data.email ? data : null;
      } else {
        // Token is invalid, clear it
        this.logout();
        return null;
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getStoredUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}