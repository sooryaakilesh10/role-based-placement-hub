
-- This file will be executed when the PostgreSQL container starts for the first time
-- It ensures the database and user are properly set up

-- Connect to the placement_platform database
\c placement_platform;

-- Grant all privileges to the user
GRANT ALL PRIVILEGES ON DATABASE placement_platform TO placement_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO placement_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO placement_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO placement_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO placement_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO placement_user;
