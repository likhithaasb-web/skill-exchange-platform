const API_ORIGIN = (import.meta.env.VITE_API_URL ? (import.meta.env.VITE_API_URL as string).replace(/\/$/, '') : '');
const API_BASE = `${API_ORIGIN}/api`;

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('skillx_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  let data: any = null;

  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch (e) {
      data = null;
    }
  }

  if (!data) {
    const rawText = await res.text().catch(() => '');

    // 1. Render cold start or downtime
    if (res.status === 502 || res.status === 503) {
      throw new Error('Backend server is waking up on Render (502/503). Please wait 30–60 seconds for the free instance to spin up, then try again.');
    }

    // 2. 404 Route Not Found
    if (res.status === 404) {
      throw new Error('API endpoint not found (404). Check if the backend is running and VITE_API_URL is configured properly.');
    }

    // 3. HTML returned instead of JSON (common when Static Site rewrites to index.html)
    if (rawText.trim().startsWith('<!DOCTYPE') || rawText.trim().startsWith('<html')) {
      throw new Error('Backend API not reached (received HTML instead of JSON). If using a separate Static Site on Render, ensure VITE_API_URL is set in your frontend Environment Variables.');
    }

    if (!res.ok) {
      throw new Error(`Server error (${res.status}): ${rawText.slice(0, 100) || 'Unknown error'}`);
    }

    data = { success: false, message: rawText || 'Unexpected server response' };
  }

  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }

  if (data.success === false && data.message) {
    throw new Error(data.message);
  }

  return data;
}

export const api = {
  // Auth
  async checkUsername(username: string) {
    const res = await fetch(`${API_BASE}/auth/check-username?username=${encodeURIComponent(username)}`);
    return handleResponse(res);
  },

  async register(payload: any) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async login(payload: any) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async saveOnboarding(payload: any) {
    const res = await fetch(`${API_BASE}/auth/onboarding`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateAppearance(payload: any) {
    const res = await fetch(`${API_BASE}/auth/appearance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async changePassword(payload: any) {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async logoutSession(sessionId?: string) {
    const res = await fetch(`${API_BASE}/auth/logout-session`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ sessionId }),
    });
    return handleResponse(res);
  },

  // Profiles
  async getProfile(username: string) {
    const res = await fetch(`${API_BASE}/profile/${username}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateProfile(payload: any) {
    const res = await fetch(`${API_BASE}/profile/update`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async addTeachingSkill(payload: any) {
    const res = await fetch(`${API_BASE}/profile/teaching-skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async removeTeachingSkill(skillId: string) {
    const res = await fetch(`${API_BASE}/profile/teaching-skills/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async addLearningSkill(payload: any) {
    const res = await fetch(`${API_BASE}/profile/learning-skills`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async removeLearningSkill(skillId: string) {
    const res = await fetch(`${API_BASE}/profile/learning-skills/${skillId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updatePrivacySettings(payload: any) {
    const res = await fetch(`${API_BASE}/profile/privacy-settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Exchanges & Discovery
  async discoverPeers(params: { skill?: string; category?: string; level?: string; language?: string; mutualOnly?: boolean } = {}) {
    const query = new URLSearchParams();
    if (params.skill) query.set('skill', params.skill);
    if (params.category) query.set('category', params.category);
    if (params.level) query.set('level', params.level);
    if (params.language) query.set('language', params.language);
    if (params.mutualOnly) query.set('mutualOnly', 'true');

    const res = await fetch(`${API_BASE}/exchanges/discover?${query.toString()}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createExchangeRequest(payload: any) {
    const res = await fetch(`${API_BASE}/exchanges/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getMyExchanges() {
    const res = await fetch(`${API_BASE}/exchanges/my-exchanges`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getExchangeById(id: string) {
    const res = await fetch(`${API_BASE}/exchanges/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async respondToExchange(exchangeId: string, action: 'accept' | 'decline' | 'cancel') {
    const res = await fetch(`${API_BASE}/exchanges/${exchangeId}/respond`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },

  async completeExchange(exchangeId: string) {
    const res = await fetch(`${API_BASE}/exchanges/${exchangeId}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Studios
  async getStudioById(studioId: string) {
    const res = await fetch(`${API_BASE}/studios/${studioId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async updateStudioSettings(studioId: string, settings: any) {
    const res = await fetch(`${API_BASE}/studios/${studioId}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    return handleResponse(res);
  },

  async saveWhiteboardData(studioId: string, elements: any[]) {
    const res = await fetch(`${API_BASE}/studios/${studioId}/whiteboard`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ elements }),
    });
    return handleResponse(res);
  },

  async saveCodeSpaceData(studioId: string, payload: { code?: string; language?: string }) {
    const res = await fetch(`${API_BASE}/studios/${studioId}/code`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async endStudioSession(studioId: string) {
    const res = await fetch(`${API_BASE}/studios/${studioId}/end`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Resources
  async uploadResource(formData: FormData) {
    const token = localStorage.getItem('skillx_token');
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${API_BASE}/resources/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    return handleResponse(res);
  },

  async getStudioResources(studioId: string) {
    const res = await fetch(`${API_BASE}/resources/studio/${studioId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async deleteResource(resourceId: string) {
    const res = await fetch(`${API_BASE}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${API_BASE}/projects`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getProjectById(projectId: string) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createProject(payload: any) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async updateProject(projectId: string, payload: any) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Reviews
  async submitReview(payload: any) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getReviewsForUser(userId: string) {
    const res = await fetch(`${API_BASE}/reviews/user/${userId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Safety & Notifications
  async blockUser(targetUserId: string) {
    const res = await fetch(`${API_BASE}/safety/block`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });
    return handleResponse(res);
  },

  async unblockUser(targetUserId: string) {
    const res = await fetch(`${API_BASE}/safety/unblock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });
    return handleResponse(res);
  },

  async getBlockedUsers() {
    const res = await fetch(`${API_BASE}/safety/blocked`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async createReport(payload: any) {
    const res = await fetch(`${API_BASE}/safety/report`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async getNotifications() {
    const res = await fetch(`${API_BASE}/safety/notifications`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string) {
    const res = await fetch(`${API_BASE}/safety/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async markAllNotificationsRead() {
    const res = await fetch(`${API_BASE}/safety/notifications/read-all`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },


  // Direct Messaging
  async getConversations() {
    const res = await fetch(`${API_BASE}/messages/conversations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async getMessagesWithPeer(peerId: string) {
    const res = await fetch(`${API_BASE}/messages/${peerId}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  async sendDirectMessage(payload: { recipientId: string; text: string; attachments?: any[] }) {
    const res = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  async markConversationRead(peerId: string) {
    const res = await fetch(`${API_BASE}/messages/${peerId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

