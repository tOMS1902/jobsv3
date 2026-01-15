
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('student', 'employer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    university VARCHAR(255),
    degree VARCHAR(255),
    bio TEXT,
    phone VARCHAR(20),
    portfolio_url VARCHAR(255),
    linkedin_url VARCHAR(255)
);

-- Work Experience (Relational: One Student to Many Experiences)
CREATE TABLE work_experience (
    id SERIAL PRIMARY KEY,
    profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    role VARCHAR(255),
    company VARCHAR(255),
    period VARCHAR(100)
);

-- Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employer_id UUID REFERENCES users(id),
    title VARCHAR(255),
    company_name VARCHAR(255),
    location VARCHAR(255),
    salary_min DECIMAL(10, 2),
    salary_max DECIMAL(10, 2),
    description TEXT,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'active'
);
