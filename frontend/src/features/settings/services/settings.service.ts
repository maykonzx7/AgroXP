import { apiClient } from '@/shared/services/api/client';

export interface UpdateProfileData {
  name?: string;
  phone?: string;
}

export interface UserPreferences {
  language?: string;
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
}

// Settings API
export const settingsApi = {
  // Update user profile
  updateProfile: async (data: UpdateProfileData) => {
    return apiClient.put('/auth/profile', data);
  },

  // Get user preferences (from localStorage for now)
  getPreferences: (): UserPreferences => {
    const stored = localStorage.getItem('userPreferences');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  },

  // Save user preferences (to localStorage for now)
  savePreferences: (preferences: UserPreferences) => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
  },
};

export default settingsApi;

