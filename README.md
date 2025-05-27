
# Placement Platform - Full Stack Application

A comprehensive placement management platform built with React frontend and Node.js backend, featuring role-based access control and PostgreSQL database integration.

## 🏗️ Architecture

- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth with role-based access control

## 🚀 Quick Setup Guide

### Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download](https://www.postgresql.org/download/)
- **npm** or **yarn** package manager

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

This will create all necessary tables and insert sample data including default users:
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

## 📋 Testing the Application

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

## 🛠️ Development

### Backend Development

#### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize database tables and sample data

#### API Endpoints

**Authentication**
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

**Companies**
- `GET /api/companies` - Get all companies
- `POST /api/companies` - Create company (Admin/Manager)
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company (Admin/Manager)

**Pending Updates**
- `GET /api/pending-updates` - Get pending updates (Admin/Manager)
- `POST /api/pending-updates/:id/approve` - Approve update (Admin/Manager)
- `POST /api/pending-updates/:id/reject` - Reject update (Admin/Manager)

**Users**
- `GET /api/users` - Get all users (Admin)
- `POST /api/users` - Create user (Admin)
- `GET /api/users/officers` - Get officers list (Admin/Manager)

**Reports**
- `GET /api/reports/companies/excel` - Download Excel report (Admin/Manager)

### Frontend Development

#### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### Key Components
- **AuthContext**: Manages authentication state
- **ProtectedRoute**: Handles role-based routing
- **ApiService**: Centralized API communication
- **CompanyTable**: Company management interface
- **PendingApprovals**: Approval workflow interface

## 🗃️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Officer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Companies Table
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_address TEXT NOT NULL,
  drive VARCHAR(255) NOT NULL,
  type_of_drive VARCHAR(100) NOT NULL,
  follow_up VARCHAR(100) NOT NULL,
  is_contacted BOOLEAN DEFAULT FALSE,
  remarks TEXT,
  contact_details TEXT NOT NULL,
  hr1_details TEXT,
  hr2_details TEXT,
  package VARCHAR(100) NOT NULL,
  assigned_officer_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Pending Updates Table
```sql
CREATE TABLE pending_updates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
  officer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  original_data JSONB NOT NULL,
  updated_data JSONB NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Granular permissions based on user roles
- **Password Hashing**: bcrypt for secure password storage
- **Rate Limiting**: Prevents API abuse
- **CORS Protection**: Configured for frontend domain
- **Helmet.js**: Security headers and protection
- **Input Validation**: Server-side validation for all inputs

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check if PostgreSQL is running
sudo service postgresql status

# Restart PostgreSQL if needed
sudo service postgresql restart

# Check if database exists
psql -U postgres -l
```

#### Backend Not Starting
1. Verify `.env` file exists with correct database credentials
2. Ensure PostgreSQL is running and accessible
3. Check if port 5000 is available
4. Run `npm run init-db` to create tables

#### Frontend Not Connecting to Backend
1. Ensure backend is running on port 5000
2. Check browser console for CORS errors
3. Verify API_BASE_URL in `src/lib/api.ts`

#### Permission Issues
1. Verify user roles in database
2. Check JWT token in browser localStorage
3. Ensure proper role-based route protection

### Reset Database
If you need to reset the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Drop and recreate database
DROP DATABASE placement_platform;
CREATE DATABASE placement_platform;
\q

# Reinitialize tables
cd backend
npm run init-db
```

## 📝 Production Deployment

### Environment Variables for Production
Update your `.env` file for production:

```env
NODE_ENV=production
JWT_SECRET=your_very_secure_production_jwt_secret
DB_HOST=your_production_db_host
DB_PASSWORD=your_production_db_password
FRONTEND_URL=https://your-frontend-domain.com
```

### Build for Production
```bash
# Build frontend
npm run build

# Start backend in production mode
cd backend
npm start
```

## 📞 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are installed correctly
3. Ensure database credentials are correct
4. Check both frontend and backend console logs for errors

For additional help, please review the error messages in:
- Browser developer console (F12)
- Backend terminal output
- PostgreSQL logs

## 🎯 Next Steps

After successful setup, consider:

1. **Adding More Features**: Implement file uploads, notifications, dashboard analytics
2. **Enhancing Security**: Add password policies, session management, audit logs
3. **Performance Optimization**: Implement caching, database indexing, pagination
4. **Testing**: Add unit tests and integration tests
5. **Monitoring**: Set up logging and error tracking

Happy coding! 🚀
