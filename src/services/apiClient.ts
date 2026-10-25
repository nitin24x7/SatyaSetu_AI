/**
 * SatyaSetu AI — Production API Client (Phase 3 Gateway Bridge)
 * Supports REST & GraphQL endpoints with automatic resilience
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  timestamp?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    try {
      const response = await fetch(url, { ...options, headers });
      const data = await response.json();
      return data;
    } catch (err: any) {
      console.warn(`[API Client Network Warning] ${url}:`, err.message);
      return {
        success: false,
        data: null as any,
        error: { code: 'NETWORK_ERROR', message: err.message },
      };
    }
  }

  // --- REST Endpoints ---

  async getApplications(params: Record<string, any> = {}): Promise<ApiResponse> {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/v1/applications?${query}`);
  }

  async getApplicationById(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}`);
  }

  async createApplication(payload: any, isSubmit = false): Promise<ApiResponse> {
    return this.request('/api/v1/applications', {
      method: 'POST',
      body: JSON.stringify({ ...payload, isSubmit }),
    });
  }

  async startVerification(id: string): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}/verify`, { method: 'POST' });
  }

  async assignReviewer(id: string, reviewerId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}/assign`, {
      method: 'POST',
      body: JSON.stringify({ reviewerId }),
    });
  }

  async requestCorrections(
    id: string,
    findingIds: string[],
    comment: string,
    dueDate?: string
  ): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}/corrections`, {
      method: 'POST',
      body: JSON.stringify({ findingIds, comment, dueDate }),
    });
  }

  async resubmit(id: string, applicantResponse: string, updatedDocs?: any[]): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}/resubmit`, {
      method: 'POST',
      body: JSON.stringify({ applicantResponse, updatedDocs }),
    });
  }

  async recordDecision(
    id: string,
    decision: 'Verified' | 'Rejected',
    reasonOrComment: string
  ): Promise<ApiResponse> {
    return this.request(`/api/v1/applications/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, reasonOrComment }),
    });
  }

  async getPresignedUploadTicket(params: {
    applicationId: string;
    category: string;
    fileName: string;
    mimeType: string;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/documents/presigned-url', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getInstitutions(): Promise<ApiResponse> {
    return this.request('/api/v1/institutions');
  }

  async getAuditLogs(): Promise<ApiResponse> {
    return this.request('/api/v1/audit-logs');
  }

  async getAnalytics(): Promise<ApiResponse> {
    return this.request('/api/v1/reports/analytics');
  }

  async checkHealth(): Promise<any> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      return await res.json();
    } catch (err: any) {
      return { status: 'OFFLINE', error: err.message };
    }
  }

  // --- GraphQL Endpoint ---

  async graphql<T = any>(queryStr: string, variables: Record<string, any> = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: queryStr, variables }),
    });
    const json = await res.json();
    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL Error');
    }
    return json.data;
  }
}

export const apiClient = new ApiClient();
