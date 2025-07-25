import React from 'react';
import { useTranslation } from 'react-i18next';
import { useTypography } from '../../utils/typography';
import { useAuth } from '../auth/AuthContext';
import { Menu, ArrowLeft } from 'lucide-react';
import AnimatedButton from '../ui/AnimatedButton';

interface UserZoneHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
  onSidebarToggle: () => void;
  children?: React.ReactNode;
}

const UserZoneHeader: React.FC<UserZoneHeaderProps> = ({
  title,
  subtitle,
  showBackButton = false,
  backButtonText,
  onBackClick,
  onSidebarToggle,
  children
}) => {
  const { i18n } = useTranslation();
  const { getClass } = useTypography();
  const { userProfile } = useAuth();
  const currentLanguage = i18n.language as 'en' | 'th';

  const defaultBackText = currentLanguage === 'th' ? 'กลับ' : 'Back';

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      window.history.back();
    }
  };

  return (
    <div className="glass-container rounded-2xl p-4 sm:p-6 md:p-8 mb-6 sm:mb-8">
      <div className="flex items-center justify-between">
        
        {/* Left Side: Back Button + Title */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
          
          {/* Mobile Sidebar Toggle */}
          <button
            id="sidebar-toggle"
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            <Menu size={20} className="text-white/80" />
          </button>

          {/* Back Button */}
          {showBackButton && (
            <button
              onClick={handleBackClick}
              className={`flex items-center space-x-1 sm:space-x-2 text-white/80 hover:text-white transition-colors flex-shrink-0 ${getClass('menu')} text-sm sm:text-base`}
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">{backButtonText || defaultBackText}</span>
            </button>
          )}

          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl ${getClass('header')} text-white mb-1 truncate`}>
              {title}
            </h1>
            {subtitle && (
              <p className={`${getClass('subtitle')} text-white/80 text-xs sm:text-sm md:text-base truncate`}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: User Info + Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
          
          {/* Custom Actions */}
          {children}

          {/* User Avatar */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-[#FCB283] flex items-center justify-center">
              {userProfile?.photoURL ? (
                <img
                  src={userProfile.photoURL}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-sm">
                  {userProfile?.fullNameEN?.charAt(0) || 'U'}
                </span>
              )}
            </div>
            <div className="hidden lg:block">
              <p className={`${getClass('body')} text-white/90 text-sm font-medium`}>
                {userProfile?.fullNameEN || 'User'}
              </p>
              <p className={`${getClass('body')} text-white/60 text-xs`}>
                {userProfile?.email}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserZoneHeader;