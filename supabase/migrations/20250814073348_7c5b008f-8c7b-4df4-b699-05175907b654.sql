-- Create shared_links table
CREATE TABLE IF NOT EXISTS public.shared_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    mobile_number TEXT NOT NULL,
    share_code TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create shared_link_submissions table to track submissions through shared links
CREATE TABLE IF NOT EXISTS public.shared_link_submissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    shared_link_id UUID NOT NULL REFERENCES public.shared_links(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.shared_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_link_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies for shared_links
CREATE POLICY "Anyone can view active shared links" ON public.shared_links
    FOR SELECT USING (is_active = true);

CREATE POLICY "Anyone can create shared links" ON public.shared_links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can manage shared links" ON public.shared_links
    FOR ALL USING (true);

-- Create policies for shared_link_submissions
CREATE POLICY "Anyone can create submissions" ON public.shared_link_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view all submissions" ON public.shared_link_submissions
    FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_shared_links_share_code ON public.shared_links(share_code);
CREATE INDEX IF NOT EXISTS idx_shared_links_mobile ON public.shared_links(mobile_number);
CREATE INDEX IF NOT EXISTS idx_shared_link_submissions_link_id ON public.shared_link_submissions(shared_link_id);

-- Create trigger for updated_at
CREATE TRIGGER update_shared_links_updated_at
    BEFORE UPDATE ON public.shared_links
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();