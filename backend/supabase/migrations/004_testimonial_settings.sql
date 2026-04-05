
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS show_testimonials BOOLEAN DEFAULT TRUE;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 55;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS expert_doctors INTEGER DEFAULT 20;
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS successful_procedures TEXT DEFAULT '5,00,000+';
ALTER TABLE hospital_settings ADD COLUMN IF NOT EXISTS lives_touched TEXT DEFAULT '50,00,000+';
