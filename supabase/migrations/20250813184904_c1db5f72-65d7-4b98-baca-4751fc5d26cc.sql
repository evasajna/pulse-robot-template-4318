-- Create admin_users table with eva/1231 credentials
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policy for admin_users
CREATE POLICY "Admin users can view themselves" ON public.admin_users
    FOR SELECT USING (true);

-- Insert admin user: username = "eva", password = "1231"
INSERT INTO public.admin_users (username, password_hash) 
VALUES ('eva', crypt('1231', gen_salt('bf')))
ON CONFLICT (username) DO NOTHING;

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