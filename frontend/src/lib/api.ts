// API utility for backend communication
// Prefer hitting the backend directly when URL is provided; otherwise fall back to Next.js API proxy
// The proxy routes at /api/auth/* will forward to the actual backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper function to format phone number to +91XXXXXXXXXX
function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If it's already 10 digits, add +91 prefix
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  
  // If it already starts with +91, return as is
  if (phone.startsWith('+91')) {
    return phone.replace(/\D/g, '').replace(/^91/, '+91');
  }
  
  // If it's 12 digits starting with 91, add + prefix
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }
  
  // Otherwise, assume it's a 10-digit number and add +91
  return `+91${digits.slice(-10)}`;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // If baseUrl is empty, use Next.js API routes as proxy (relative URLs)
    // Otherwise, use the backend URL directly
    const url = this.baseUrl 
      ? `${this.baseUrl}${endpoint}` 
      : endpoint; // endpoint already includes /api/auth/...
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, config);
      
      let data;
      try {
        const responseText = await response.text();
        data = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        // If JSON parsing fails, create a more informative error
        throw new Error(`Failed to parse response: ${response.status} ${response.statusText}. URL: ${url}`);
      }

      if (!response.ok) {
        let errorMessage = data.error || `HTTP error! status: ${response.status}`;
        
        // Provide more helpful error messages
        if (response.status === 404) {
          errorMessage = `Route not found: ${endpoint}. Please verify that the backend server is running and has the latest code deployed.`;
        } else if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        const error = new Error(errorMessage);
        // Add additional context for debugging
        (error as any).status = response.status;
        (error as any).url = url;
        (error as any).responseData = data;
        throw error;
      }

      return data;
    } catch (error: any) {
      console.error('API request failed:', {
        error: error.message,
        url: error.url || url,
        status: error.status,
        responseData: error.responseData,
      });
      throw error;
    }
  }

  // Auth endpoints
  async sendPhoneOTP(phone: string) {
    const formattedPhone = formatPhoneNumber(phone);
    return this.request<{ success: boolean; message: string }>(
      '/api/auth/send-phone-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phone: formattedPhone }),
      }
    );
  }

  async verifyPhoneOTP(phone: string, otp: string) {
    const formattedPhone = formatPhoneNumber(phone);
    return this.request<{ success: boolean; message: string }>(
      '/api/auth/verify-phone-otp',
      {
        method: 'POST',
        body: JSON.stringify({ phone: formattedPhone, otp }),
      }
    );
  }

  async sendEmailOTP(email: string) {
    return this.request<{ success: boolean; message: string }>(
      '/api/auth/send-email-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email }),
      }
    );
  }

  async verifyEmailOTP(email: string, otp: string) {
    return this.request<{ success: boolean; message: string }>(
      '/api/auth/verify-email-otp',
      {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      }
    );
  }

  async register(data: {
    phone: string;
    email: string;
    password: string;
    name: string;
    village?: string;
    district?: string;
    state: string;
    landSizeAcres: number;
    cropType: string;
    upiId?: string;
    bankAccountNumber?: string;
    bankIfscCode?: string;
    bankName?: string;
  }) {
    const formattedPhone = formatPhoneNumber(data.phone);
    return this.request<{
      success: boolean;
      message: string;
      farmer: {
        id: string;
        name: string;
        phone: string;
        email: string;
      };
      token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...data, phone: formattedPhone }),
    });
  }

  async login(phone: string, password: string) {
    const formattedPhone = formatPhoneNumber(phone);
    return this.request<{
      success: boolean;
      message: string;
      farmer: {
        id: string;
        name: string;
        phone: string;
        email: string;
        metamaskAddress?: string;
      };
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ phone: formattedPhone, password }),
    });
  }

  async getCurrentFarmer() {
    return this.request<{
      success: boolean;
      farmer: {
        id: string;
        name: string;
        phone: string;
        email: string;
        village?: string;
        district?: string;
        state?: string;
        landSizeAcres?: number;
        cropType?: string;
        upiId?: string;
        bankAccountNumber?: string;
        metamaskAddress?: string;
        isPhoneVerified: boolean;
        isEmailVerified: boolean;
      };
    }>('/api/auth/me', {
      method: 'GET',
    });
  }

  // Dashboard stats
  async getDashboard() {
    return this.request<{
      success: boolean;
      dashboard: {
        farmer: {
          name: string;
          village?: string;
          district?: string;
          state?: string;
          cropType?: string;
          landSize?: number;
        };
        stats: {
          totalLandArea: number;
          landAreaUnit: string;
          predictedYield: number;
          yieldUnit: string;
          riskScore: number;
          riskScoreUnit: string;
          activeClaims: number;
          trend: Record<string, any>;
          lastUpdated: string | null;
        };
        claims: {
          summary: Record<string, any>;
          recentClaims: any[];
        };
      };
    }>('/api/farmers/dashboard', {
      method: 'GET',
    });
  }

  // Predict yield and persist dashboard stats
  async predictYield(data: {
    cropType: string;
    landAreaValue: number;
    landAreaUnit: string;
    sowingDate?: string;
    soilType?: string;
    irrigationType?: string;
    fertilizerUsage?: number;
  }) {
    return this.request<{
      success: boolean;
      prediction: {
        predictedYield: number;
        confidence: number;
        riskLevel: 'low' | 'medium' | 'high';
        recommendations: string[];
      };
    }>('/api/farmers/predict-yield', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Claims endpoints
  async submitClaim(data: {
    cropType: string;
    affectedArea: number;
    incidentDate: string;
    incidentDescription: string;
    damageType: string;
    estimatedLoss: number;
    sowingDate?: string;
    soilType?: string;
    irrigationType?: string;
    fertilizerUsage?: number;
    landSizeAcres?: number;
    photos?: File[];
    documents?: File[];
  }) {
    const formData = new FormData();
    
    // Add text fields
    formData.append('cropType', data.cropType);
    formData.append('affectedArea', data.affectedArea.toString());
    formData.append('incidentDate', data.incidentDate);
    formData.append('incidentDescription', data.incidentDescription);
    formData.append('damageType', data.damageType);
    formData.append('estimatedLoss', data.estimatedLoss.toString());
    
    if (data.sowingDate) formData.append('sowingDate', data.sowingDate);
    if (data.soilType) formData.append('soilType', data.soilType);
    if (data.irrigationType) formData.append('irrigationType', data.irrigationType);
    if (data.fertilizerUsage) formData.append('fertilizerUsage', data.fertilizerUsage.toString());
    if (data.landSizeAcres) formData.append('landSizeAcres', data.landSizeAcres.toString());
    
    // Add files
    if (data.photos) {
      data.photos.forEach((photo) => {
        formData.append('files', photo);
      });
    }
    if (data.documents) {
      data.documents.forEach((doc) => {
        formData.append('files', doc);
      });
    }

    // Get token for auth
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const url = this.baseUrl 
      ? `${this.baseUrl}/api/claims` 
      : '/api/claims';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || 'Failed to submit claim');
    }
    return responseData;
  }

  async getClaims() {
    return this.request<{
      success: boolean;
      claims: Array<{
        id: string;
        submissionDate: string;
        cropType: string;
        claimedAmount: number;
        status: string;
        affectedArea: number;
        incidentDate: string;
        incidentDescription: string;
        blockchainTxHash?: string;
        mlApproved?: boolean;
        mlFraudScore?: number;
        mlPredictedYield?: number;
      }>;
    }>('/api/claims', {
      method: 'GET',
    });
  }

  async getClaimById(id: string) {
    return this.request<{
      success: boolean;
      claim: {
        id: string;
        submissionDate: string;
        cropType: string;
        claimedAmount: number;
        status: string;
        affectedArea: number;
        incidentDate: string;
        incidentDescription: string;
        assessorNotes?: string;
        photos: Array<{ url: string; alt: string }>;
        documents: Array<{ name: string; url: string; type: string }>;
        blockchainTxHash?: string;
        mlApproved?: boolean;
        mlFraudScore?: number;
        mlPredictedYield?: number;
        mlReason?: string;
      };
    }>(`/api/claims/${id}`, {
      method: 'GET',
    });
  }

  // Wallet connection
  async connectWallet(walletAddress: string) {
    return this.request<{
      success: boolean;
      message: string;
      metamaskAddress: string;
    }>('/api/auth/connect-metamask', {
      method: 'POST',
      body: JSON.stringify({ metamaskAddress: walletAddress }),
    });
  }
}

export const apiClient = new ApiClient(API_URL);

