
# Placement Platform - Full Stack Application

A comprehensive placement management platform built with React frontend and Node.js backend, featuring role-based access control and PostgreSQL database integration.

## 🏗️ Architecture

- **Frontend**: React with TypeScript, TailwindCSS, shadcn/ui
- **Backend**: Node.js with Express
- **Database**: PostgreSQL
- **Authentication**: JWT-based auth with role-based access control

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Docker & Docker Compose** - [Download](https://docs.docker.com/get-docker/)

### Option 1: Docker Setup (Recommended)
```bash
# Clone the repository
git clone <repository-url>
cd placement-platform

# Setup with Docker
cd backend
npm run docker:setup
```

### Option 2: Local Development
```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run init-db
npm run dev

# Frontend setup (in new terminal)
cd ../
npm install
npm run dev
```

## 📋 Default Login Credentials

- **Admin**: admin@placement.com / password
- **Manager**: manager@placement.com / password
- **Officer**: officer@placement.com / password

## 📚 Documentation

- [Setup Guide](docs/SETUP.md) - Detailed setup instructions
- [Docker Guide](docs/DOCKER.md) - Docker setup and management
- [Development Guide](docs/DEVELOPMENT.md) - Development guidelines and API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [Troubleshooting](docs/TROUBLESHOOTING.md) - Common issues and solutions

## 🔒 Security Features

- JWT Authentication with role-based access control
- Password hashing with bcrypt
- Rate limiting and CORS protection
- Input validation and security headers

## 📞 Support

For issues and questions, check the [Troubleshooting Guide](docs/TROUBLESHOOTING.md) or review the documentation files above.

## 📝 License

MIT License - see LICENSE file for details.
