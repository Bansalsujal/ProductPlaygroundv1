// API client for secure backend communication
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname.includes('replit.dev')
  ? '/api'
  : 'http://localhost:3001/api';

class APIClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // User methods
  async getUser() {
    return this.request('/user/me');
  }

  async login() {
    return this.request('/user/login', { method: 'POST' });
  }

  async logout() {
    return this.request('/user/logout', { method: 'POST' });
  }

  async updateUser(userData) {
    return this.request('/user/update', { 
      method: 'PUT', 
      body: userData 
    });
  }

  // Questions methods
  async getQuestions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/questions${params ? '?' + params : ''}`);
  }

  // Sessions methods
  async getSessions(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/sessions${params ? '?' + params : ''}`);
  }

  async createSession(sessionData) {
    return this.request('/sessions', {
      method: 'POST',
      body: sessionData
    });
  }

  async updateSession(id, updates) {
    return this.request(`/sessions/${id}`, {
      method: 'PUT',
      body: updates
    });
  }

  // User Stats methods
  async getUserStats(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    return this.request(`/user-stats${params ? '?' + params : ''}`);
  }

  async upsertUserStats(statsData) {
    return this.request('/user-stats', {
      method: 'POST',
      body: statsData
    });
  }

  // LLM methods
  async invokeLLM(prompt, options = {}) {
    return this.request('/llm/invoke', {
      method: 'POST',
      body: { prompt, ...options }
    });
  }
}

export const apiClient = new APIClient();
export default apiClient;