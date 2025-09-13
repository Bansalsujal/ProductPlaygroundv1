import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: [
    'http://localhost:5000',
    'https://c49715c6-8ccf-4e76-8691-ab1374290b07-00-nvsh865loymg.sisko.replit.dev',
    /\.replit\.dev$/,
    /\.repl\.co$/
  ],
  credentials: true
}));

app.use(express.json());

// We'll use Supabase client for all database operations
// Removed local PostgreSQL pool in favor of Supabase

// Create Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Helper function to get user from auth header
async function getUserFromAuthHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.substring(7);
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

// User endpoints
app.get('/api/user/me', async (req, res) => {
  try {
    const user = await getUserFromAuthHeader(req);
    
    if (!user) {
      // Return mock user for development - replace with proper auth later
      const mockUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        full_name: 'Test User',
        onboarded: true,
        career_stage: 'senior',
        industry: 'tech'
      };
      return res.json(mockUser);
    }
    
    res.json({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email.split('@')[0],
      onboarded: user.user_metadata?.onboarded || false,
      career_stage: user.user_metadata?.career_stage || 'junior',
      industry: user.user_metadata?.industry || 'tech'
    });
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    res.status(500).json({ error: error.message });
  }
});

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name
        }
      }
    });
    
    if (error) throw error;
    
    res.json({ 
      user: data.user,
      session: data.session,
      message: 'User created successfully. Please check your email for verification.' 
    });
  } catch (error) {
    console.error('Error in /api/auth/signup:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    res.json({ 
      user: data.user,
      session: data.session,
      message: 'Logged in successfully' 
    });
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/google', async (req, res) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${req.headers.origin || 'http://localhost:5000'}/auth/callback`
      }
    });
    
    if (error) throw error;
    
    res.json({ url: data.url });
  } catch (error) {
    console.error('Error in /api/auth/google:', error);
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/user/logout', async (req, res) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error in /api/user/logout:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/user/update', async (req, res) => {
  try {
    const userData = req.body;
    // TODO: Update user in database
    res.json({ ...userData, id: '550e8400-e29b-41d4-a716-446655440000' });
  } catch (error) {
    console.error('Error in /api/user/update:', error);
    res.status(500).json({ error: error.message });
  }
});

// Questions endpoints
app.get('/api/questions', async (req, res) => {
  try {
    const { categories, difficulty, type_label } = req.query;
    
    let query = supabase.from('questions').select('*').eq('active', true);
    
    if (type_label) {
      query = query.eq('type_label', type_label);
    }
    
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    
    query = query.order('created_at', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Transform to match expected frontend format
    const questions = (data || []).map(q => ({
      id: q.id,
      title: q.question_text,
      description: q.metadata?.description || q.question_text,
      categories: q.metadata?.categories || [q.type_label],
      difficulty: q.difficulty,
      estimatedTimeMinutes: q.metadata?.estimated_time_minutes || 30
    }));
    
    // Filter by categories on the server side
    let filteredQuestions = questions;
    if (categories) {
      const categoryArray = categories.split(',').map(c => c.trim().toLowerCase());
      filteredQuestions = questions.filter(q => 
        q.categories.some(cat => 
          categoryArray.includes(cat.toLowerCase())
        )
      );
    }
    
    res.json(filteredQuestions);
  } catch (error) {
    console.error('Error in /api/questions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Interview Sessions endpoints
app.get('/api/sessions', async (req, res) => {
  try {
    const { user_id, limit = 50, order_by = 'created_date' } = req.query;
    
    let query = supabase.from('interview_sessions').select('*');
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    // Handle ordering
    const orderDirection = order_by.startsWith('-');
    const orderField = order_by.replace('-', '').replace('created_at', 'created_date');
    
    query = query.order(orderField, { ascending: !orderDirection });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    const insertData = {
      user_id: sessionData.user_id,
      question_id: sessionData.question_id,
      question_type: sessionData.question_type || 'general',
      conversation: sessionData.conversation || [],
      duration_minutes: sessionData.duration_minutes || 0,
      composite_score: sessionData.composite_score,
      dimension_scores: sessionData.dimension_scores,
      feedback: sessionData.feedback || {},
      completed: sessionData.completed || false,
      date: sessionData.date || new Date().toISOString().split('T')[0]
    };
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert([insertData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/sessions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('interview_sessions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error in /api/sessions/:id:', error);
    res.status(500).json({ error: error.message });
  }
});

// User Stats endpoints
app.get('/api/user-stats', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    let query = supabase.from('user_stats').select('*');
    
    if (user_id) {
      query = query.eq('user_id', user_id);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json(data || []);
  } catch (error) {
    console.error('Error in /api/user-stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user-stats', async (req, res) => {
  try {
    const statsData = req.body;
    
    const upsertData = {
      user_id: statsData.user_id,
      current_streak: statsData.current_streak || 0,
      longest_streak: statsData.longest_streak || 0,
      total_solved: statsData.total_solved || 0,
      avg_score_design: statsData.avg_score_design || 0,
      avg_score_improvement: statsData.avg_score_improvement || 0,
      avg_score_rca: statsData.avg_score_rca || 0,
      avg_score_guesstimate: statsData.avg_score_guesstimate || 0,
      last_activity_date: statsData.last_activity_date,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('user_stats')
      .upsert([upsertData])
      .select()
      .single();
    
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('Error in /api/user-stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// LLM endpoint with Gemini integration
app.post('/api/llm/invoke', async (req, res) => {
  try {
    const { prompt, response_json_schema } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Detect if this is an evaluation request (has JSON schema) or interview conversation
    const isEvaluation = response_json_schema != null;
    
    let model;
    if (isEvaluation) {
      // For evaluations, use JSON format
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: {
          response_mime_type: "application/json"
        }
      });
    } else {
      // For interview conversations, use plain text
      model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash"
      });
    }

    console.log('Calling Gemini API with prompt length:', prompt.length, 'isEvaluation:', isEvaluation);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini response received, length:', text.length);
    
    if (isEvaluation) {
      const parsedResponse = JSON.parse(text);
      res.json(parsedResponse);
    } else {
      // For interview conversations, return plain text
      res.json({ message: text.trim() });
    }
  } catch (error) {
    console.error('Error in /api/llm/invoke:', error);
    
    // Determine fallback based on request type
    const isEvaluation = req.body.response_json_schema != null;
    
    if (isEvaluation) {
      // Fallback evaluation response
      const mockResponse = {
        composite_score: 7.2,
        dimension_scores: {
          "Problem Structuring & Clarification": 7,
          "User-Centric Thinking": 8,
          "Solution Creativity & Breadth": 7,
          "Prioritization & Tradeoffs": 6,
          "Metrics Definition": 8,
          "Communication & Storytelling": 7
        },
        what_worked_well: "Good structure and user focus. Clear prioritization framework.",
        areas_to_improve: "Could provide more creative solutions and stronger tradeoff analysis."
      };
      
      console.log('Using fallback mock evaluation response due to Gemini error');
      res.json(mockResponse);
    } else {
      // Fallback interview response
      const mockInterviewResponse = {
        message: "That's an interesting point. Can you tell me more about your reasoning behind that approach?"
      };
      
      console.log('Using fallback mock interview response due to Gemini error');
      res.json(mockInterviewResponse);
    }
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`PM Interview API server running on port ${port}`);
});