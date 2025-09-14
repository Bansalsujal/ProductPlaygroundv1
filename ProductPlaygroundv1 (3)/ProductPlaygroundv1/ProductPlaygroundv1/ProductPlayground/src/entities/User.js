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
  
  static async login() {
    try {
      return await apiClient.login();
    } catch (error) {
      console.error('Error during login:', error);
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
}