const API_BASE_URL = 'http://localhost:8000';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth = false
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requiresAuth) {
        const token = this.getToken();
        if (token) {
            (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
        }
    }

    try {
      let response = await fetch(url, {
        ...options,
        headers,
      });

      // If 401, try to refresh token and retry
      if (response.status === 401 && requiresAuth) {
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
            const token = this.getToken();
            if (token) {
                (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
            }
            response = await fetch(url, {
                ...options,
                headers,
            });
        } else {
          // Refresh failed, clear tokens and redirect to login
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          throw new Error('Authentication failed');
        }
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : {} as unknown as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error');
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ access_token: string; refresh_token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(email: string, password: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    }, true);
  }

  // User endpoints
  async getMe() {
    return this.request<any>('/users/me', {}, true);
  }

  async updateMe(data: { username?: string; phone?: number }) {
    return this.request<any>('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  // Person endpoints
  async listPersons(skip = 0, limit = 20) {
    return this.request<any[]>(`/persons?skip=${skip}&limit=${limit}`, {}, true);
  }
  
  async getPerson(id: number) {
    return this.request<any>(`/persons/${id}`, {}, true);
  }

  async getMyPersons() {
    return this.request<any[]>('/users/me/persons', {}, true);
  }

  async getRatings(skip = 0, limit = 20) {
    return this.request<any[]>(`/persons/ratings/top?skip=${skip}&limit=${limit}`, {}, true);
  }

  async createPerson(data: any) {
    return this.request<any>('/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async updatePerson(id: number, data: any) {
    return this.request<any>(`/persons/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  async deletePerson(id: number) {
    return this.request(`/persons/${id}`, {
      method: 'DELETE',
    }, true);
  }
  async uploadPhoto(personId: number, file: File) {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/persons/${personId}/photos`, {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${token}`,
        // Content-Type не ставим — браузер сам выставит multipart/form-data
        },
        body: formData,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Upload failed' }));
        throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
    }

    async deletePhoto(personId: number, photoId: number) {
    return this.request(`/persons/${personId}/photos/${photoId}`, {
        method: 'DELETE',
    }, true);
    }

  // Reaction endpoints
  async reactToPerson(personId: number, type: 'like' | 'dislike') {
    return this.request<any>(`/persons/${personId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ type }),
    }, true);
  }

  async removeReaction(personId: number) {
    return this.request(`/persons/${personId}/reactions`, {
      method: 'DELETE',
    }, true);
  }

  // Comment endpoints
  async listComments(personId: number, skip = 0, limit = 50) {
    return this.request<any[]>(`/persons/${personId}/comments?skip=${skip}&limit=${limit}`);
  }

  async createComment(personId: number, text: string) {
    return this.request<any>(`/persons/${personId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    }, true);
  }

  async updateComment(personId: number, commentId: number, text: string) {
    return this.request<any>(`/persons/${personId}/comments/${commentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ text }),
    }, true);
  }

  async deleteComment(personId: number, commentId: number) {
    return this.request(`/persons/${personId}/comments/${commentId}`, {
      method: 'DELETE',
    }, true);
  }

  // Photo endpoints
  async listPhotos(personId: number) {
    return this.request<any[]>(`/persons/${personId}/photos`);
  }

  // Admin endpoints
  async adminListUsers(skip = 0, limit = 50, includeDeleted = false) {
    return this.request<any[]>(`/admin/users?skip=${skip}&limit=${limit}&include_deleted=${includeDeleted}`, {}, true);
  }

  async adminGetUser(userId: number) {
    return this.request<any>(`/admin/users/${userId}`, {}, true);
  }

  async adminUpdateUser(userId: number, data: any) {
    return this.request<any>(`/admin/users/${userId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  async adminDeleteUser(userId: number, hard = false) {
    return this.request(`/admin/users/${userId}?hard=${hard}`, {
      method: 'DELETE',
    }, true);
  }

  async adminRestoreUser(userId: number) {
    return this.request<any>(`/admin/users/${userId}/restore`, {
      method: 'POST',
    }, true);
  }

  async adminSetUserRole(userId: number, isModerator: boolean, isAdmin: boolean) {
    return this.request<any>(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ is_moderator: isModerator, is_admin: isAdmin }),
    }, true);
  }

  async adminListPersons(skip = 0, limit = 50, includeDeleted = false) {
    return this.request<any[]>(`/admin/persons?skip=${skip}&limit=${limit}&include_deleted=${includeDeleted}`, {}, true);
  }

  async adminCreatePerson(data: any) {
    return this.request<any>('/admin/persons', {
      method: 'POST',
      body: JSON.stringify(data),
    }, true);
  }

  async adminUpdatePerson(personId: number, data: any) {
    return this.request<any>(`/admin/persons/${personId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  async adminDeletePerson(personId: number, hard = false) {
    return this.request(`/admin/persons/${personId}?hard=${hard}`, {
      method: 'DELETE',
    }, true);
  }

  async adminRestorePerson(personId: number) {
    return this.request<any>(`/admin/persons/${personId}/restore`, {
      method: 'POST',
    }, true);
  }

  async adminListComments(skip = 0, limit = 50, includeDeleted = false, personId?: number, userId?: number) {
    let url = `/admin/comments?skip=${skip}&limit=${limit}&include_deleted=${includeDeleted}`;
    if (personId) url += `&person_id=${personId}`;
    if (userId) url += `&user_id=${userId}`;
    return this.request<any[]>(url, {}, true);
  }

  async adminDeleteComment(commentId: number, hard = false) {
    return this.request(`/admin/comments/${commentId}?hard=${hard}`, {
      method: 'DELETE',
    }, true);
  }

  async adminRestoreComment(commentId: number) {
    return this.request<any>(`/admin/comments/${commentId}/restore`, {
      method: 'POST',
    }, true);
  }

  async adminGetPerson(personId: number) {
    return this.request<any>(`/admin/persons/${personId}`, {}, true);
  }

  
  async updatePersonStatus(personId: number, data: {
    status: string;
    consent_note?: string;
    contact_email?: string;
  }) {
    return this.request<any>(`/persons/${personId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, true);
  }

  async createReport(data: {
    person_id?: number;
    name: string;
    email: string;
    type: string;
    message: string;
  }) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async adminListReports(skip = 0, limit = 50, status?: string) {
    const url = status
      ? `/reports?skip=${skip}&limit=${limit}&status=${status}`
      : `/reports?skip=${skip}&limit=${limit}`;
    return this.request<any[]>(url, {}, true);
  }

  async adminUpdateReportStatus(reportId: number, status: string) {
    return this.request<any>(`/reports/${reportId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }, true);
  }
}

export const api = new ApiService();
