import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function setupSupabaseSchema() {
  console.log('Setting up Supabase database schema...');
  
  try {
    // Create questions table
    const { data: questionsResult, error: questionsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          question_text TEXT NOT NULL,
          type_label TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          metadata JSONB,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_questions_type_label ON questions(type_label);
        CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
      `
    });

    if (questionsError) {
      console.log('Using alternative method to create tables...');
      
      // Alternative: Create tables using direct SQL execution
      const createQuestionsSQL = `
        CREATE TABLE IF NOT EXISTS questions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          question_text TEXT NOT NULL,
          type_label TEXT NOT NULL,
          difficulty TEXT NOT NULL,
          metadata JSONB,
          active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `;
      
      const { error: altError } = await supabase.rpc('execute_sql', { query: createQuestionsSQL });
      
      if (altError) {
        console.error('Error creating questions table:', altError);
        // Let's try via REST API approach
        console.log('Creating via REST API...');
        
        // Insert sample questions directly
        const sampleQuestions = [
          {
            question_text: 'Design a messaging app for deaf users',
            type_label: 'Design',
            difficulty: 'Medium',
            metadata: {
              description: 'Design a messaging app specifically tailored for deaf users, considering their unique communication needs',
              categories: ['Design'],
              estimated_time_minutes: 30
            }
          }
        ];
        
        const { data: insertData, error: insertError } = await supabase
          .from('questions')
          .insert(sampleQuestions);
          
        if (insertError) {
          console.error('Table probably doesn\'t exist. Need to create via Supabase dashboard.');
          console.log('Please create tables manually in Supabase dashboard with the SQL provided.');
          return false;
        }
      } else {
        console.log('Questions table created successfully!');
      }
    } else {
      console.log('Questions table created successfully!');
    }

    return true;
  } catch (error) {
    console.error('Error setting up schema:', error);
    return false;
  }
}

setupSupabaseSchema().then(success => {
  if (success) {
    console.log('Supabase setup completed successfully!');
  } else {
    console.log('Manual setup required in Supabase dashboard.');
  }
  process.exit(0);
});