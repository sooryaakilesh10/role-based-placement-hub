
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private getHeaders(includeAuth = true) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }
    return response.json();
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse(response);
  }

  async getCurrentUser() {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Companies endpoints
  async getCompanies() {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createCompany(companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(companyData),
    });
    return this.handleResponse(response);
  }

  async updateCompany(id: string, companyData: any) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(companyData),
    });
    return this.handleResponse(response);
  }

  async deleteCompany(id: string) {
    const response = await fetch(`${API_BASE_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Pending updates endpoints
  async getPendingUpdates() {
    const response = await fetch(`${API_BASE_URL}/pending-updates`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async approvePendingUpdate(id: string) {
    const response = await fetch(`${API_BASE_URL}/pending-updates/${id}/approve`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async rejectPendingUpdate(id: string) {
    const response = await fetch(`${API_BASE_URL}/pending-updates/${id}/reject`, {
      method: 'POST',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Users endpoints
  async getUsers() {
    const response = await fetch(`${API_BASE_URL}/users`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async createUser(userData: any) {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(userData),
    });
    return this.handleResponse(response);
  }

  async getOfficers() {
    const response = await fetch(`${API_BASE_URL}/users/officers`, {
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  // Reports endpoints
  async downloadCompaniesExcel() {
    const response = await fetch(`${API_BASE_URL}/reports/companies/excel`, {
      headers: this.getHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to download report');
    }
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `companies-report-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}

export const apiService = new ApiService();
