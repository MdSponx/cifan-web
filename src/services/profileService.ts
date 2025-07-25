import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { db, storage, auth } from '../firebase';
import { UserProfile, ProfileFormData } from '../types/profile.types';

export class ProfileService {
  private static instance: ProfileService;

  static getInstance(): ProfileService {
    if (!ProfileService.instance) {
      ProfileService.instance = new ProfileService();
    }
    return ProfileService.instance;
  }

  /**
   * Create a new user profile
   */
  async createProfile(profileData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const profile: UserProfile = {
        ...profileData,
        uid: user.uid,
        age: this.calculateAge(profileData.birthDate),
        isProfileComplete: this.validateProfileComplete({
          ...profileData,
          uid: user.uid,
          age: this.calculateAge(profileData.birthDate),
          createdAt: new Date(),
          updatedAt: new Date()
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'profiles', user.uid), {
        ...profile,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: profile.fullNameEN,
        photoURL: profile.photoURL
      });

    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  /**
   * Update existing user profile
   */
  async updateProfile(profileData: Partial<UserProfile>): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Calculate age if birthDate is provided
      if (profileData.birthDate) {
        profileData.age = this.calculateAge(profileData.birthDate);
      }

      // Get current profile to check completeness
      const currentProfile = await this.getProfile(user.uid);
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...profileData };
        profileData.isProfileComplete = this.validateProfileComplete(updatedProfile);
      }

      const updateData = {
        ...profileData,
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'profiles', user.uid), updateData);

      // Update Firebase Auth profile if display name or photo changed
      const authUpdates: any = {};
      if (profileData.fullNameEN) {
        authUpdates.displayName = profileData.fullNameEN;
      }
      if (profileData.photoURL !== undefined) {
        authUpdates.photoURL = profileData.photoURL;
      }

      if (Object.keys(authUpdates).length > 0) {
        await updateProfile(user, authUpdates);
      }

    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get user profile by UID
   */
  async getProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, 'profiles', uid));
      
      if (profileDoc.exists()) {
        const data = profileDoc.data();
        return {
          ...data,
          birthDate: data.birthDate?.toDate() || new Date(),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser;
    if (!user) return null;
    
    return this.getProfile(user.uid);
  }

  /**
   * Upload profile photo
   */
  async uploadProfilePhoto(file: File): Promise<string> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Validate file
      this.validatePhotoFile(file);

      // Delete existing photo if it exists
      const currentProfile = await this.getCurrentUserProfile();
      if (currentProfile?.photoURL) {
        await this.deleteProfilePhoto(currentProfile.photoURL);
      }

      // Upload new photo
      const photoRef = ref(storage, `profiles/${user.uid}/photo_${Date.now()}`);
      const snapshot = await uploadBytes(photoRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      throw error;
    }
  }

  /**
   * Delete profile photo
   */
  async deleteProfilePhoto(photoURL: string): Promise<void> {
    try {
      // Extract the path from the URL and delete from storage
      const photoRef = ref(storage, photoURL);
      await deleteObject(photoRef);
    } catch (error) {
      // Don't throw error if file doesn't exist
      console.warn('Error deleting profile photo:', error);
    }
  }

  /**
   * Validate if profile is complete
   */
  validateProfileComplete(profile: UserProfile): boolean {
    return !!(
      profile.fullNameEN &&
      profile.birthDate &&
      profile.phoneNumber &&
      profile.email
    );
  }

  /**
   * Calculate age from birth date
   */
  calculateAge(birthDate: Date): number {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate photo file
   */
  private validatePhotoFile(file: File): void {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (file.size > maxSize) {
      throw new Error('File size must be less than 5MB');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Only JPEG, PNG, and WebP images are allowed');
    }
  }

  /**
   * Create profile from form data
   */
  async createProfileFromForm(formData: ProfileFormData): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      let photoURL: string | undefined;

      // Upload photo if provided
      if (formData.photoFile) {
        photoURL = await this.uploadProfilePhoto(formData.photoFile);
      }

      const profileData: Omit<UserProfile, 'uid' | 'createdAt' | 'updatedAt'> = {
        email: user.email!,
        emailVerified: user.emailVerified,
        photoURL,
        fullNameEN: formData.fullNameEN,
        fullNameTH: formData.fullNameTH,
        birthDate: new Date(formData.birthDate),
        age: this.calculateAge(new Date(formData.birthDate)),
        phoneNumber: formData.phoneNumber,
        isProfileComplete: true
      };

      await this.createProfile(profileData);
    } catch (error) {
      console.error('Error creating profile from form:', error);
      throw error;
    }
  }

  /**
   * Update profile from form data
   */
  async updateProfileFromForm(formData: ProfileFormData): Promise<void> {
    try {
      let photoURL: string | undefined;

      // Upload photo if provided
      if (formData.photoFile) {
        photoURL = await this.uploadProfilePhoto(formData.photoFile);
      }

      const updateData: Partial<UserProfile> = {
        fullNameEN: formData.fullNameEN,
        fullNameTH: formData.fullNameTH,
        birthDate: new Date(formData.birthDate),
        phoneNumber: formData.phoneNumber
      };

      if (photoURL !== undefined) {
        updateData.photoURL = photoURL;
      }

      await this.updateProfile(updateData);
    } catch (error) {
      console.error('Error updating profile from form:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const profileService = ProfileService.getInstance();
