'use client';

import { useState, useRef } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: File[]) => void;
}

const FileUploadZone = ({ onFilesUploaded }: FileUploadZoneProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.type.startsWith('image/')
    );
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      progress: 0,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // Simulate upload progress
    newFiles.forEach((uploadedFile) => {
      simulateUpload(uploadedFile.id);
    });

    onFilesUploaded(files);
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles((prev) =>
        prev.map((file) => (file.id === fileId ? { ...file, progress } : file))
      );
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 200);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => {
      const file = prev.find((f) => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== fileId);
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-card">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="PhotoIcon" size={24} className="text-accent" />
        <h2 className="text-xl font-heading font-bold text-foreground">Farm Photos</h2>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Icon name="CloudArrowUpIcon" size={48} className="text-muted-foreground mx-auto mb-4" />
        <p className="text-foreground font-body font-medium mb-2">
          Drag & drop farm photos here
        </p>
        <p className="text-text-secondary text-sm font-body mb-4">
          or click to browse files
        </p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md font-body font-medium hover:bg-secondary/90 transition-colors duration-200"
        >
          Select Files
        </button>
      </div>

      {/* Preview Grid */}
      {uploadedFiles.length > 0 && (
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {uploadedFiles.map((file) => (
            <div key={file.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <AppImage
                  src={file.preview}
                  alt={`Farm photo preview showing ${file.file.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
              {file.progress < 100 && (
                <div className="absolute inset-0 bg-foreground/50 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 relative">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 28}`}
                        strokeDashoffset={`${2 * Math.PI * 28 * (1 - file.progress / 100)}`}
                        className="text-primary transition-all duration-200"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white text-sm font-body font-bold">
                      {file.progress}%
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1.5 bg-error text-error-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
                <Icon name="XMarkIcon" size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
