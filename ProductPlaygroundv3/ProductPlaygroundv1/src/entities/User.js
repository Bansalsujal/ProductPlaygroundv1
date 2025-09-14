import { apiClient } from '../lib/supabase.js';

export class User {
  static async me() {
    try {
      return await apiClient.getUser();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }
  
  // Google authentication (for the Sign In with Google buttons)
  static async login() {
    try {
      const response = await apiClient.loginWithGoogle();
      // Redirect to Google OAuth URL
      if (response.url) {
        window.location.href = response.url;
      }
      return response;
    } catch (error) {
      console.error('Error during Google login:', error);
      throw error;
    }
  }
  
  // Email/password authentication
  static async loginWithCredentials(email, password) {
    try {
      return await apiClient.login(email, password);
    } catch (error) {
      console.error('Error during credential login:', error);
      throw error;
    }
  }
  
  // User signup
  static async signup(email, password, fullName) {
    try {
      return await apiClient.signup(email, password, fullName);
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    }
  }
  
  static async logout() {
    try {
      return await apiClient.logout();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }
  
  static async updateMyUserData(data) {
    try {
      return await apiClient.updateUser(data);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }
  
  // Check if user is authenticated
  static isAuthenticated() {
    return apiClient.isAuthenticated();
  }
}