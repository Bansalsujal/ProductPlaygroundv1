import { apiClient } from '../lib/supabase.js';

export class Question {
  static async list() {
    try {
      return await apiClient.getQuestions();
    } catch (error) {
      console.error('Error fetching questions:', error);
      return [];
    }
  }
  
  static async filter(conditions) {
    try {
      return await apiClient.getQuestions(conditions);
    } catch (error) {
      console.error('Error filtering questions:', error);
      return [];
    }
  }
}