import { useMutation } from '@tanstack/react-query';
import { apiService, PIIAnalysisResponse, MaskPIIRequest, MaskPIIResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export const usePIIAnalysis = () => {
  const { toast } = useToast();

  return useMutation<PIIAnalysisResponse, Error, File>({
    mutationFn: apiService.analyzePII,
    onSuccess: (data) => {
      toast({
        title: "Analysis Complete",
        description: `Found ${data.pii_detections} PII regions in the image.`
      });
    },
    onError: (error) => {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze the image. Please try again.",
        variant: "destructive"
      });
    },
  });
};

export const usePIIMasking = () => {
  const { toast } = useToast();

  return useMutation<MaskPIIResponse, Error, MaskPIIRequest>({
    mutationFn: apiService.maskPII,
    onSuccess: (data) => {
      toast({
        title: "Masking Complete",
        description: `Successfully masked ${data.piiCount} PII regions.`
      });
    },
    onError: (error) => {
      console.error('Masking failed:', error);
      toast({
        title: "Masking Failed",
        description: "Failed to mask the image. Please try again.",
        variant: "destructive"
      });
    },
  });
};