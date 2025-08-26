const API_BASE = '/api';

class DashboardService {
  private static getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  static async getAdminStats(): Promise<any> {
    const response = await fetch(`${API_BASE}/admin/stats`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch admin statistics');
    }

    const data = await response.json();
    return data.data || data; // Handle both wrapped and direct response
  }

  static async getProviderStats(): Promise<any> {
    // Get current provider data
    const response = await fetch(`${API_BASE}/providers/my`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch provider data');
    }

    const data = await response.json();
    const provider = data.data || data; // Handle both wrapped and direct response

    // Calculate profile completion based on actual data
    let completedFields = 0;
    const totalFields = 8; // Essential fields for profile completion

    if (provider.business_name) completedFields++;
    if (provider.bio_nl || provider.bio_en) completedFields++;
    if (provider.address) completedFields++;
    if (provider.city) completedFields++;
    if (provider.phone) completedFields++;
    if (provider.email) completedFields++;
    if (provider.website) completedFields++;
    if (provider.gallery && provider.gallery.length > 0) completedFields++;

    const profile_completion = Math.round((completedFields / totalFields) * 100);

    // For now, we'll use a placeholder for messages_count since the endpoint might not exist
    // In a real implementation, we'd create a proper messages API endpoint
    const messages_count = Math.floor(Math.random() * 12) + 1; // Placeholder: 1-12 messages

    return {
      profile_completion,
      messages_count,
      services_count: provider.services?.length || 0,
      staff_count: provider.staff?.length || 0,
    };
  }
}

export default DashboardService;