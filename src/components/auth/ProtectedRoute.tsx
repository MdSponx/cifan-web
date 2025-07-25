import React from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
  requireProfileComplete?: boolean;
  fallback?: React.ReactNode;
  onRedirect?: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireEmailVerification = false,
  requireProfileComplete = false,
  fallback,
  onRedirect
}) => {
  const { user, userProfile, loading, isEmailVerified } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#110D16] flex items-center justify-center">
        <div className="glass-container rounded-2xl p-8 text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  // Show fallback if not authenticated
  if (!user) {
    if (onRedirect) {
      onRedirect();
    }
    return fallback || (
      <div className="min-h-screen bg-[#110D16] flex items-center justify-center">
        <div className="glass-container rounded-2xl p-8 text-center max-w-md mx-4">
          <h2 className="text-2xl text-white mb-4">Authentication Required</h2>
          <p className="text-white/80 mb-6">Please sign in to access this page.</p>
          <button
            onClick={() => window.location.hash = '#auth/signin'}
            className="liquid-glass-button"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Check email verification if required
  if (requireEmailVerification && !isEmailVerified) {
    return (
      <div className="min-h-screen bg-[#110D16] flex items-center justify-center">
        <div className="glass-container rounded-2xl p-8 text-center max-w-md mx-4">
          <h2 className="text-2xl text-white mb-4">Email Verification Required</h2>
          <p className="text-white/80 mb-6">
            Please verify your email address to continue. Check your inbox for a verification link.
          </p>
          <button
            onClick={() => window.location.hash = '#auth/verify-email'}
            className="liquid-glass-button"
          >
            Verify Email
          </button>
        </div>
      </div>
    );
  }

  // Check profile completion if required
  if (requireProfileComplete && (!userProfile || !userProfile.isProfileComplete)) {
    return (
      <div className="min-h-screen bg-[#110D16] flex items-center justify-center">
        <div className="glass-container rounded-2xl p-8 text-center max-w-md mx-4">
          <h2 className="text-2xl text-white mb-4">Profile Setup Required</h2>
          <p className="text-white/80 mb-6">
            Please complete your profile to continue using the platform.
          </p>
          <button
            onClick={() => window.location.hash = '#profile/setup'}
            className="liquid-glass-button"
          >
            Complete Profile
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
