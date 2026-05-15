# Job-Application-BackEnd

A backend API for a job application platform built with Node.js, Express, and Prisma ORM.

## Overview

This backend provides REST APIs for user authentication, applicant profile management, job postings, applications, and admin dashboards.

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
│   ├── auth/           # Authentication endpoints
│   ├── jobs/           # Job posting management
│   ├── applicants/     # Applicant profile and job applications
│   └── applications/   # Application review and dashboard APIs
├── middleware/         # Express middleware (auth, etc.)
├── utils/              # Utility functions
├── app.js              # Express app setup
└── prisma.js           # Prisma client setup

prisma/
├── schema.prisma       # Database schema definition
└── migrations/         # Database migrations

api-doc/
└── swagger.js          # Swagger/OpenAPI documentation
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

Once the server is running, open Swagger UI at:

```bash
http://localhost:5002/api-docs
```

## Key Features

- JWT-based authentication
- Admin-managed job postings
- Job search, filter, and pagination
- Applicant profile creation and update
- Resume storage on applicant profile
- One-click job application using the applicant's saved resume
- Admin application review and dashboard stats

## Important Workflow Notes

- `Account` and `Applicant` are separate models.
- Signing up creates only the user account.
- Applicants must create/update their profile separately with:
  - `phone`
  - `address`
  - `gender`
  - `resume`
- When applying for a job, the system uses the resume stored in the applicant profile.

## Main Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### User Accounts
- `POST /api/users/register`
- `POST /api/users` (Admin only)
- `GET /api/users/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `GET /api/users` (Admin only)
- `GET /api/users/:id` (Admin only)
- `PUT /api/users/:id` (Admin only)

### Applicant Profile
- `POST /api/jobs/profile` - Create profile
- `GET /api/jobs/profile` - Get own profile
- `PUT /api/jobs/profile` - Update own profile

### Jobs
- `GET /api/jobs` - List jobs with search/filter/pagination
- `GET /api/jobs/:jobId` - Get job details
- `POST /api/jobs` - Create job (Admin only)
- `PUT /api/jobs/:jobId` - Update job (Admin only)
- `DELETE /api/jobs/:jobId` - Delete job (Admin only)

### Applications
- `POST /api/jobs/apply` - Apply to job using profile resume
- `GET /api/jobs/applications/my` - Get own applications
- `GET /api/jobs/applications` - Get all applications (Admin only)
- `GET /api/jobs/:jobId/applications` - Get applications for a job (Admin only)
- `GET /api/jobs/applications/:applicationId` - Get application details (Admin only)
- `PUT /api/jobs/applications/:applicationId/status` - Update status (Admin only)
- `PUT /api/jobs/applications/:applicationId/withdraw` - Withdraw own application
- `PUT /api/jobs/applications/:applicationId` - Update own application
- `GET /api/jobs/:jobId/applications/download` - Download job applications Excel (Admin only)

### Stats
- `GET /api/stats/jobs` - Job dashboard stats (Admin only)
- `GET /api/stats/applications` - Application dashboard stats (Admin only)

## File Uploads

Resume files are stored under:

```bash
uploads/resumes/
```

Supported file types: `pdf`, `doc`, `docx`, `txt`.

## License

This project is licensed under the MIT License.

## Author

Created by benadasu 
