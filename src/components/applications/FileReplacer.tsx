import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import AnimatedButton from '../ui/AnimatedButton';
import { ApplicationService, FileReplaceRequest } from '../../services/applicationService';

interface FileReplacerProps {
  applicationId: string;
  fileType: 'filmFile' | 'posterFile' | 'proofFile';
  currentFileName: string;
  onFileReplaced: (newFileMetadata: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const FileReplacer: React.FC<FileReplacerProps> = ({
  applicationId,
  fileType,
  currentFileName,
  onFileReplaced,
  onError,
  disabled = false
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const getFileTypeConfig = () => {
    const configs = {
      filmFile: {
        accept: '.mp4,.mov',
        icon: '🎬',
        label: currentLanguage === 'th' ? 'ไฟล์ภาพยนตร์' : 'Film File',
        maxSize: '500MB'
      },
      posterFile: {
        accept: '.jpg,.jpeg,.png',
        icon: '🖼️',
        label: currentLanguage === 'th' ? 'โปสเตอร์' : 'Poster',
        maxSize: '10MB'
      },
      proofFile: {
        accept: '.pdf,.jpg,.jpeg,.png',
        icon: '📄',
        label: currentLanguage === 'th' ? 'หลักฐาน' : 'Proof Document',
        maxSize: '5MB'
      }
    };
    return configs[fileType];
  };

  const config = getFileTypeConfig();

  const handleFileSelect = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const applicationService = new ApplicationService();
      
      const request: FileReplaceRequest = {
        applicationId,
        fileType,
        newFile: file,
        onProgress: (progress) => {
          setUploadProgress(progress);
        }
      };

      const newFileMetadata = await applicationService.replaceFile(request);
      
      onFileReplaced(newFileMetadata);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Error replacing file:', error);
      onError(error instanceof Error ? error.message : 'Failed to replace file');
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={config.accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Current file info */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{config.icon}</span>
            <div>
              <h4 className={`text-sm ${getClass('subtitle')} text-white/80`}>
                {config.label}
              </h4>
              <p className={`text-xs ${getClass('body')} text-white/60 truncate max-w-48`}>
                {currentFileName}
              </p>
            </div>
          </div>

          {/* Replace button */}
          <AnimatedButton
            variant="secondary"
            size="small"
            icon="🔄"
            onClick={handleFileSelect}
            className={disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          >
            {currentLanguage === 'th' ? 'เปลี่ยน' : 'Replace'}
          </AnimatedButton>
        </div>

        {/* Upload progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <span className={`text-xs ${getClass('body')} text-white/80`}>
                {currentLanguage === 'th' ? 'กำลังอัปโหลด...' : 'Uploading...'}
              </span>
              <span className={`text-xs ${getClass('body')} text-[#FCB283]`}>
                {Math.round(uploadProgress)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#FCB283] to-[#AA4626] h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* File requirements */}
      <div className="text-xs text-white/60">
        <p>
          {currentLanguage === 'th' ? 'รองรับ: ' : 'Supported: '}
          {config.accept.replace(/\./g, '').toUpperCase()}
        </p>
        <p>
          {currentLanguage === 'th' ? 'ขนาดสูงสุด: ' : 'Max size: '}
          {config.maxSize}
        </p>
      </div>
    </div>
  );
};

export default FileReplacer;
