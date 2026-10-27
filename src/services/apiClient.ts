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
  private token: string | null = null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('satyasetu_auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) localStorage.setItem('satyasetu_auth_token', token);
      else localStorage.removeItem('satyasetu_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
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

  // --- IDP & Multilingual OCR Endpoints (Phase 4) ---

  async processDocumentIdp(params: {
    documentId: string;
    applicationId: string;
    fileName: string;
    category: string;
    fileSizeBytes?: number;
    mimeType?: string;
    institutionName?: string;
    registrationNumber?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/idp/process', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async extractSyncIdp(params: {
    documentId: string;
    applicationId: string;
    fileName: string;
    category: string;
    fileSizeBytes?: number;
    mimeType?: string;
    institutionName?: string;
    registrationNumber?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/idp/extract-sync', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getIdpJob(jobId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/idp/jobs/${jobId}`);
  }

  async getIdpJobs(limit = 20): Promise<ApiResponse> {
    return this.request(`/api/v1/idp/jobs?limit=${limit}`);
  }

  async getIdpCategories(): Promise<ApiResponse> {
    return this.request('/api/v1/idp/categories');
  }

  // --- Compliance Verification & Concordance Engine (Phase 5) ---

  async evaluateCompliance(payload: {
    applicationId?: string;
    application?: any;
    documents?: any[];
    idpResult?: any;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/compliance/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getApplicationCompliance(applicationId: string): Promise<ApiResponse> {
    return this.request(`/api/v1/compliance/applications/${applicationId}`);
  }

  async checkConcordance(declared: any, extractedEntities?: any): Promise<ApiResponse> {
    return this.request('/api/v1/compliance/concordance', {
      method: 'POST',
      body: JSON.stringify({ declared, extractedEntities }),
    });
  }

  async calculateCadre(params: any = {}): Promise<ApiResponse> {
    return this.request('/api/v1/compliance/calculus/cadre', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async calculateInfrastructure(params: any = {}): Promise<ApiResponse> {
    return this.request('/api/v1/compliance/calculus/infrastructure', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async getComplianceRules(): Promise<ApiResponse> {
    return this.request('/api/v1/compliance/rules');
  }

  // --- Institutional Identity & Security (Phase 6) ---

  async login(email: string, password?: string): Promise<ApiResponse> {
    const res = await this.request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (res.success && res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async verifyMfa(mfaSessionId: string, code: string): Promise<ApiResponse> {
    const res = await this.request('/api/v1/auth/mfa/verify', {
      method: 'POST',
      body: JSON.stringify({ mfaSessionId, code }),
    });
    if (res.success && res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async setupMfa(): Promise<ApiResponse> {
    return this.request('/api/v1/auth/mfa/setup', { method: 'POST' });
  }

  async confirmMfa(code: string): Promise<ApiResponse> {
    return this.request('/api/v1/auth/mfa/confirm', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse> {
    const res = await this.request('/api/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    if (res.success && res.data?.accessToken) {
      this.setToken(res.data.accessToken);
    }
    return res;
  }

  async logout(refreshToken?: string): Promise<ApiResponse> {
    const res = await this.request('/api/v1/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    this.setToken(null);
    return res;
  }

  async getAuthProfile(): Promise<ApiResponse> {
    return this.request('/api/v1/auth/me');
  }

  // --- Statutory Government Integrations (Phase 6) ---

  async pullDigiLockerDocument(params: {
    docUri: string;
    docType: 'CHARTER' | 'AFFILIATION_ORDER' | 'ACCREDITATION_CERT' | 'DEGREE' | 'LAND_TITLE';
    consent: boolean;
    institutionAisheCode: string;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/integrations/digilocker/pull', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async verifyAadhaarESign(params: {
    documentId: string;
    fileName: string;
    signatureHex?: string;
    signerAadhaarRef?: string;
  }): Promise<ApiResponse> {
    return this.request('/api/v1/integrations/esign/verify', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async syncAisheRegistry(aisheCode: string): Promise<ApiResponse> {
    return this.request('/api/v1/integrations/aishe/sync', {
      method: 'POST',
      body: JSON.stringify({ aisheCode }),
    });
  }

  async getIntegrationStatuses(): Promise<ApiResponse> {
    return this.request('/api/v1/integrations/status');
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

