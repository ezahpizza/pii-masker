import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, MapPin } from 'lucide-react';

interface PIIDetection {
  text: string;
  pii_types: string[];
  bbox: [number, number, number, number];
}

interface PIIAnalysisData {
  total_text_regions: number;
  pii_detections: number;
  detected_pii: PIIDetection[];
}

interface PIIAnalysisResultProps {
  data: PIIAnalysisData;
}

export const PIIAnalysisResult: React.FC<PIIAnalysisResultProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card border rounded-lg p-6"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Shield className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">PII Analysis Results</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Text Regions</span>
          </div>
          <p className="text-2xl font-bold text-primary">{data.total_text_regions}</p>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="w-4 h-4 text-destructive" />
            <span className="text-sm text-muted-foreground">PII Detected</span>
          </div>
          <p className="text-2xl font-bold text-destructive">{data.pii_detections}</p>
        </div>
      </div>
      
      {data.detected_pii.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Detected PII Details</h4>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {data.detected_pii.map((detection, index) => (
              <div key={index} className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-destructive" />
                    <span className="font-medium text-sm">PII Found</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {detection.pii_types.map((type, typeIndex) => (
                      <span
                        key={typeIndex}
                        className="px-2 py-1 text-xs bg-destructive/20 text-destructive rounded-full"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm font-mono bg-background/50 p-2 rounded border">
                  "{detection.text}"
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Location: ({detection.bbox[0]}, {detection.bbox[1]}) - ({detection.bbox[2]}, {detection.bbox[3]})
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {data.detected_pii.length === 0 && (
        <div className="text-center py-8">
          <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-lg font-medium text-green-500">No PII Detected</p>
          <p className="text-muted-foreground">This image appears to be safe from personally identifiable information.</p>
        </div>
      )}
    </motion.div>
  );
};