import axios from 'axios';

// Configure base URL - update this to match your backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export interface PIIAnalysisResponse {
  total_text_regions: number;
  pii_detections: number;
  detected_pii: Array<{
    text: string;
    pii_types: string[];
    bbox: [number, number, number, number];
  }>;
}

export interface MaskPIIRequest {
  file: File;
}

export interface MaskPIIResponse {
  imageBlob: Blob;
  piiCount: number;
}

export const apiService = {
  async analyzePII(file: File): Promise<PIIAnalysisResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<PIIAnalysisResponse>('/analyze-pii/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async maskPII({ file }: MaskPIIRequest): Promise<MaskPIIResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/mask-pii/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      responseType: 'blob',
    });

    const imageBlob = new Blob([response.data], { type: 'image/png' });
    const piiDetectedHeader = response.headers['x-pii-detected'];
    const piiCount = piiDetectedHeader ? parseInt(piiDetectedHeader, 10) : 0;

    return { imageBlob, piiCount };
  },
};