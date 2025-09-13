import { apiClient } from '../lib/supabase.js';

export class InterviewSession {
  static async filter(conditions = {}, orderBy = '-created_date', limit = 50) {
    try {
      const filters = {
        ...conditions,
        order_by: orderBy,
        limit: limit
      };
      return await apiClient.getSessions(filters);
    } catch (error) {
      console.error('Error filtering interview sessions:', error);
      return [];
    }
  }
  
  static async create(data) {
    try {
      return await apiClient.createSession(data);
    } catch (error) {
      console.error('Error creating interview session:', error);
      throw error;
    }
  }
  
  static async update(id, data) {
    try {
      return await apiClient.updateSession(id, data);
    } catch (error) {
      console.error('Error updating interview session:', error);
      throw error;
    }
  }
}