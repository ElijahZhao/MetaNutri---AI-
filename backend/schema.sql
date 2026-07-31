-- MetaNutri Database Schema for Supabase PostgreSQL
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- ============================================
-- User Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    age INTEGER,
    gender VARCHAR(10),
    height_cm NUMERIC(5,2),
    weight_kg NUMERIC(5,2),
    activity_level VARCHAR(20),
    dietary_goals JSONB DEFAULT '{}'::jsonb,
    dietary_restrictions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- ============================================
-- Genomic Data Table
-- ============================================
CREATE TABLE IF NOT EXISTS genomic_data (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    gene_name VARCHAR(100) NOT NULL,
    snp_id VARCHAR(50),
    genotype VARCHAR(10),
    effect_score NUMERIC(5,3),
    trait_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_genomic_data_user_id ON genomic_data(user_id);

-- ============================================
-- Microbiome Data Table
-- ============================================
CREATE TABLE IF NOT EXISTS microbiome_data (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    taxon_level VARCHAR(20),
    taxon_name VARCHAR(255) NOT NULL,
    relative_abundance NUMERIC(10,8),
    health_score NUMERIC(5,3),
    sample_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_microbiome_data_user_id ON microbiome_data(user_id);

-- ============================================
-- Metabolomics Data Table
-- ============================================
CREATE TABLE IF NOT EXISTS metabolomics_data (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    metabolite_name VARCHAR(255) NOT NULL,
    pathway_name VARCHAR(255),
    concentration NUMERIC(15,6),
    unit VARCHAR(50),
    z_score NUMERIC(10,4),
    significance NUMERIC(10,6),
    sample_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metabolomics_data_user_id ON metabolomics_data(user_id);

-- ============================================
-- Metabolomics Pathways Table
-- ============================================
CREATE TABLE IF NOT EXISTS metabolomics_pathways (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pathway_name VARCHAR(255) NOT NULL,
    enrichment_score NUMERIC(10,4),
    p_value NUMERIC(15,10),
    num_metabolites VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metabolomics_pathways_user_id ON metabolomics_pathways(user_id);

-- ============================================
-- Food Nutrition Table
-- ============================================
CREATE TABLE IF NOT EXISTS food_nutrition (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    food_name VARCHAR(255) NOT NULL UNIQUE,
    category VARCHAR(100),
    calories_kcal NUMERIC(8,2),
    protein_g NUMERIC(6,2),
    fat_g NUMERIC(6,2),
    carbs_g NUMERIC(6,2),
    fiber_g NUMERIC(6,2),
    vitamins JSONB DEFAULT '{}'::jsonb,
    minerals JSONB DEFAULT '{}'::jsonb,
    glycemic_index NUMERIC(5,2),
    glycemic_load NUMERIC(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_food_nutrition_food_name ON food_nutrition(food_name);

-- ============================================
-- Nutrition Recommendations Table
-- ============================================
CREATE TABLE IF NOT EXISTS nutrition_recommendations (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    recommendation_type VARCHAR(50),
    food_items JSONB DEFAULT '[]'::jsonb,
    nutrient_targets JSONB DEFAULT '{}'::jsonb,
    confidence_score NUMERIC(5,3),
    explanation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nutrition_recommendations_user_id ON nutrition_recommendations(user_id);

-- ============================================
-- RBAC: Roles Table
-- ============================================
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RBAC: Permissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL
);

-- ============================================
-- RBAC: Role Permissions Table
-- ============================================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(36) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- ============================================
-- RBAC: User Roles Table
-- ============================================
CREATE TABLE IF NOT EXISTS user_roles (
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- ============================================
-- Updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Seed default roles
-- ============================================
INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access'),
    ('user', 'Standard registered user')
ON CONFLICT (name) DO NOTHING;
