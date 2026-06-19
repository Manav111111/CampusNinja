-- ============================================================
-- CAMPUS NINJA — SEED DATA
-- Sample data for B.Tech CSE Semester 1
-- ============================================================

-- ============================================================
-- SUBJECTS: B.Tech CSE Semester 1
-- ============================================================
INSERT INTO subjects (course, branch, semester, name, short_name, description, icon_name, theme_color, accent_color, category, sort_order) VALUES
('B.Tech', 'Computer Science', 1, 'Physics', 'PHY', 'Engineering Physics - Mechanics, Optics, Thermodynamics', 'flask-outline', '#3B82F6', '#DBEAFE', 'theory', 1),
('B.Tech', 'Computer Science', 1, 'Mathematics', 'MATH', 'Engineering Mathematics - Calculus, Linear Algebra, Differential Equations', 'calculator-outline', '#8B5CF6', '#EDE9FE', 'theory', 2),
('B.Tech', 'Computer Science', 1, 'Programming in C', 'PIC', 'Introduction to Programming using C Language', 'code-slash-outline', '#10B981', '#D1FAE5', 'theory', 3),
('B.Tech', 'Computer Science', 1, 'Electrical Engineering', 'EE', 'Basic Electrical Engineering - Circuits, AC/DC Analysis', 'flash-outline', '#F59E0B', '#FEF3C7', 'theory', 4),
('B.Tech', 'Computer Science', 1, 'Communication Skills', 'CS', 'English Communication and Professional Writing', 'chatbubbles-outline', '#EC4899', '#FCE7F3', 'theory', 5),
('B.Tech', 'Computer Science', 1, 'Physics Lab', 'PHY-L', 'Physics Laboratory Experiments and Viva', 'beaker-outline', '#3B82F6', '#DBEAFE', 'practical', 6),
('B.Tech', 'Computer Science', 1, 'C Programming Lab', 'PIC-L', 'Hands-on C Programming Exercises', 'terminal-outline', '#10B981', '#D1FAE5', 'practical', 7);

-- ============================================================
-- RESOURCES: Physics
-- ============================================================
INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Complete Physics Notes', 'Full semester notes covering all units', 'notes', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE1', 'PDF', 1
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Physics Unit 1 Notes', 'Mechanics and Wave Motion', 'notes', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE2', 'PDF', 2
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, is_popular, sort_order)
SELECT id, 'Physics 2024 PYQ', 'Previous Year Question Paper 2024', 'pyq', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE3', 'PDF', true, 1
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Physics 2023 PYQ', 'Previous Year Question Paper 2023', 'pyq', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE4', 'PDF', 2
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'Physics Complete Playlist', 'Full video lecture series by Prof. Sharma', 'video', 'youtube', 'https://youtube.com/playlist?list=EXAMPLE1', 1
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Physics Syllabus', 'Official semester syllabus', 'syllabus', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE5', 'PDF', 1
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, is_popular, sort_order)
SELECT id, 'Physics Important Questions', 'Most expected questions for exams', 'important_questions', 'google_drive', 'https://drive.google.com/file/d/EXAMPLE6', 'PDF', true, 1
FROM subjects WHERE short_name = 'PHY' AND semester = 1 LIMIT 1;

-- ============================================================
-- RESOURCES: Mathematics
-- ============================================================
INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Complete Mathematics Notes', 'All units: Calculus, Linear Algebra, DE', 'notes', 'google_drive', 'https://drive.google.com/file/d/MATH_NOTES1', 'PDF', 1
FROM subjects WHERE short_name = 'MATH' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, is_popular, sort_order)
SELECT id, 'Mathematics 2024 PYQ', 'Previous Year Question Paper 2024', 'pyq', 'google_drive', 'https://drive.google.com/file/d/MATH_PYQ1', 'PDF', true, 1
FROM subjects WHERE short_name = 'MATH' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'Mathematics Full Playlist', 'Video lectures by Prof. Gupta', 'video', 'youtube', 'https://youtube.com/playlist?list=MATH_PLAYLIST', 1
FROM subjects WHERE short_name = 'MATH' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'Mathematics Important Questions', 'High-yield exam questions', 'important_questions', 'google_drive', 'https://drive.google.com/file/d/MATH_IQ1', 'PDF', 1
FROM subjects WHERE short_name = 'MATH' AND semester = 1 LIMIT 1;

