-- Lingora Database Setup Script
-- Run this after installing MySQL to create the complete database

-- Create the database
CREATE DATABASE IF NOT EXISTS lingora CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lingora;

-- Source the schema file
SOURCE backend/migrations/001_create_database_schema.sql;

-- Source the initial data file  
SOURCE backend/migrations/002_insert_initial_data.sql;

-- Verify installation
SELECT 'Database setup complete!' as status;
SELECT COUNT(*) as language_count FROM languages;
SELECT COUNT(*) as category_count FROM categories; 
SELECT COUNT(*) as user_count FROM users;