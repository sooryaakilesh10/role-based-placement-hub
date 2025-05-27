
# Development Guide

This guide covers development workflows, API documentation, and coding standards.

## Development Workflow

### Backend Development

#### Available Scripts
- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run init-db` - Initialize database tables and sample data

#### Project Structure
```
backend/
├── config/
│   └── database.js          # Database connection
├── middleware/
│   └── auth.js             # Authentication middleware
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── companies.js        # Company management
│   ├── pendingUpdates.js   # Approval workflow
│   ├── reports.js          # Report generation
│   └── users.js            # User management
├── scripts/
│   └── initDatabase.js     # Database initialization
└── server.js               # Main application file
```

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

## API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Login user with email and password.

**Request:**
```json
{
  "email": "admin@placement.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Admin",
    "email": "admin@placement.com",
    "role": "Admin"
  }
}
```

#### GET /api/auth/me
Get current user information (requires authentication).

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Admin",
  "email": "admin@placement.com",
  "role": "Admin"
}
```

#### POST /api/auth/logout
Logout current user.

### Company Endpoints

#### GET /api/companies
Get all companies with optional filtering.

**Query Parameters:**
- `search` - Search term for company name
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response:**
```json
{
  "companies": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

#### POST /api/companies
Create new company (Admin/Manager only).

**Request:**
```json
{
  "company_name": "TechCorp Inc.",
  "company_address": "123 Tech Street",
  "drive": "Campus Drive 2024",
  "type_of_drive": "On-Campus",
  "follow_up": "Weekly",
  "contact_details": "hr@techcorp.com",
  "package": "₹12 LPA",
  "assigned_officer_id": 3
}
```

#### PUT /api/companies/:id
Update company. Officers create pending updates, Admin/Manager update directly.

#### DELETE /api/companies/:id
Delete company (Admin/Manager only).

### Pending Updates Endpoints

#### GET /api/pending-updates
Get pending updates (Admin/Manager only).

#### POST /api/pending-updates/:id/approve
Approve pending update (Admin/Manager only).

#### POST /api/pending-updates/:id/reject
Reject pending update (Admin/Manager only).

### User Management Endpoints

#### GET /api/users
Get all users (Admin only).

#### POST /api/users
Create new user (Admin only).

**Request:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password",
  "role": "Officer"
}
```

#### GET /api/users/officers
Get all officers (Admin/Manager only).

### Reports Endpoints

#### GET /api/reports/companies/excel
Download Excel report of companies (Admin/Manager only).

## Database Schema

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
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Security Implementation

### JWT Authentication
- Tokens expire in 24 hours (configurable)
- Middleware validates tokens on protected routes
- Role-based access control implemented

### Password Security
- bcrypt hashing with salt rounds
- Minimum password requirements can be added

### API Security
- Rate limiting to prevent abuse
- CORS configuration for frontend domain
- Helmet.js for security headers
- Input validation and sanitization

## Role-Based Permissions

### Admin
- Full access to all features
- Create, edit, delete companies
- Manage users (create new users)
- Approve/reject officer updates
- Generate reports

### Manager
- Manage companies (create, edit, delete)
- Approve/reject officer updates
- Generate reports
- Cannot create new users

### Officer
- View companies
- Edit companies (requires approval)
- Limited access to other features

## Testing Guidelines

### Manual Testing
1. Test all role permissions
2. Verify approval workflow
3. Check Excel report generation
4. Test authentication flows

### API Testing with curl
```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@placement.com","password":"password"}'

# Get companies
curl -X GET http://localhost:5000/api/companies \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Code Standards

### Backend
- Use Express.js best practices
- Implement proper error handling
- Use async/await for database operations
- Follow RESTful API conventions

### Frontend
- Use TypeScript for type safety
- Implement proper error boundaries
- Use React Query for data fetching
- Follow component composition patterns

### Database
- Use parameterized queries to prevent SQL injection
- Implement proper foreign key relationships
- Use transactions for data integrity
