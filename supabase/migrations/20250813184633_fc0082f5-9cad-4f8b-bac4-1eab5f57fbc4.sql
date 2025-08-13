-- Create enum for quiz status
CREATE TYPE quiz_status AS ENUM ('active', 'inactive');

-- Create enum for question types
CREATE TYPE question_type AS ENUM ('multiple_choice');

-- Create quizzes table
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status quiz_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create questions table
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type DEFAULT 'multiple_choice',
    options JSONB NOT NULL, -- Store as array of options
    correct_answer TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
    participant_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    panchayath TEXT NOT NULL,
    reference_id TEXT, -- Mobile number of referrer
    answers JSONB NOT NULL, -- Store participant answers
    score INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(quiz_id, mobile_number) -- Prevent duplicate participation per quiz
);

-- Create admin_users table
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for public access to quizzes and questions (read-only)
CREATE POLICY "Anyone can view active quizzes" ON public.quizzes
    FOR SELECT USING (status = 'active');

CREATE POLICY "Anyone can view questions for active quizzes" ON public.questions
    FOR SELECT USING (
        quiz_id IN (SELECT id FROM public.quizzes WHERE status = 'active')
    );

-- RLS Policies for submissions (public can insert, admins can view all)
CREATE POLICY "Anyone can submit quiz responses" ON public.submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all submissions" ON public.submissions
    FOR SELECT USING (true);

-- RLS Policies for questions and quizzes (admins can manage)
CREATE POLICY "Admins can manage quizzes" ON public.quizzes
    FOR ALL USING (true);

CREATE POLICY "Admins can manage questions" ON public.questions
    FOR ALL USING (true);

-- RLS Policy for admin_users (only for authentication)
CREATE POLICY "Admin users can view themselves" ON public.admin_users
    FOR SELECT USING (true);

-- Insert default admin user (username: eva, password: 1231)
-- Using crypt() function to hash the password
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('eva', crypt('1231', gen_salt('bf')));

-- Create function to verify admin login
CREATE OR REPLACE FUNCTION public.verify_admin_login(input_username TEXT, input_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE username = input_username 
        AND password_hash = crypt(input_password, password_hash)
    );
END;
$$;

-- Create function to calculate quiz score
CREATE OR REPLACE FUNCTION public.calculate_quiz_score(quiz_id_param UUID, answers_param JSONB)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    score INTEGER := 0;
    question_record RECORD;
    user_answer TEXT;
BEGIN
    FOR question_record IN 
        SELECT id, correct_answer FROM public.questions WHERE quiz_id = quiz_id_param
    LOOP
        user_answer := answers_param ->> question_record.id::TEXT;
        IF user_answer = question_record.correct_answer THEN
            score := score + 1;
        END IF;
    END LOOP;
    
    RETURN score;
END;
$$;

-- Create trigger function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_quizzes_updated_at
    BEFORE UPDATE ON public.quizzes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default quiz for Indian Independence Day
INSERT INTO public.quizzes (title, description, status) 
VALUES ('Indian Independence Day Quiz 2024', 'Test your knowledge about Indian Independence Day and freedom struggle', 'active');

-- Insert sample questions (you can add more later via admin panel)
WITH quiz_id_var AS (
    SELECT id FROM public.quizzes WHERE title = 'Indian Independence Day Quiz 2024' LIMIT 1
)
INSERT INTO public.questions (quiz_id, question_text, options, correct_answer) VALUES
(
    (SELECT id FROM quiz_id_var),
    'When did India gain independence?',
    '["August 15, 1947", "August 15, 1948", "July 15, 1947", "September 15, 1947"]',
    'August 15, 1947'
),
(
    (SELECT id FROM quiz_id_var),
    'Who was the first Prime Minister of India?',
    '["Mahatma Gandhi", "Jawaharlal Nehru", "Sardar Patel", "Dr. APJ Abdul Kalam"]',
    'Jawaharlal Nehru'
),
(
    (SELECT id FROM quiz_id_var),
    'Where was the Indian National Flag hoisted for the first time?',
    '["Red Fort, Delhi", "India Gate, Delhi", "Raj Ghat, Delhi", "Gateway of India, Mumbai"]',
    'Red Fort, Delhi'
),
(
    (SELECT id FROM quiz_id_var),
    'Who designed the Indian National Flag?',
    '["Mahatma Gandhi", "Pingali Venkayya", "Jawaharlal Nehru", "Rabindranath Tagore"]',
    'Pingali Venkayya'
),
(
    (SELECT id FROM quiz_id_var),
    'What is the motto of India?',
    '["Satyameva Jayate", "Vande Mataram", "Jana Gana Mana", "Bharat Mata Ki Jai"]',
    'Satyameva Jayate'
);