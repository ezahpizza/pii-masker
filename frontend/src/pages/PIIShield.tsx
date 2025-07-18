import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FileUpload } from '@/components/FileUpload';

import { PIIAnalysisResult } from '@/components/PIIAnalysisResult';
import { MaskedImageResult } from '@/components/MaskedImageResult';
import { usePIIAnalysis, usePIIMasking } from '@/hooks/usePIIMutations';
import { PIIAnalysisResponse } from '@/lib/api';

const PIIShield = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [analysisResult, setAnalysisResult] = useState<PIIAnalysisResponse | null>(null);
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  const [piiCount, setPiiCount] = useState(0);

  const analysisMutation = usePIIAnalysis();
  const maskingMutation = usePIIMasking();

  const handleAnalyzePII = () => {
    if (!selectedFile) return;
    
    analysisMutation.mutate(selectedFile, {
      onSuccess: (data) => {
        setAnalysisResult(data);
      }
    });
  };

  const handleMaskPII = () => {
    if (!selectedFile) return;
    
    maskingMutation.mutate({ file: selectedFile }, {
      onSuccess: (data) => {
        const imageUrl = URL.createObjectURL(data.imageBlob);
        setMaskedImageUrl(imageUrl);
        setPiiCount(data.piiCount);
      }
    });
  };

  const resetResults = () => {
    setAnalysisResult(null);
    setMaskedImageUrl(null);
    setPiiCount(0);
  };

  React.useEffect(() => {
    resetResults();
  }, [selectedFile]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow mr-4"
            >
              <Shield className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent"
            >
              PII Shield
            </motion.h1>
          </div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            PII Redaction for Identity Documents
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-muted-foreground mt-4 max-w-xl mx-auto"
          >
            Protect sensitive information in your documents with OCR detection 
            and intelligent masking .
          </motion.p>
        </motion.div>


        <div className="max-w-4xl mx-auto">
          <div className="relative flex flex-col lg:flex-row items-center justify-center min-h-[400px] mb-8">

            <motion.div
              initial={{ x: 0, opacity: 1 }}
              animate={analysisResult || maskedImageUrl ? { x: -180, opacity: 1 } : { x: 0, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 80, damping: 18 }}
              className={`z-10 w-full lg:w-1/2 flex flex-col items-center ${analysisResult || maskedImageUrl ? 'justify-start' : 'justify-center'} space-y-6`}
            >
              <FileUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                disabled={analysisMutation.isPending || maskingMutation.isPending}
              />
              {selectedFile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="grid grid-cols-2 gap-4"
                >
                  <Button
                    onClick={handleAnalyzePII}
                    disabled={analysisMutation.isPending || maskingMutation.isPending}
                    variant="outline"
                    className="relative"
                  >
                    {analysisMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    {analysisMutation.isPending ? 'Analyzing...' : 'Analyze PII'}
                  </Button>
                  <Button
                    onClick={handleMaskPII}
                    disabled={analysisMutation.isPending || maskingMutation.isPending}
                    variant="glow"
                    className="relative"
                  >
                    {maskingMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4 mr-2" />
                    )}
                    {maskingMutation.isPending ? 'Masking...' : 'Mask PII'}
                  </Button>
                </motion.div>
              )}
            </motion.div>


            {(analysisResult || maskedImageUrl) && (
              <motion.div
                initial={{ x: 180, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 18 }}
                className="w-full lg:w-1/2 space-y-6 z-20"
              >
                {analysisResult && (
                  <PIIAnalysisResult data={analysisResult} />
                )}
                {maskedImageUrl && (
                  <MaskedImageResult
                    imageUrl={maskedImageUrl}
                    piiCount={piiCount}
                  />
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PIIShield;