import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import { validateEmail, validateAge, getValidationMessages } from '../../utils/formValidation';
import { WorldFormData, CrewMember, FormErrors, SubmissionState, FileUploadState } from '../../types/form.types';
import { SubmissionService, SubmissionProgress } from '../../services/submissionService';
import { useAuth } from '../auth/AuthContext';
import AnimatedButton from '../ui/AnimatedButton';
import CrewManagement from '../forms/CrewManagement';
import NationalitySelector from '../ui/NationalitySelector';
import GenreSelector from '../forms/GenreSelector';
import FormatSelector from '../forms/FormatSelector';
import AgreementCheckboxes from '../forms/AgreementCheckboxes';
import FormSection from '../forms/FormSection';
import ErrorMessage from '../forms/ErrorMessage';
import FileUploader from '../forms/FileUploader';
import SubmissionProgressComponent from '../ui/SubmissionProgress';
import FileUploadProgress from '../ui/FileUploadProgress';

const WorldSubmissionForm = () => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const { user, userProfile } = useAuth();
  const currentLanguage = i18n.language as 'en' | 'th';
  const validationMessages = getValidationMessages(currentLanguage);

  const [isThaiNationality, setIsThaiNationality] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    isSubmitting: false
  });
  const [fileUploadStates, setFileUploadStates] = useState<{[key: string]: FileUploadState}>({
    filmFile: { status: 'idle', progress: 0 },
    posterFile: { status: 'idle', progress: 0 },
    proofFile: { status: 'idle', progress: 0 }
  });

  // Scroll to top when component mounts (form opens)
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const [formData, setFormData] = useState<WorldFormData>({
    // User Information
    userId: user?.uid,
    applicationId: `world_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    status: 'draft',
    createdAt: new Date(),
    
    // Film Information
    filmTitle: '',
    filmTitleTh: '',
    genres: [],
    format: '',
    duration: '',
    synopsis: '',
    chiangmaiConnection: '',
    
    // Director Information - Pre-fill from user profile
    directorName: userProfile?.fullNameEN || '',
    directorNameTh: userProfile?.fullNameTH || '',
    directorAge: userProfile?.age ? userProfile.age.toString() : '',
    directorPhone: userProfile?.phoneNumber || '',
    directorEmail: user?.email || '',
    directorRole: '',
    directorCustomRole: '',
    
    // Crew Information
    crewMembers: [],
    
    // Files
    filmFile: null,
    posterFile: null,
    proofFile: null,
    
    // Agreements
    agreement1: false,
    agreement2: false,
    agreement3: false,
    agreement4: false
  });

  // Update form data when user profile changes
  React.useEffect(() => {
    if (user && userProfile) {
      setFormData(prev => ({
        ...prev,
        directorName: userProfile.fullNameEN || prev.directorName,
        directorNameTh: userProfile.fullNameTH || prev.directorNameTh,
        directorAge: userProfile.age ? userProfile.age.toString() : prev.directorAge,
        directorPhone: userProfile.phoneNumber || prev.directorPhone,
        directorEmail: user.email || prev.directorEmail,
      }));
    }
  }, [user, userProfile]);

  const content = {
    th: {
      pageTitle: "ส่งผลงานเข้าประกวด - รางวัลหนังสั้นแฟนตาสติกโลก",
      categoryTitle: "World Fantastic Short Film Award",
      prizeAmount: "460,000 บาท",
      
      // Sections
      filmInfoTitle: "ข้อมูลภาพยนตร์",
      directorInfoTitle: "ข้อมูลผู้ส่งผลงาน",
      filesTitle: "ไฟล์ที่ต้องส่ง",
      
      // Form fields
      filmTitle: "ชื่อภาพยนตร์ (ภาษาอังกฤษ)",
      filmTitleTh: "ชื่อภาพยนตร์ (ภาษาไทย)",
      duration: "ความยาว (นาที)",
      synopsis: "เรื่องย่อ (ไม่เกิน 200 คำ)",
      chiangmaiConnection: "ความเกี่ยวข้องกับเชียงใหม่",
      
      submitterName: "ชื่อ-นามสกุล ผู้ส่งผลงาน",
      submitterNameTh: "ชื่อ-นามสกุล (ภาษาไทย)",
      age: "อายุ",
      phone: "เบอร์โทรศัพท์",
      email: "อีเมล",
      roleInFilm: "บทบาทในภาพยนตร์",
      selectRole: "เลือกบทบาท",
      specifyRole: "ระบุบทบาท",
      
      filmFile: "ไฟล์ภาพยนตร์ (MP4, MOV)",
      posterFile: "โปสเตอร์ภาพยนตร์ (JPG, PNG)",
      proofFile: "หลักฐานบัตรประชาชน/พาสปอร์ต",
      
      submitButton: "ส่งผลงานเข้าประกวด",
      submitting: "กำลังส่งผลงาน...",
      successMessage: "ส่งผลงานเรียบร้อยแล้ว!"
    },
    en: {
      pageTitle: "Submit Your Film - World Fantastic Short Film Award",
      categoryTitle: "World Fantastic Short Film Award",
      prizeAmount: "460,000 THB",
      
      // Sections
      filmInfoTitle: "Film Information",
      directorInfoTitle: "Submitter Information",
      filesTitle: "Required Files",
      
      // Form fields
      filmTitle: "Film Title (English)",
      filmTitleTh: "Film Title (Thai)",
      duration: "Duration (minutes)",
      synopsis: "Synopsis (max 200 words)",
      chiangmaiConnection: "Connection to Chiang Mai",
      
      submitterName: "Submitter Full Name",
      submitterNameTh: "Full Name (Thai)",
      age: "Age",
      phone: "Phone Number",
      email: "Email",
      roleInFilm: "Role in Film",
      selectRole: "Select Role",
      specifyRole: "Specify Role",
      
      filmFile: "Film File (MP4, MOV)",
      posterFile: "Film Poster (JPG, PNG)",
      proofFile: "ID Card/Passport",
      
      submitButton: "Submit Your Film",
      submitting: "Submitting...",
      successMessage: "Submission successful!"
    }
  };

  const currentContent = content[currentLanguage];

  const validateMainForm = (): FormErrors => {
    const errors: FormErrors = {};

    // User Authentication
    if (!user?.uid || !formData.userId) {
      errors.authentication = currentLanguage === 'th' 
        ? 'กรุณาเข้าสู่ระบบก่อนส่งผลงาน' 
        : 'Please sign in before submitting your work';
    }

    // Film Information
    if (!formData.filmTitle.trim()) errors.filmTitle = validationMessages.required;
    // Thai film title only required for Thai nationality
    if (isThaiNationality && !formData.filmTitleTh?.trim()) {
      errors.filmTitleTh = validationMessages.required;
    }
    if (!formData.genres || formData.genres.length === 0) errors.genres = validationMessages.required;
    if (!formData.format) errors.format = validationMessages.formatRequired;
    if (!formData.duration) {
      errors.duration = validationMessages.required;
    } else {
      const duration = parseInt(formData.duration);
      if (isNaN(duration) || duration <= 0) {
        errors.duration = currentLanguage === 'th' ? 'กรุณากรอกความยาวที่ถูกต้อง' : 'Please enter a valid duration';
      }
    }
    if (!formData.synopsis.trim()) errors.synopsis = validationMessages.required;
    if (!formData.chiangmaiConnection.trim()) errors.chiangmaiConnection = validationMessages.required;

    // Director Information
    if (!formData.directorName.trim()) errors.submitterName = validationMessages.required;
    // Thai name only required for Thai nationality
    if (isThaiNationality && !formData.directorNameTh?.trim()) {
      errors.submitterNameTh = validationMessages.required;
    }
    if (!formData.directorAge) {
      errors.submitterAge = validationMessages.required;
    } else {
      const age = parseInt(formData.directorAge);
      if (!validateAge(age, 'WORLD')) errors.submitterAge = validationMessages.invalidAge('WORLD');
    }
    if (!formData.directorPhone.trim()) errors.submitterPhone = validationMessages.required;
    if (!formData.directorEmail.trim()) {
      errors.submitterEmail = validationMessages.required;
    } else if (!validateEmail(formData.directorEmail)) {
      errors.submitterEmail = validationMessages.invalidEmail;
    }
    if (!formData.directorRole) errors.submitterRole = validationMessages.required;
    if (formData.directorRole === 'Other' && !formData.directorCustomRole?.trim()) {
      errors.submitterCustomRole = validationMessages.required;
    }

    // Files
    if (!formData.filmFile) errors.filmFile = validationMessages.required;
    if (!formData.posterFile) errors.posterFile = validationMessages.required;
    if (!formData.proofFile) errors.proofFile = validationMessages.required;

    // Agreements
    if (!formData.agreement1 || !formData.agreement2 || !formData.agreement3 || !formData.agreement4) {
      errors.agreements = validationMessages.allAgreementsRequired;
    }

    return errors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGenreChange = (genres: string[]) => {
    setFormData(prev => ({ ...prev, genres }));
    if (formErrors.genres) {
      setFormErrors(prev => ({ ...prev, genres: '' }));
    }
  };

  const handleFormatChange = (format: 'live-action' | 'animation') => {
    setFormData(prev => ({ ...prev, format }));
    if (formErrors.format) {
      setFormErrors(prev => ({ ...prev, format: '' }));
    }
  };

  const handleCrewMembersChange = (crewMembers: CrewMember[]) => {
    setFormData(prev => ({ ...prev, crewMembers }));
    if (formErrors.crewMembers) {
      setFormErrors(prev => ({ ...prev, crewMembers: '' }));
    }
  };

  const handleAgreementChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
    if (formErrors.agreements) {
      setFormErrors(prev => ({ ...prev, agreements: '' }));
    }
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [name]: file }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle nationality change from NationalitySelector
  const handleNationalityChange = useCallback((nationality: string) => {
    // World form doesn't store nationality in formData, but we track it for Thai fields
  }, []);

  // Handle nationality type change from NationalitySelector
  const handleNationalityTypeChange = useCallback((isThaiNationality: boolean) => {
    setIsThaiNationality(isThaiNationality);
    
    // Clear Thai-specific fields when switching to International
    if (!isThaiNationality) {
      setFormData(prev => ({
        ...prev,
        filmTitleTh: '',
        directorNameTh: ''
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset submission state
    setSubmissionState({ isSubmitting: false });
    setFileUploadStates({
      filmFile: { status: 'idle', progress: 0 },
      posterFile: { status: 'idle', progress: 0 },
      proofFile: { status: 'idle', progress: 0 }
    });
    
    const errors = validateMainForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      // Scroll to first error
      const firstErrorElement = document.querySelector('.error-field');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmissionState({ isSubmitting: true });

    // Create submission service with progress callback
    const submissionService = new SubmissionService((progress: SubmissionProgress) => {
      setSubmissionState(prev => ({
        ...prev,
        progress
      }));

      // Update file upload states
      if (progress.fileProgress) {
        setFileUploadStates(prev => ({
          filmFile: { 
            status: progress.fileProgress!.film === 100 ? 'success' : 'uploading', 
            progress: progress.fileProgress!.film || 0 
          },
          posterFile: { 
            status: progress.fileProgress!.poster === 100 ? 'success' : 'uploading', 
            progress: progress.fileProgress!.poster || 0 
          },
          proofFile: { 
            status: progress.fileProgress!.proof === 100 ? 'success' : 'uploading', 
            progress: progress.fileProgress!.proof || 0 
          }
        }));
      }
    });

    try {
      const result = await submissionService.submitWorldForm(formData);
      
      setSubmissionState(prev => ({
        ...prev,
        isSubmitting: false,
        result
      }));

      if (result.success) {
        // Update file states to success
        setFileUploadStates({
          filmFile: { status: 'success', progress: 100 },
          posterFile: { status: 'success', progress: 100 },
          proofFile: { status: 'success', progress: 100 }
        });
      } else {
        // Update file states to error
        setFileUploadStates(prev => ({
          filmFile: { ...prev.filmFile, status: 'error', error: result.error },
          posterFile: { ...prev.posterFile, status: 'error', error: result.error },
          proofFile: { ...prev.proofFile, status: 'error', error: result.error }
        }));
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      setSubmissionState(prev => ({
        ...prev,
        isSubmitting: false,
        result: {
          success: false,
          error: currentLanguage === 'th' 
            ? 'เกิดข้อผิดพลาดในการส่งผลงาน กรุณาลองใหม่อีกครั้ง' 
            : 'An error occurred while submitting. Please try again.'
        }
      }));
    }
  };

  // Show success page
  if (submissionState.result?.success) {
    return (
      <div className="min-h-screen bg-[#110D16] text-white pt-16 sm:pt-20 flex items-center justify-center">
        <div className="glass-container rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-4">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className={`text-2xl sm:text-3xl ${getClass('header')} mb-4 text-white`}>
            {currentContent.successMessage}
          </h2>
          <p className={`text-white/80 ${getClass('body')} mb-6`}>
            {currentLanguage === 'th' 
              ? `ทางเทศกาลจะแจ้งผลการคัดเลือกภายใน 30 วัน ขอบคุณที่ส่งผลงานเข้าร่วม CIFAN 2025 (รหัสการส่ง: ${submissionState.result.submissionId})`
              : `The festival will announce the selection results within 30 days. Thank you for submitting to CIFAN 2025 (Submission ID: ${submissionState.result.submissionId})`
            }
          </p>
          <AnimatedButton 
            variant="primary" 
            size="medium" 
            icon="🏠"
            onClick={() => window.location.hash = '#home'}
          >
            {currentLanguage === 'th' ? 'กลับหน้าหลัก' : 'Back to Home'}
          </AnimatedButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#110D16] text-white pt-16 sm:pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex justify-center mb-6">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2FGroup%204.png?alt=media&token=84ad0256-2322-4999-8e9f-d2f30c7afa67"
              alt="World Competition Logo"
              className="h-16 sm:h-20 w-auto object-contain"
            />
          </div>
          <h1 className={`text-2xl sm:text-3xl md:text-4xl ${getClass('header')} mb-4 text-white`}>
            {currentContent.pageTitle}
          </h1>
          <p className={`text-lg sm:text-xl ${getClass('subtitle')} text-[#FCB283] mb-4`}>
            {currentContent.categoryTitle}
          </p>
          <p className={`text-xl sm:text-2xl ${getClass('subtitle')} text-[#FCB283] font-bold`}>
            {currentLanguage === 'th' ? 'รางวัลรวม: ' : 'Total Prize: '}{currentContent.prizeAmount}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          
          {/* Submission Progress */}
          {submissionState.isSubmitting && submissionState.progress && (
            <SubmissionProgressComponent 
              progress={submissionState.progress}
              className="mb-8"
            />
          )}

          {/* Error Display */}
          {submissionState.result && !submissionState.result.success && (
            <div className="glass-container rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">❌</span>
                <h3 className={`${getClass('subtitle')} text-red-400`}>
                  {currentLanguage === 'th' ? 'เกิดข้อผิดพลาด' : 'Submission Error'}
                </h3>
              </div>
              <p className={`${getClass('body')} text-red-300`}>
                {submissionState.result.error}
              </p>
              <button
                type="button"
                onClick={() => setSubmissionState({ isSubmitting: false })}
                className={`mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white ${getClass('menu')} transition-colors`}
              >
                {currentLanguage === 'th' ? 'ลองใหม่' : 'Try Again'}
              </button>
            </div>
          )}

          {/* Authentication Error Display */}
          {formErrors.authentication && (
            <div className="glass-container rounded-xl p-6 mb-8">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-2xl">🔐</span>
                <h3 className={`${getClass('subtitle')} text-red-400`}>
                  {currentLanguage === 'th' ? 'ต้องเข้าสู่ระบบ' : 'Authentication Required'}
                </h3>
              </div>
              <p className={`${getClass('body')} text-red-300 mb-4`}>
                {formErrors.authentication}
              </p>
              <button
                type="button"
                onClick={() => window.location.hash = '#signin'}
                className={`px-4 py-2 bg-[#FCB283] hover:bg-[#AA4626] rounded-lg text-white ${getClass('menu')} transition-colors`}
              >
                {currentLanguage === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}
              </button>
            </div>
          )}

          {/* Section 1: Nationality Selector */}
          {!submissionState.isSubmitting && (
            <NationalitySelector
              onNationalityChange={handleNationalityChange}
              onNationalityTypeChange={handleNationalityTypeChange}
            />
          )}

          {/* Section 2: Film Information */}
          {!submissionState.isSubmitting && (
            <FormSection title={currentContent.filmInfoTitle} icon="🎬">
            <div className="space-y-6">
              {/* Film Title Thai - Only for Thai nationality */}
              {isThaiNationality && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.filmTitleTh} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="filmTitleTh"
                    value={formData.filmTitleTh || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitleTh ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.filmTitleTh} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.filmTitle} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="filmTitle"
                  value={formData.filmTitle}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.filmTitle ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.filmTitle} />
              </div>
              
              {/* Genre Selector - Full Width */}
              <GenreSelector
                value={formData.genres}
                onChange={handleGenreChange}
                error={formErrors.genres}
                required
                label={currentLanguage === 'th' ? 'แนวภาพยนตร์' : 'Genre'}
              />
              
             {/* Format Selector - Full Width */}
             <FormatSelector
               value={formData.format}
               onChange={handleFormatChange}
               error={formErrors.format}
               required
               label={currentLanguage === 'th' ? 'รูปแบบภาพยนตร์' : 'Film Format'}
             />
             
              {/* Duration Field - Separate Row */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.duration} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.duration ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <small className="text-white/60 text-xs mt-1 block">
                  {currentLanguage === 'th' ? 'แนะนำ 5-10 นาที (ไม่บังคับ)' : 'Recommended 5-10 minutes (not mandatory)'}
                </small>
                <ErrorMessage error={formErrors.duration} />
              </div>
            
              {/* Synopsis Field */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.synopsis} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="synopsis"
                  value={formData.synopsis}
                  onChange={handleInputChange}
                  rows={4}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.synopsis ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
                />
                <ErrorMessage error={formErrors.synopsis} />
              </div>
            
              {/* Chiang Mai Connection Field */}
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.chiangmaiConnection} <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="chiangmaiConnection"
                  value={formData.chiangmaiConnection}
                  onChange={handleInputChange}
                  rows={3}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.chiangmaiConnection ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none resize-vertical`}
                />
                <ErrorMessage error={formErrors.chiangmaiConnection} />
              </div>
            </div>
            </FormSection>
          )}

          {/* Section 3: Director Information */}
          {!submissionState.isSubmitting && (
            <FormSection title={currentContent.directorInfoTitle} icon="👤">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.submitterName} <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="directorName"
                  value={formData.directorName}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterName ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterName} />
              </div>
              
              {/* Thai Name - only for Thai nationality */}
              {isThaiNationality && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.submitterNameTh} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="directorNameTh"
                    value={formData.directorNameTh || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterNameTh ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.submitterNameTh} />
                </div>
              )}
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.age} <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="directorAge"
                  value={formData.directorAge}
                  onChange={handleInputChange}
                  min="18"
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterAge ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterAge} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.phone} <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="directorPhone"
                  value={formData.directorPhone}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterPhone ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterPhone} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.email} <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="directorEmail"
                  value={formData.directorEmail}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterEmail ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                />
                <ErrorMessage error={formErrors.submitterEmail} />
              </div>
              
              <div>
                <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                  {currentContent.roleInFilm} <span className="text-red-400">*</span>
                </label>
                <select
                  name="directorRole"
                  value={formData.directorRole || ''}
                  onChange={handleInputChange}
                  className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterRole ? 'border-red-400 error-field' : 'border-white/20'} text-white focus:border-[#FCB283] focus:outline-none`}
                >
                  <option value="" className="bg-[#110D16]">{currentContent.selectRole}</option>
                  {['Director', 'Producer', 'Cinematographer', 'Editor', 'Sound Designer', 'Production Designer', 'Costume Designer', 'Makeup Artist', 'Screenwriter', 'Composer', 'Casting Director', 'Visual Effects Supervisor', 'Location Manager', 'Script Supervisor', 'Assistant Director', 'Other'].map(role => (
                    <option key={role} value={role} className="bg-[#110D16]">
                      {role}
                    </option>
                  ))}
                </select>
                <ErrorMessage error={formErrors.submitterRole} />
              </div>
              
              {/* Custom Role - only show if Other is selected */}
              {formData.directorRole === 'Other' && (
                <div>
                  <label className={`block text-white/90 ${getClass('body')} mb-2`}>
                    {currentContent.specifyRole} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="directorCustomRole"
                    value={formData.directorCustomRole || ''}
                    onChange={handleInputChange}
                    className={`w-full p-3 rounded-lg bg-white/10 border ${formErrors.submitterCustomRole ? 'border-red-400 error-field' : 'border-white/20'} text-white placeholder-white/50 focus:border-[#FCB283] focus:outline-none`}
                  />
                  <ErrorMessage error={formErrors.submitterCustomRole} />
                </div>
              )}
            </div>
            </FormSection>
          )}

          {/* Section 4: Crew Information */}
          {!submissionState.isSubmitting && (
            <CrewManagement
              crewMembers={formData.crewMembers}
              onCrewMembersChange={handleCrewMembersChange}
              isThaiNationality={isThaiNationality}
              error={formErrors.crewMembers}
              isWorldForm={true}
            />
          )}

          {/* Section 5: File Uploads */}
          {!submissionState.isSubmitting && (
            <FormSection title={currentContent.filesTitle} icon="📁">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploader
                name="filmFile"
                label={currentContent.filmFile}
                accept="video/*"
                fileType="VIDEO"
                required
                onFileChange={(file) => handleFileChange('filmFile', file)}
                error={formErrors.filmFile}
                currentFile={formData.filmFile}
              />
              
              <FileUploader
                name="posterFile"
                label={currentContent.posterFile}
                accept="image/*"
                fileType="IMAGE"
                required
                onFileChange={(file) => handleFileChange('posterFile', file)}
                error={formErrors.posterFile}
                currentFile={formData.posterFile}
              />
              
              <div className="md:col-span-2">
                <FileUploader
                  name="proofFile"
                  label={currentContent.proofFile}
                  accept="image/*,.pdf"
                  fileType="DOCUMENT"
                  required
                  onFileChange={(file) => handleFileChange('proofFile', file)}
                  error={formErrors.proofFile}
                  currentFile={formData.proofFile}
                />
              </div>
            </div>
            </FormSection>
          )}

          {/* File Upload Progress */}
          {submissionState.isSubmitting && (
            <FormSection title={currentContent.filesTitle} icon="📁">
              <div className="space-y-4">
                <FileUploadProgress
                  fileName={formData.filmFile?.name || 'Film File'}
                  fileType="film"
                  progress={fileUploadStates.filmFile.progress}
                  status={fileUploadStates.filmFile.status}
                  error={fileUploadStates.filmFile.error}
                />
                <FileUploadProgress
                  fileName={formData.posterFile?.name || 'Poster File'}
                  fileType="poster"
                  progress={fileUploadStates.posterFile.progress}
                  status={fileUploadStates.posterFile.status}
                  error={fileUploadStates.posterFile.error}
                />
                <FileUploadProgress
                  fileName={formData.proofFile?.name || 'Proof File'}
                  fileType="proof"
                  progress={fileUploadStates.proofFile.progress}
                  status={fileUploadStates.proofFile.status}
                  error={fileUploadStates.proofFile.error}
                />
              </div>
            </FormSection>
          )}

          {/* Section 6: Agreements */}
          {!submissionState.isSubmitting && (
            <AgreementCheckboxes
              agreements={{
                agreement1: formData.agreement1,
                agreement2: formData.agreement2,
                agreement3: formData.agreement3,
                agreement4: formData.agreement4
              }}
              onChange={handleAgreementChange}
              error={formErrors.agreements}
            />
          )}

          {/* Submit Button */}
          {!submissionState.isSubmitting && (
            <div className="text-center pt-8">
            <button
              type="submit"
              disabled={submissionState.isSubmitting}
              className={`w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#AA4626] to-[#FCB283] text-white rounded-lg hover:from-[#FCB283] hover:to-[#AA4626] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${getClass('menu')} flex items-center justify-center gap-2`}
            >
              <span>🎬</span>
              {submissionState.isSubmitting ? currentContent.submitting : currentContent.submitButton}
            </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default WorldSubmissionForm;
