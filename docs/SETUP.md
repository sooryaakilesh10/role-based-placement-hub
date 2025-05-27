
# Setup Guide

This guide provides detailed instructions for setting up the Placement Platform.

## Prerequisites

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

### Optional (for Docker setup)
- **Docker** - [Download](https://docs.docker.com/get-docker/)
- **Docker Compose** - Usually included with Docker Desktop

## Local Development Setup

### 1. Database Setup

#### Install PostgreSQL
1. Download and install PostgreSQL from the official website
2. During installation, remember the password you set for the `postgres` user
3. Make sure PostgreSQL service is running

#### Create Database
```bash
# Connect to PostgreSQL (replace 'postgres' with your username if different)
psql -U postgres

# Create the database
CREATE DATABASE placement_platform;

# Exit PostgreSQL
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

#### Configure Environment Variables
Edit the `.env` file with your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=placement_platform
DB_USER=postgres
DB_PASSWORD=your_postgresql_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

#### Initialize Database Tables
```bash
# Run database initialization script
npm run init-db
```

This creates all necessary tables and inserts sample data including default users:
- **Admin**: admin@placement.com / password
- **Manager**: manager@placement.com / password  
- **Officer**: officer@placement.com / password

#### Start Backend Server
```bash
# Development mode with auto-reload
npm run dev

# OR production mode
npm start
```

The backend will be running on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (project root)
cd ../

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be running on `http://localhost:5173`

## Testing the Application

### 1. Access the Application
Open your browser and go to `http://localhost:5173`

### 2. Login with Default Credentials
Use any of these accounts to test different role permissions:

- **Admin Account**:
  - Email: `admin@placement.com`
  - Password: `password`
  - Permissions: Full access (create/edit/delete companies, manage users, approve updates)

- **Manager Account**:
  - Email: `manager@placement.com`
  - Password: `password`
  - Permissions: Manage companies, approve updates, generate reports (cannot create users)

- **Officer Account**:
  - Email: `officer@placement.com`
  - Password: `password`
  - Permissions: Edit company details (requires approval), view companies

### 3. Test Features

#### For Admin/Manager:
1. **Company Management**: Navigate to Companies page to add/edit/delete companies
2. **Pending Approvals**: Check the Pending page to approve/reject officer changes
3. **Excel Reports**: Use the "Export Excel" button to download company reports
4. **User Management** (Admin only): Navigate to Users page to create new users

#### For Officer:
1. **Edit Companies**: Try editing company details - changes will be sent for approval
2. **View Restrictions**: Notice limited access to certain pages

## Next Steps

- Review the [Development Guide](DEVELOPMENT.md) for API documentation
- Check [Docker Guide](DOCKER.md) for containerized deployment
- See [Deployment Guide](DEPLOYMENT.md) for production setup
