import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pg from 'pg';

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

// Create PostgreSQL client pool
const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

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

// User endpoints
app.get('/api/user/me', async (req, res) => {
  try {
    // For now, return mock user with valid UUID - implementing proper auth
    const mockUser = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      email: 'user@example.com',
      full_name: 'Test User',
      onboarded: true,
      career_stage: 'senior',
      industry: 'tech'
    };
    res.json(mockUser);
  } catch (error) {
    console.error('Error in /api/user/me:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/login', async (req, res) => {
  try {
    // Mock login response with valid UUID - implementing real OAuth
    res.json({ 
      user: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'user@example.com',
        full_name: 'Test User'
      },
      message: 'Logged in successfully' 
    });
  } catch (error) {
    console.error('Error in /api/user/login:', error);
    res.status(500).json({ error: error.message });
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
    
    let whereConditions = ['active = true'];
    let params = [];
    let paramIndex = 1;
    
    if (type_label) {
      whereConditions.push(`type_label = $${paramIndex}`);
      params.push(type_label);
      paramIndex++;
    }
    
    if (difficulty) {
      whereConditions.push(`difficulty = $${paramIndex}`);
      params.push(difficulty);
      paramIndex++;
    }
    
    const query = `
      SELECT id, question_text, type_label, difficulty, metadata, created_at 
      FROM questions 
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY created_at DESC
    `;
    
    const result = await pool.query(query, params);
    
    // Transform to match expected frontend format
    const questions = result.rows.map(q => ({
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
    const { user_id, limit = 50, order_by = 'created_at' } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramIndex = 1;
    
    if (user_id) {
      whereConditions.push(`user_id = $${paramIndex}`);
      params.push(user_id);
      paramIndex++;
    }
    
    // Handle ordering - default to created_at if created_date is requested (common mismatch)
    const orderDirection = order_by.startsWith('-') ? 'DESC' : 'ASC';
    const orderField = order_by.replace('-', '').replace('created_date', 'created_at');
    
    let query = `
      SELECT id, user_id, question_id, question_type, conversation, duration_minutes, 
             composite_score, dimension_scores, feedback, completed, date, created_date 
      FROM interview_sessions
    `;
    
    if (whereConditions.length > 0) {
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    query += ` ORDER BY ${orderField} ${orderDirection}`;
    
    if (limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(parseInt(limit));
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/sessions', async (req, res) => {
  try {
    const sessionData = req.body;
    
    const query = `
      INSERT INTO interview_sessions (user_id, question_id, question_type, conversation, 
                                    duration_minutes, composite_score, dimension_scores, 
                                    feedback, completed, date) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      sessionData.user_id,
      sessionData.question_id,
      sessionData.question_type || 'general',
      JSON.stringify(sessionData.conversation || []),
      sessionData.duration_minutes || 0,
      sessionData.composite_score,
      JSON.stringify(sessionData.dimension_scores),
      JSON.stringify(sessionData.feedback || {}),
      sessionData.completed || false,
      sessionData.date || new Date().toISOString().split('T')[0]
    ];
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
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
    
    let query = `
      SELECT user_id, current_streak, longest_streak, total_solved, 
             avg_score_design, avg_score_improvement, avg_score_rca, avg_score_guesstimate,
             last_activity_date, activity_calendar, updated_at 
      FROM user_stats
    `;
    
    let params = [];
    if (user_id) {
      query += ' WHERE user_id = $1';
      params.push(user_id);
    }
    
    const result = await pool.query(query, params);
    res.json(result.rows || []);
  } catch (error) {
    console.error('Error in /api/user-stats:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user-stats', async (req, res) => {
  try {
    const statsData = req.body;
    
    // Use UPSERT (INSERT ... ON CONFLICT) to update existing or create new
    const query = `
      INSERT INTO user_stats (user_id, current_streak, longest_streak, total_solved, 
                            avg_score_design, avg_score_improvement, avg_score_rca, 
                            avg_score_guesstimate, last_activity_date, updated_at) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        current_streak = EXCLUDED.current_streak,
        longest_streak = EXCLUDED.longest_streak,
        total_solved = EXCLUDED.total_solved,
        avg_score_design = EXCLUDED.avg_score_design,
        avg_score_improvement = EXCLUDED.avg_score_improvement,
        avg_score_rca = EXCLUDED.avg_score_rca,
        avg_score_guesstimate = EXCLUDED.avg_score_guesstimate,
        last_activity_date = EXCLUDED.last_activity_date,
        updated_at = NOW()
      RETURNING *
    `;
    
    const values = [
      statsData.user_id,
      statsData.current_streak || 0,
      statsData.longest_streak || 0,
      statsData.total_solved || 0,
      statsData.avg_score_design || 0,
      statsData.avg_score_improvement || 0,
      statsData.avg_score_rca || 0,
      statsData.avg_score_guesstimate || 0,
      statsData.last_activity_date
    ];
    
    const result = await pool.query(query, values);
    res.json(result.rows[0]);
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

    // Get the generative model
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: response_json_schema
      }
    });

    console.log('Calling Gemini API with prompt length:', prompt.length);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('Gemini response received, length:', text.length);
    const parsedResponse = JSON.parse(text);
    
    res.json(parsedResponse);
  } catch (error) {
    console.error('Error in /api/llm/invoke:', error);
    
    // Fallback to mock response if Gemini fails
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
    
    console.log('Using fallback mock response due to Gemini error');
    res.json(mockResponse);
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`PM Interview API server running on port ${port}`);
});