import { apiClient } from '../lib/supabase.js';

export class UserStats {
  static async filter(conditions = {}) {
    try {
      return await apiClient.getUserStats(conditions);
    } catch (error) {
      console.error('Error filtering user stats:', error);
      return [];
    }
  }
  
  static async upsert(data) {
    try {
      return await apiClient.upsertUserStats(data);
    } catch (error) {
      console.error('Error upserting user stats:', error);
      throw error;
    }
  }

  // Alias for create method (used by some components)
  static async create(data) {
    return this.upsert(data);
  }

  // Alias for update method (used by some components) 
  static async update(id, data) {
    return this.upsert({ ...data, user_id: data.user_id || id });
  }
}