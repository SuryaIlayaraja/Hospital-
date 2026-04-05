-- Create testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    hospital TEXT,
    image TEXT DEFAULT 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80',
    text TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed existing testimonials from LanguageContext
INSERT INTO testimonials (name, role, hospital, text, image, order_index) VALUES
('Dr. Pradnya Gajallewar', 'Consultant and Anesthesiologist', 'Bethany Hospital Thane', 'I thank Dr.Vishal Jadhav for your Knowledge and guidance in bringing my project to a good shape. I have already had some positive feedback about my project from some of my friends.', 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80', 1),
('Dr. Rajesh Kumar', 'Senior Surgeon', 'City Medical Center', 'The clinical management system has significantly improved our workflow. The attention to detail and professional support provided by the team at Vikram ENT is exceptional.', 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80', 2),
('Dr. Anita Sharma', 'ENT Specialist', 'Global Health Hospital', 'I highly recommend the specialized training and facilities at Vikram ENT. It has been a pleasure collaborating on complex cases and witnessing the ''Flow of Healing'' firsthand.', 'https://images.unsplash.com/photo-1559839734-2b71f1536783?auto=format&fit=crop&w=150&q=80', 3);
