import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';

interface FileUploadProgressProps {
  fileName: string;
  fileType: 'film' | 'poster' | 'proof';
  progress: number;
  status: 'idle' | 'uploading' | 'success' | 'error';
  error?: string;
  className?: string;
}

const FileUploadProgress: React.FC<FileUploadProgressProps> = ({
  fileName,
  fileType,
  progress,
  status,
  error,
  className = ''
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';

  const getFileIcon = (type: string) => {
    const icons = {
      film: '🎬',
      poster: '🖼️',
      proof: '📄'
    };
    return icons[type as keyof typeof icons] || '📁';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '📁';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'text-blue-400';
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      default: return 'text-white/70';
    }
  };

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-[#FCB283]';
    }
  };

  const getStatusText = (status: string) => {
    const statusTexts = {
      th: {
        idle: 'รอการอัปโหลด',
        uploading: 'กำลังอัปโหลด',
        success: 'อัปโหลดสำเร็จ',
        error: 'อัปโหลดล้มเหลว'
      },
      en: {
        idle: 'Ready to upload',
        uploading: 'Uploading',
        success: 'Upload complete',
        error: 'Upload failed'
      }
    };
    return statusTexts[currentLanguage][status as keyof typeof statusTexts.en];
  };

  return (
    <div className={`glass-card p-4 rounded-lg border border-white/10 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <span className="text-xl flex-shrink-0">{getFileIcon(fileType)}</span>
          <div className="flex-1 min-w-0">
            <p className={`${getClass('body')} text-white text-sm truncate`}>
              {fileName}
            </p>
            <p className={`${getClass('body')} text-xs ${getStatusColor(status)}`}>
              {getStatusText(status)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="text-lg">{getStatusIcon(status)}</span>
          {status === 'uploading' && (
            <span className={`${getClass('body')} text-white/80 text-sm`}>
              {Math.round(progress)}%
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {(status === 'uploading' || status === 'success') && (
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden mb-2">
          <div 
            className={`h-full transition-all duration-300 ${getProgressBarColor(status)}`}
            style={{ width: `${status === 'success' ? 100 : progress}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {status === 'error' && error && (
        <div className="mt-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-300">
          <p className={`${getClass('body')} text-xs`}>
            {error}
          </p>
        </div>
      )}
    </div>
  );
};

export default FileUploadProgress;