-- ============================================================
-- RESOURCES: Programming in C
-- ============================================================
INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, sort_order)
SELECT id, 'C Programming Complete Notes', 'Variables, Loops, Arrays, Pointers, Structs', 'notes', 'google_drive', 'https://drive.google.com/file/d/PIC_NOTES1', 'PDF', 1
FROM subjects WHERE short_name = 'PIC' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, drive_url, file_format, is_popular, sort_order)
SELECT id, 'PIC 2024 PYQ', 'Programming in C - Question Paper 2024', 'pyq', 'google_drive', 'https://drive.google.com/file/d/PIC_PYQ1', 'PDF', true, 1
FROM subjects WHERE short_name = 'PIC' AND semester = 1 LIMIT 1;

INSERT INTO resources (subject_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'C Programming Playlist', 'Learn C from scratch', 'video', 'youtube', 'https://youtube.com/playlist?list=PIC_PLAYLIST', 1
FROM subjects WHERE short_name = 'PIC' AND semester = 1 LIMIT 1;


-- ============================================================
-- SKILLS
-- ============================================================
INSERT INTO skills (name, description, icon_name, theme_color, accent_color, difficulty_level, total_resources, sort_order) VALUES
('Data Structures & Algorithms', 'Master DSA for competitive programming and placements', 'code-slash-outline', '#3B82F6', '#DBEAFE', 'intermediate', 12, 1),
('Web Development', 'Full-stack web development with modern frameworks', 'globe-outline', '#10B981', '#D1FAE5', 'beginner', 15, 2),
('Generative AI', 'Learn LLMs, prompt engineering, and AI tools', 'sparkles-outline', '#8B5CF6', '#EDE9FE', 'intermediate', 8, 3),
('Agentic AI', 'Build autonomous AI agents and multi-agent systems', 'hardware-chip-outline', '#F59E0B', '#FEF3C7', 'advanced', 6, 4),
('Data Science', 'Python, Pandas, ML, and data visualization', 'stats-chart-outline', '#EF4444', '#FEE2E2', 'beginner', 10, 5),
('Cloud Computing', 'AWS, GCP, Azure fundamentals and certifications', 'cloud-outline', '#06B6D4', '#CFFAFE', 'intermediate', 9, 6),
('UI/UX Design', 'Figma, design systems, and user research', 'color-palette-outline', '#EC4899', '#FCE7F3', 'beginner', 7, 7);


-- ============================================================
-- SKILL RESOURCES: DSA
-- ============================================================
INSERT INTO skill_resources (skill_id, title, description, type, storage_type, external_url, sort_order)
SELECT id, 'Complete DSA Roadmap', 'Step-by-step roadmap from basics to advanced', 'roadmap', 'external_link', 'https://roadmap.sh/datastructures-and-algorithms', 1
FROM skills WHERE name = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO skill_resources (skill_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'DSA Full Course', 'Complete DSA playlist for beginners', 'playlist', 'youtube', 'https://youtube.com/playlist?list=DSA_PLAYLIST', 2
FROM skills WHERE name = 'Data Structures & Algorithms' LIMIT 1;

INSERT INTO skill_resources (skill_id, title, description, type, storage_type, drive_url, sort_order)
SELECT id, 'DSA Cheat Sheet', 'Quick reference for all data structures', 'notes', 'google_drive', 'https://drive.google.com/file/d/DSA_CHEAT', 3
FROM skills WHERE name = 'Data Structures & Algorithms' LIMIT 1;

-- ============================================================
-- SKILL RESOURCES: Web Development
-- ============================================================
INSERT INTO skill_resources (skill_id, title, description, type, storage_type, external_url, sort_order)
SELECT id, 'Web Dev Roadmap 2024', 'Frontend + Backend complete path', 'roadmap', 'external_link', 'https://roadmap.sh/frontend', 1
FROM skills WHERE name = 'Web Development' LIMIT 1;

INSERT INTO skill_resources (skill_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'HTML CSS JS Crash Course', 'Learn web basics in one video', 'playlist', 'youtube', 'https://youtube.com/playlist?list=WEBDEV_PLAYLIST', 2
FROM skills WHERE name = 'Web Development' LIMIT 1;

-- ============================================================
-- SKILL RESOURCES: Generative AI
-- ============================================================
INSERT INTO skill_resources (skill_id, title, description, type, storage_type, external_url, sort_order)
SELECT id, 'Gen AI Learning Path', 'LLMs, Transformers, Prompt Engineering', 'roadmap', 'external_link', 'https://roadmap.sh/ai', 1
FROM skills WHERE name = 'Generative AI' LIMIT 1;

INSERT INTO skill_resources (skill_id, title, description, type, storage_type, youtube_url, sort_order)
SELECT id, 'Prompt Engineering Masterclass', 'Advanced prompting techniques', 'playlist', 'youtube', 'https://youtube.com/playlist?list=GENAI_PLAYLIST', 2
FROM skills WHERE name = 'Generative AI' LIMIT 1;


-- ============================================================
-- MARKETPLACE SERVICES
-- ============================================================
INSERT INTO marketplace_services (name, description, icon_name, theme_color, accent_color, price, original_price, features, sort_order) VALUES
('Assignment Help', 'Get expert help with your college assignments', 'document-text-outline', '#3B82F6', '#DBEAFE', 149, 299, '["Handwritten or typed", "On-time delivery", "Original content", "Revision support"]'::jsonb, 1),
('Project Help', 'Complete project development and documentation', 'rocket-outline', '#8B5CF6', '#EDE9FE', 499, 999, '["Source code included", "Documentation", "PPT presentation", "Demo support"]'::jsonb, 2),
('Lab Manuals', 'Ready-to-submit lab manual packages', 'flask-outline', '#10B981', '#D1FAE5', 199, 399, '["All experiments", "Observations included", "Formatted output", "Viva questions"]'::jsonb, 3),
('EG Sheet Bundle', 'Complete engineering graphics sheets', 'pencil-outline', '#F59E0B', '#FEF3C7', 299, 499, '["All drawings", "AutoCAD files", "Print ready", "As per syllabus"]'::jsonb, 4),
('Website Development', 'Custom website development for any purpose', 'globe-outline', '#06B6D4', '#CFFAFE', 999, 1999, '["Responsive design", "Custom domain", "SEO optimized", "1 month support"]'::jsonb, 5),
('App Development', 'Mobile app development for Android and iOS', 'phone-portrait-outline', '#EC4899', '#FCE7F3', 1999, 3999, '["Cross-platform", "UI/UX design", "Backend setup", "Play Store deployment"]'::jsonb, 6);


-- ============================================================
-- COMMUNITY LINKS
-- ============================================================
INSERT INTO community_links (platform, title, description, url, icon_name, theme_color, member_count, sort_order) VALUES
('whatsapp', 'Campus Ninja Community', 'Join our WhatsApp group for daily updates', 'https://chat.whatsapp.com/EXAMPLE_LINK', 'logo-whatsapp', '#25D366', '500+ members', 1),
('youtube', 'Campus Ninja YouTube', 'Subscribe for video lectures and tips', 'https://youtube.com/@campusninja', 'logo-youtube', '#FF0000', '1K+ subscribers', 2),
('instagram', 'Campus Ninja Instagram', 'Follow for study tips and motivation', 'https://instagram.com/campusninja', 'logo-instagram', '#E4405F', '2K+ followers', 3),
('telegram', 'Campus Ninja Telegram', 'Join for instant notes and resources', 'https://t.me/campusninja', 'paper-plane-outline', '#0088CC', '300+ members', 4);


-- ============================================================
-- APP SETTINGS
-- ============================================================
INSERT INTO settings (key, value, description) VALUES
('app_version', '1.0.0', 'Current app version'),
('min_supported_version', '1.0.0', 'Minimum supported app version'),
('contact_email', 'support@campusninja.in', 'Support email address'),
('contact_phone', '+91-9876543210', 'Support phone number'),
('whatsapp_support', 'https://wa.me/919876543210', 'WhatsApp support link'),
('privacy_policy_url', 'https://campusninja.in/privacy', 'Privacy policy URL'),
('terms_url', 'https://campusninja.in/terms', 'Terms and conditions URL'),
('maintenance_mode', 'false', 'App maintenance mode toggle'),
('announcement', '', 'Global announcement banner text'),
('force_update', 'false', 'Force users to update the app');


-- ============================================================
-- SEED DATA COMPLETE
-- ============================================================
