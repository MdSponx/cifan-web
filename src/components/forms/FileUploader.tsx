import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import { validateFileForUpload, formatFileSize, isImageFile, isVideoFile, createFilePreview, cleanupFilePreview } from '../../utils/fileUpload';
import { FILE_TYPES } from '../../utils/formConstants';
import ErrorMessage from './ErrorMessage';

interface FileUploaderProps {
  name: string;
  label: string;
  accept: string;
  fileType: keyof typeof FILE_TYPES;
  required?: boolean;
  onFileChange: (file: File | null) => void;
  error?: string;
  currentFile?: File | null;
  className?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  name,
  label,
  accept,
  fileType,
  required = false,
  onFileChange,
  error,
  currentFile,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const config = FILE_TYPES[fileType];
  const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));

  const handleFileChange = (file: File | null) => {
    // Cleanup previous preview
    if (previewUrl) {
      cleanupFilePreview(previewUrl);
      setPreviewUrl(null);
    }

    if (!file) {
      onFileChange(null);
      return;
    }

    // Validate file
    const validation = validateFileForUpload(file, fileType);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    // Create preview for images
    if (isImageFile(file)) {
      const preview = createFilePreview(file);
      setPreviewUrl(preview);
    }

    onFileChange(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileChange(files[0]);
    }
  };

  const handleRemoveFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    handleFileChange(null);
  };

  const getFileIcon = (file: File) => {
    if (isImageFile(file)) return '🖼️';
    if (isVideoFile(file)) return '🎬';
    if (file.type === 'application/pdf') return '📄';
    return '📄';
  };

  const getDefaultIcon = () => {
    switch (fileType) {
      case 'VIDEO':
        return '🎬';
      case 'IMAGE':
        return '🖼️';
      case 'DOCUMENT':
        return '📄';
      default:
        return '📁';
    }
  };

  return (
    <div className={className}>
      <label className={`block text-white/90 ${getClass('body')} mb-2`}>
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      {/* File Input Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver
            ? 'border-[#FCB283] bg-[#FCB283]/10'
            : error
            ? 'border-red-400'
            : 'border-white/20 hover:border-white/40'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          name={name}
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          required={required}
        />
        
        {currentFile ? (
          /* File Selected */
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-3">
              <span className="text-2xl">{getFileIcon(currentFile)}</span>
              <div className="text-left">
                <div className={`text-white ${getClass('body')} font-medium`}>
                  {currentFile.name}
                </div>
                <div className="text-white/60 text-sm">
                  {formatFileSize(currentFile.size)}
                </div>
              </div>
            </div>
            
            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-3">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-32 mx-auto rounded-lg object-cover"
                />
              </div>
            )}
            
            <button
              type="button"
              onClick={handleRemoveFile}
              className="text-red-400 hover:text-red-300 text-sm underline"
            >
              {currentLanguage === 'th' ? 'ลบไฟล์' : 'Remove File'}
            </button>
          </div>
        ) : (
          /* No File Selected */
          <div className="text-center">
            <div className="text-4xl mb-3">{getDefaultIcon()}</div>
            <div className={`text-white/80 ${getClass('body')} mb-2`}>
              {currentLanguage === 'th' 
                ? 'คลิกเพื่อเลือกไฟล์ หรือลากไฟล์มาวางที่นี่'
                : 'Click to select file or drag and drop here'
              }
            </div>
            <div className="text-white/60 text-sm">
              {currentLanguage === 'th' 
                ? `ไฟล์ที่รองรับ: ${accept} (สูงสุด ${maxSizeMB}MB)`
                : `Supported files: ${accept} (max ${maxSizeMB}MB)`
              }
            </div>
          </div>
        )}
      </div>
      
      <ErrorMessage error={error} />
    </div>
  );
};

export default FileUploader;
