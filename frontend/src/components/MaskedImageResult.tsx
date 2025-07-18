import { motion } from 'framer-motion';
import { Download, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface MaskedImageResultProps {
  imageUrl: string;
  piiCount: number;
}

export const MaskedImageResult = ({ imageUrl, piiCount }: MaskedImageResultProps) => {
  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `masked_image.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-card border rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <h3 className="text-lg font-semibold">Masked Image</h3>
        </div>
      </div>
      
      <div className="relative bg-muted/20 rounded-lg p-4 mb-4">
        <img
          src={imageUrl}
          alt="Masked image with PII redacted"
          className="w-full h-auto max-h-96 object-contain mx-auto rounded-lg border"
        />
      </div>
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          PII has been successfully masked. You can now safely share this image.
        </p>
        <Button onClick={downloadImage} variant="glow" className="ml-4">
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>
    </motion.div>
  );
};