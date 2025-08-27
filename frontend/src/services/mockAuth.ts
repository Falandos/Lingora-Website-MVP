// Mock authentication service for development

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    email: string;
    role: string;
    business_name?: string;
  };
  message?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
}

export class MockAuthService {
  private static readonly API_BASE = '/api';
  private static readonly USERS_STORAGE_KEY = 'lingora_mock_users';
  
  // Get all users (both hardcoded and registered)
  private static getAllUsers() {
    const hardcodedUsers = [
      { id: 1, email: 'test@example.com', password: 'password123', role: 'provider', business_name: 'Test Business' },
      { id: 2, email: 'admin@lingora.nl', password: 'admin123', role: 'admin' },
      { id: 3, email: 'demo@demo.com', password: 'demo123', role: 'provider', business_name: 'Demo Company' }
    ];
    
    const storedUsersJson = localStorage.getItem(this.USERS_STORAGE_KEY);
    const storedUsers = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    
    return [...hardcodedUsers, ...storedUsers];
  }
  
  // Store a new user
  private static storeUser(userData: any) {
    const storedUsersJson = localStorage.getItem(this.USERS_STORAGE_KEY);
    const storedUsers = storedUsersJson ? JSON.parse(storedUsersJson) : [];
    
    // Generate a unique ID
    const maxId = Math.max(...this.getAllUsers().map(u => u.id), 0);
    const newUser = { ...userData, id: maxId + 1, role: 'provider' };
    
    storedUsers.push(newUser);
    localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(storedUsers));
    
    return newUser;
  }
  
  static async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check against all users (hardcoded + registered)
      const allUsers = this.getAllUsers();
      const user = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (user) {
        const token = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role }));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return {
          success: true,
          token,
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            business_name: user.business_name
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid email or password'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Login failed. Please try again.'
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Simple validation
      if (!data.email || !data.password || !data.business_name || !data.kvk_number || !data.btw_number) {
        return {
          success: false,
          message: 'All fields are required'
        };
      }

      if (data.password.length < 6) {
        return {
          success: false,
          message: 'Password must be at least 6 characters'
        };
      }

      // Check if user already exists
      const existingUsers = this.getAllUsers();
      const userExists = existingUsers.find(u => u.email.toLowerCase() === data.email.toLowerCase());
      
      if (userExists) {
        return {
          success: false,
          message: 'An account with this email already exists'
        };
      }

      // Store the new user
      this.storeUser(data);

      // Simulate successful registration
      return {
        success: true,
        message: 'Registration successful! You can now login with your credentials. (Email verification simulated)'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }

  static logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}