import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const { t, i18n } = useTranslation();
  const { user, userProfile, isAuthenticated, signOut } = useAuth();
  
  // Dynamic typography classes based on language
  const getTypographyClass = (baseClass: string) => {
    return i18n.language === 'th' ? `${baseClass}-th` : `${baseClass}-en`;
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'en' ? 'th' : 'en';
    i18n.changeLanguage(newLanguage);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowAuthMenu(false);
      window.location.hash = '#home';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#110D16]/90 backdrop-blur-xl border-b border-[#3B6891]/30' 
        : 'bg-transparent'
    } z-60`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/cifan-c41c6.firebasestorage.app/o/site_files%2Ffest_logos%2Flogo%20cifan%20full%404x.png?alt=media&token=9087f171-7499-40c5-a849-b09106f84a98"
              alt="CIFAN 2025 Logo"
              className="h-8 sm:h-10 md:h-12 lg:h-14 w-auto object-contain filter brightness-0 invert"
            />
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center">
            {/* Main Navigation Links */}
            <div className="flex items-center space-x-6 xl:space-x-8 mr-8">
              <NavLink href="#home" active>{t('navigation.home')}</NavLink>
              <NavLink href="#about">{t('navigation.about')}</NavLink>
              <NavLink href="#coming-soon">{t('navigation.programs')}</NavLink>
              <NavLink href="#competition">{t('navigation.competition')}</NavLink>
              <NavLink href="#coming-soon">{t('navigation.events')}</NavLink>
              <NavLink href="#coming-soon">{t('navigation.awards')}</NavLink>
              <NavLink href="#coming-soon">{t('navigation.news')}</NavLink>
              <NavLink href="#coming-soon">{t('navigation.contact')}</NavLink>
            </div>
            
            {/* User Controls Group */}
            <div className="flex items-center space-x-2">
              {/* Language Switcher */}
              <button 
                onClick={toggleLanguage}
                className="liquid-glass-button-circle"
              >
                {t('navigation.language')}
              </button>
              
              {/* Auth Button with Dropdown */}
              <div className="relative">
                <button 
                  className="liquid-glass-button-pill"
                  onClick={() => setShowAuthMenu(!showAuthMenu)}
                >
                  {isAuthenticated ? (
                    <div className="w-6 h-6 rounded-full overflow-hidden bg-[#FCB283] flex items-center justify-center">
                      {userProfile?.photoURL ? (
                        <img
                          src={userProfile.photoURL}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-white font-bold">
                          {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                        </span>
                      )}
                    </div>
                  ) : (
                    <User size={16} className="text-white/80" />
                  )}
                </button>
              
                {/* Auth Dropdown */}
                {showAuthMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass-container rounded-xl p-2 border border-white/20 z-50">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-white/20 mb-2">
                          <p className={`text-white/90 ${getTypographyClass('nav')} text-sm font-medium`}>
                            {user?.displayName || user?.email}
                          </p>
                          <p className={`text-white/60 ${getTypographyClass('nav')} text-xs`}>
                            {user?.email}
                          </p>
                        </div>
                        <button 
                          onClick={() => {
                            setShowAuthMenu(false);
                            window.location.hash = '#profile/edit';
                          }}
                          className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors ${getTypographyClass('nav')}`}
                        >
                          👤 Profile
                        </button>
                        <button 
                          onClick={() => {
                            setShowAuthMenu(false);
                            window.location.hash = '#my-applications';
                          }}
                          className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors ${getTypographyClass('nav')}`}
                        >
                          📋 My Applications
                        </button>
                        <div className="border-t border-white/20 my-2"></div>
                        <button 
                          onClick={handleSignOut}
                          className={`w-full text-left px-4 py-2 text-red-400 hover:bg-white/10 rounded-lg transition-colors ${getTypographyClass('nav')} flex items-center gap-2`}
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => {
                            setShowAuthMenu(false);
                            window.location.hash = '#auth/signin';
                          }}
                          className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors ${getTypographyClass('nav')}`}
                        >
                          🔑 {t('navigation.signIn')}
                        </button>
                        <button 
                          onClick={() => {
                            setShowAuthMenu(false);
                            window.location.hash = '#auth/signup';
                          }}
                          className={`w-full text-left px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors ${getTypographyClass('nav')}`}
                        >
                          👤 {t('navigation.signUp')}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {/* Mobile Language Switcher */}
            <button 
              onClick={toggleLanguage}
              className="liquid-glass-button-circle"
            >
              {t('navigation.language')}
            </button>
            
            {/* Mobile Menu Button */}
            <button 
              className="glass-button p-2 rounded-lg"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <span className={`block w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
                <span className={`block w-full h-0.5 bg-white transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="py-4 space-y-3 glass-container rounded-2xl m-4 p-6">
            <MobileNavLink href="#home">{t('navigation.home')}</MobileNavLink>
            <MobileNavLink href="#about">{t('navigation.about')}</MobileNavLink>
            <MobileNavLink href="#coming-soon">{t('navigation.programs')}</MobileNavLink>
            <MobileNavLink href="#competition">{t('navigation.competition')}</MobileNavLink>
            <MobileNavLink href="#coming-soon">{t('navigation.events')}</MobileNavLink>
            <MobileNavLink href="#coming-soon">{t('navigation.awards')}</MobileNavLink>
            <MobileNavLink href="#coming-soon">{t('navigation.news')}</MobileNavLink>
            <MobileNavLink href="#coming-soon">{t('navigation.contact')}</MobileNavLink>
            
            <div className="border-t border-white/20 pt-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="text-center py-2">
                    <p className={`text-white/90 ${getTypographyClass('nav')} text-sm`}>
                      {user?.displayName || user?.email}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      window.location.hash = '#profile/edit';
                    }}
                    className={`w-full liquid-glass-button transition-colors ${getTypographyClass('nav')}`}
                  >
                    👤 Profile
                  </button>
                  <button 
                    onClick={handleSignOut}
                    className={`w-full liquid-glass-button transition-colors ${getTypographyClass('nav')}`}
                  >
                    🚪 Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      window.location.hash = '#auth/signin';
                    }}
                    className={`w-full liquid-glass-button transition-colors ${getTypographyClass('nav')}`}
                  >
                    🔑 {t('navigation.signIn')}
                  </button>
                  <button 
                    onClick={() => {
                      setIsOpen(false);
                      window.location.hash = '#auth/signup';
                    }}
                    className={`w-full liquid-glass-button transition-colors ${getTypographyClass('nav')}`}
                  >
                    👤 {t('navigation.signUp')}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, children, active = false }: { href: string; children: React.ReactNode; active?: boolean }) => {
  const { i18n } = useTranslation();
  const getTypographyClass = (baseClass: string) => {
    return i18n.language === 'th' ? `${baseClass}-th` : `${baseClass}-en`;
  };
  
  return (
  <a 
    href={href} 
    className={`font-rsu ${getTypographyClass('nav')} transition-colors duration-300 hover:text-[#FCB283] ${
      active ? 'text-[#FCB283]' : 'text-white/80'
    }`}
  >
    {children}
  </a>
  );
};

const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const { i18n } = useTranslation();
  const getTypographyClass = (baseClass: string) => i18n.language === 'th' ? `${baseClass}-th` : `${baseClass}-en`;
  
  return (
  <a 
    href={href}
    className={`block py-2 text-white/80 hover:text-[#FCB283] transition-colors duration-300 ${getTypographyClass('nav')}`}
  >
    {children}
  </a>
  );
};

export default Navigation;
