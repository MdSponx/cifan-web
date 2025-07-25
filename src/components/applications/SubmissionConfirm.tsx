import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import AnimatedButton from '../ui/AnimatedButton';
import { ApplicationService, FilmApplication, ValidationResult, SubmissionProgress } from '../../services/applicationService';

interface SubmissionConfirmProps {
  application: FilmApplication;
  isOpen: boolean;
  onClose: () => void;
  onSubmitted: () => void;
}

const SubmissionConfirm: React.FC<SubmissionConfirmProps> = ({
  application,
  isOpen,
  onClose,
  onSubmitted
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const currentLanguage = i18n.language as 'en' | 'th';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState<SubmissionProgress | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      // Validate application when modal opens
      const applicationService = new ApplicationService();
      const validation = applicationService.validateBeforeSubmit(application);
      setValidationResult(validation);
      setError(null);
      setSubmissionProgress(null);
    }
  }, [isOpen, application]);

  const handleSubmit = async () => {
    if (!validationResult?.isValid) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const applicationService = new ApplicationService((progress) => {
        setSubmissionProgress(progress);
      });

      await applicationService.submitApplication(application.id);
      
      // Wait a moment to show completion
      setTimeout(() => {
        onSubmitted();
        onClose();
      }, 1500);

    } catch (error) {
      console.error('Submission error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-container rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📤</div>
            <h2 className={`text-2xl ${getClass('header')} text-white mb-2`}>
              {currentLanguage === 'th' ? 'ยืนยันการส่งใบสมัคร' : 'Confirm Submission'}
            </h2>
            <p className={`${getClass('body')} text-white/80`}>
              {currentLanguage === 'th' 
                ? 'กรุณาตรวจสอบข้อมูลก่อนส่งใบสมัคร หลังจากส่งแล้วจะไม่สามารถแก้ไขได้'
                : 'Please review your application before submitting. Once submitted, it cannot be edited.'
              }
            </p>
          </div>

          {/* Submission Progress */}
          {submissionProgress && (
            <div className="mb-6">
              <div className="glass-card p-4 rounded-xl">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FCB283]"></div>
                  <span className={`${getClass('body')} text-white`}>
                    {submissionProgress.message}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-[#FCB283] to-[#AA4626] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${submissionProgress.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <div className="glass-card p-4 rounded-xl border-l-4 border-red-400">
                <div className="flex items-start space-x-3">
                  <span className="text-red-400 text-xl">❌</span>
                  <div>
                    <h4 className={`${getClass('subtitle')} text-red-400 mb-1`}>
                      {currentLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Submission Error'}
                    </h4>
                    <p className={`text-sm ${getClass('body')} text-white/80`}>
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Results */}
          {validationResult && (
            <div className="mb-6 space-y-4">
              
              {/* Validation Errors */}
              {validationResult.errors.length > 0 && (
                <div className="glass-card p-4 rounded-xl border-l-4 border-red-400">
                  <h4 className={`${getClass('subtitle')} text-red-400 mb-3`}>
                    {currentLanguage === 'th' ? 'ข้อมูลที่จำเป็นยังไม่ครบ' : 'Required Information Missing'}
                  </h4>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className={`text-sm ${getClass('body')} text-white/80 flex items-start`}>
                        <span className="text-red-400 mr-2">•</span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Validation Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="glass-card p-4 rounded-xl border-l-4 border-yellow-400">
                  <h4 className={`${getClass('subtitle')} text-yellow-400 mb-3`}>
                    {currentLanguage === 'th' ? 'คำแนะนำ' : 'Recommendations'}
                  </h4>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className={`text-sm ${getClass('body')} text-white/80 flex items-start`}>
                        <span className="text-yellow-400 mr-2">•</span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success State */}
              {validationResult.isValid && validationResult.errors.length === 0 && (
                <div className="glass-card p-4 rounded-xl border-l-4 border-green-400">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 text-xl">✅</span>
                    <div>
                      <h4 className={`${getClass('subtitle')} text-green-400 mb-1`}>
                        {currentLanguage === 'th' ? 'พร้อมส่งใบสมัคร' : 'Ready to Submit'}
                      </h4>
                      <p className={`text-sm ${getClass('body')} text-white/80`}>
                        {currentLanguage === 'th' 
                          ? 'ข้อมูลครบถ้วนและพร้อมส่งใบสมัคร'
                          : 'All required information is complete and ready for submission.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Application Summary */}
          {validationResult?.isValid && (
            <div className="mb-6">
              <h3 className={`text-lg ${getClass('header')} text-white mb-4`}>
                {currentLanguage === 'th' ? 'สรุปใบสมัคร' : 'Application Summary'}
              </h3>
              
              <div className="space-y-3">
                <div className="glass-card p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className={`text-sm ${getClass('subtitle')} text-white/80 mb-1`}>
                        {currentLanguage === 'th' ? 'ชื่อภาพยนตร์' : 'Film Title'}
                      </h4>
                      <p className={`${getClass('body')} text-white`}>
                        {currentLanguage === 'th' && application.filmTitleTh 
                          ? application.filmTitleTh 
                          : application.filmTitle}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm ${getClass('subtitle')} text-white/80 mb-1`}>
                        {currentLanguage === 'th' ? 'ประเภท' : 'Category'}
                      </h4>
                      <p className={`${getClass('body')} text-[#FCB283] capitalize`}>
                        {application.competitionCategory}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm ${getClass('subtitle')} text-white/80 mb-1`}>
                        {currentLanguage === 'th' ? 'รูปแบบ' : 'Format'}
                      </h4>
                      <p className={`${getClass('body')} text-white capitalize`}>
                        {application.format.replace('-', ' ')}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className={`text-sm ${getClass('subtitle')} text-white/80 mb-1`}>
                        {currentLanguage === 'th' ? 'ความยาว' : 'Duration'}
                      </h4>
                      <p className={`${getClass('body')} text-white`}>
                        {application.duration} {currentLanguage === 'th' ? 'นาที' : 'minutes'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Files Summary */}
                <div className="glass-card p-4 rounded-xl">
                  <h4 className={`text-sm ${getClass('subtitle')} text-white/80 mb-3`}>
                    {currentLanguage === 'th' ? 'ไฟล์ที่แนบ' : 'Attached Files'}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${getClass('body')} text-white/80`}>
                        🎬 {application.files.filmFile.fileName}
                      </span>
                      <span className={`text-xs ${getClass('body')} text-[#FCB283]`}>
                        {formatFileSize(application.files.filmFile.fileSize)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm ${getClass('body')} text-white/80`}>
                        🖼️ {application.files.posterFile.fileName}
                      </span>
                      <span className={`text-xs ${getClass('body')} text-[#FCB283]`}>
                        {formatFileSize(application.files.posterFile.fileSize)}
                      </span>
                    </div>
                    {application.files.proofFile && (
                      <div className="flex justify-between items-center">
                        <span className={`text-sm ${getClass('body')} text-white/80`}>
                          📄 {application.files.proofFile.fileName}
                        </span>
                        <span className={`text-xs ${getClass('body')} text-[#FCB283]`}>
                          {formatFileSize(application.files.proofFile.fileSize)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <AnimatedButton
              variant="outline"
              size="large"
              onClick={onClose}
              className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {currentLanguage === 'th' ? 'ยกเลิก' : 'Cancel'}
            </AnimatedButton>
            
            <AnimatedButton
              variant="primary"
              size="large"
              icon="📤"
              onClick={handleSubmit}
              className={(!validationResult?.isValid || isSubmitting) ? 'opacity-50 cursor-not-allowed' : ''}
            >
              {isSubmitting 
                ? (currentLanguage === 'th' ? 'กำลังส่ง...' : 'Submitting...')
                : (currentLanguage === 'th' ? 'ยืนยันส่งใบสมัคร' : 'Confirm Submission')
              }
            </AnimatedButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmissionConfirm;
