import React from 'react';
import { useState } from 'react';
import { AuthProvider } from './components/auth/AuthContext';
import Navigation from './components/layout/Navigation';
import AboutPage from './components/pages/AboutPage';
import CompetitionPage from './components/pages/CompetitionPage';
import OneHeroSection from './components/sections/OneHeroSection';
import OfficialSelectionSection from './components/sections/OfficialSelectionSection';
import QuickInfoSection from './components/sections/QuickInfoSection';
import ProgramsSection from './components/sections/ProgramsSection';
import EntertainmentExpoSection from './components/sections/EntertainmentExpoSection';
import CompetitionHighlight from './components/sections/CompetitionHighlight';
import WorkshopsSection from './components/sections/WorkshopsSection';
import CityRallySection from './components/sections/CityRallySection';
import NewsSection from './components/sections/NewsSection';
import PartnersSection from './components/sections/PartnersSection';
import Footer from './components/layout/Footer';
import AnimatedBackground from './components/ui/AnimatedBackground';
import ParticleSystem from './components/ui/ParticleSystem';
import YouthSubmissionForm from './components/pages/YouthSubmissionForm';
import FutureSubmissionForm from './components/pages/FutureSubmissionForm';
import WorldSubmissionForm from './components/pages/WorldSubmissionForm';
import SignUpPage from './components/auth/SignUpPage';
import SignInPage from './components/auth/SignInPage';
import VerifyEmailPage from './components/auth/VerifyEmailPage';
import ProfileSetupPage from './components/pages/ProfileSetupPage';
import ProfileEditPage from './components/pages/ProfileEditPage.tsx';
import MyApplicationsPage from './components/pages/MyApplicationsPage';
import ApplicationDetailPage from './components/pages/ApplicationDetailPage';
import ApplicationEditPage from './components/pages/ApplicationEditPage';
import ComingSoonPage from './components/pages/ComingSoonPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UserZoneLayout from './components/layout/UserZoneLayout';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  // Listen for navigation clicks
  React.useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentPage(hash || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Set initial page

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'about':
        return <AboutPage />;
      case 'competition':
        return <CompetitionPage />;
      case 'submit-youth':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <YouthSubmissionForm />
          </ProtectedRoute>
        );
      case 'submit-future':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <FutureSubmissionForm />
          </ProtectedRoute>
        );
      case 'submit-world':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <WorldSubmissionForm />
          </ProtectedRoute>
        );
      case 'auth/signup':
        return <SignUpPage />;
      case 'auth/signin':
        return <SignInPage />;
      case 'auth/verify-email':
        return <VerifyEmailPage />;
      case 'profile/setup':
        return (
          <ProtectedRoute requireEmailVerification={true}>
            <ProfileSetupPage />
          </ProtectedRoute>
        );
      case 'profile/edit':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <UserZoneLayout currentPage="profile/edit">
              <ProfileEditPage />
            </UserZoneLayout>
          </ProtectedRoute>
        );
      case 'my-applications':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <UserZoneLayout currentPage="my-applications">
              <MyApplicationsPage />
            </UserZoneLayout>
          </ProtectedRoute>
        );
      case 'application-edit':
        return (
          <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
            <UserZoneLayout currentPage="application-edit">
              <ApplicationEditPage applicationId="legacy" />
            </UserZoneLayout>
          </ProtectedRoute>
        );
      case 'coming-soon':
        return <ComingSoonPage />;
      default:
        // Handle application detail page with dynamic ID
        if (currentPage.startsWith('application-detail/')) {
          const applicationId = currentPage.replace('application-detail/', '');
          return (
            <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
              <UserZoneLayout currentPage="application-detail">
                <ApplicationDetailPage applicationId={applicationId} />
              </UserZoneLayout>
            </ProtectedRoute>
          );
        }
        // Handle application edit page with dynamic ID
        if (currentPage.startsWith('application-edit/')) {
          const applicationId = currentPage.replace('application-edit/', '');
          return (
            <ProtectedRoute requireEmailVerification={true} requireProfileComplete={true}>
              <UserZoneLayout currentPage="application-edit">
                <ApplicationEditPage applicationId={applicationId} />
              </UserZoneLayout>
            </ProtectedRoute>
          );
        }
        return (
          <>
            <OneHeroSection />
            <ProgramsSection />
            <OfficialSelectionSection />
            <CompetitionHighlight />
            <WorkshopsSection />
            <EntertainmentExpoSection />
            <NewsSection />
            <PartnersSection />
          </>
        );
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#110D16] text-white overflow-x-hidden relative">
        <Navigation />
        {renderPage()}
        <Footer />
        
        {/* Animated Background Elements */}
        <AnimatedBackground />
        <ParticleSystem />
      </div>
    </AuthProvider>
  );
}

export default App;
