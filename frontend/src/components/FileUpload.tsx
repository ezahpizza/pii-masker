import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  selectedFile,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      onFileSelect(imageFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const clearFile = useCallback(() => {
    onFileSelect(null as any);
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full"
    >
      {!selectedFile ? (
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 bg-dot-8-s-2-white",
            isDragOver ? "border-primary bg-primary/5" : "border-muted",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-primary/50"
          )}
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onClick={() => !disabled && document.getElementById('file-input')?.click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".jpg,.jpeg,.png"
            onChange={handleFileInput}
            className="hidden"
            disabled={disabled}
          />
          
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Upload Image</h3>
          <p className="text-muted-foreground mb-4">
            Drag and drop an image here, or click to select
          </p>
          <p className="text-sm text-muted-foreground">
            Supports JPG, JPEG, and PNG files
          </p>
        </div>
      ) : (
        <div className="relative bg-card border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              disabled={disabled}
              className="p-1 hover:bg-destructive/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};