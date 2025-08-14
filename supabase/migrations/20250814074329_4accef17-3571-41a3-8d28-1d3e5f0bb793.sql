-- Create questions table for quiz functionality
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A', 'B', 'C', 'D')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create submissions table for tracking quiz submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    participant_name TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    reference_mobile_number TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    total_questions INTEGER NOT NULL,
    answers JSONB,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    shared_link_id UUID REFERENCES public.shared_links(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for questions
CREATE POLICY "Anyone can view active questions" ON public.questions
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage questions" ON public.questions
    FOR ALL USING (true);

-- Create policies for submissions
CREATE POLICY "Anyone can create submissions" ON public.submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all submissions" ON public.submissions
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_is_active ON public.questions(is_active);
CREATE INDEX IF NOT EXISTS idx_submissions_score ON public.submissions(score DESC);
CREATE INDEX IF NOT EXISTS idx_submissions_mobile ON public.submissions(mobile_number);
CREATE INDEX IF NOT EXISTS idx_submissions_reference_mobile ON public.submissions(reference_mobile_number);
CREATE INDEX IF NOT EXISTS idx_submissions_shared_link ON public.submissions(shared_link_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON public.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();