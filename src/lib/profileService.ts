import { UserProfile } from '@/components/ProfileCard';

// Event system for profile updates
export type ProfileUpdateEvent = {
  type: 'PROFILE_UPDATED';
  profileId: number;
  updatedData: Partial<UserProfile>;
  timestamp: number;
};

class ProfileUpdateManager {
  private listeners: Set<(event: ProfileUpdateEvent) => void> = new Set();

  subscribe(listener: (event: ProfileUpdateEvent) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event: ProfileUpdateEvent) {
    this.listeners.forEach(listener => listener(event));
  }
}

export const profileUpdateManager = new ProfileUpdateManager();

// TODO: These functions were removed because the API methods don't exist
// - updateProfile: Use apiService.updateEmployee_auth(formData) instead
// - getProfile: Use apiService.authUser() to get current user profile
