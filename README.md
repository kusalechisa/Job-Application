"# Job-Application-BackEnd

A backend API for a job application platform built with Node.js, Express, and Prisma ORM.

## Overview

This is the backend server for the Job Application platform, providing RESTful APIs for managing user accounts, authentication, and job postings.

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database ORM**: Prisma
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── modules/
│   ├── accounts/       # User account management
│   ├── auth/          # Authentication endpoints
│   └── jobs/          # Job posting management
├── middleware/        # Express middleware (auth, etc.)
├── utils/            # Utility functions
├── app.js            # Express app setup
└── prisma.js         # Prisma client setup

prisma/
├── schema.prisma     # Database schema definition
└── migrations/       # Database migrations

api-doc/
└── swagger.js        # Swagger/OpenAPI documentation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL or compatible database

### Installation

1. Clone the repository
```bash
git clone https://github.com/benadasu/Job-Application-BackEnd.git
cd Job-Application-BackEnd
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

4. Run database migrations
```bash
npx prisma migrate dev
```

5. Start the server
```bash
npm start
```

## API Documentation

API documentation is available via Swagger/OpenAPI. Once the server is running, visit the Swagger UI endpoint to explore available endpoints.

## Available Modules

### Accounts
- User account creation and management
- User profile operations

### Authentication
- User login and registration
- JWT token generation and verification

### Jobs
- Job posting creation and management
- Job listing and search functionality

## License

This project is licensed under the MIT License.

## Author

Created by benadasu" 
