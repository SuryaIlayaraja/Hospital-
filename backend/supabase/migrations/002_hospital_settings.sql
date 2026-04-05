-- Hospital Settings Table
CREATE TABLE IF NOT EXISTS public.hospital_settings (
    id SERIAL PRIMARY KEY,
    hospital_name TEXT DEFAULT 'Vikram ENT Hospital',
    hospital_location TEXT DEFAULT 'Coimbatore',
    contact_email TEXT DEFAULT 'info@vikramhospital.com',
    contact_phone TEXT DEFAULT '+91 422 1234567',
    whatsapp_number TEXT DEFAULT '+91 9876543210',
    chat_support_link TEXT DEFAULT 'https://wa.me/919876543210',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS (Optional, since backend uses service role)
-- ALTER TABLE public.hospital_settings ENABLE ROW LEVEL SECURITY;

-- Insert initial record if not exists
INSERT INTO public.hospital_settings (id, hospital_name)
SELECT 1, 'Vikram ENT Hospital'
WHERE NOT EXISTS (SELECT 1 FROM public.hospital_settings WHERE id = 1);
