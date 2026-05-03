-- Hospital Settings Table
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id SERIAL PRIMARY KEY,
    hospital_name TEXT DEFAULT 'Vikram ENT Hospital',
    hospital_location TEXT DEFAULT 'Coimbatore',
    contact_email TEXT DEFAULT 'info@vikramhospital.com',
    contact_phone TEXT DEFAULT '+91 422 1234567',
    whatsapp_number TEXT DEFAULT '+91 9876543210',
    chat_support_link TEXT DEFAULT 'https://wa.me/919876543210',
    show_testimonials BOOLEAN DEFAULT true,
    years_experience INTEGER DEFAULT 55,
    expert_doctors INTEGER DEFAULT 20,
    successful_procedures TEXT DEFAULT '5,00,000+',
    lives_touched TEXT DEFAULT '50,00,000+',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns if table already exists (for existing deployments)
ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS show_testimonials BOOLEAN DEFAULT true;
ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 55;
ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS expert_doctors INTEGER DEFAULT 20;
ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS successful_procedures TEXT DEFAULT '5,00,000+';
ALTER TABLE public.hospital_settings ADD COLUMN IF NOT EXISTS lives_touched TEXT DEFAULT '50,00,000+';

-- Enable RLS (Optional, since backend uses service role)
-- ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Insert initial record if not exists
INSERT INTO public.hospital_settings (id, hospital_name)
SELECT 1, 'Vikram ENT Hospital'
WHERE NOT EXISTS (SELECT 1 FROM public.hospital_settings WHERE id = 1);
