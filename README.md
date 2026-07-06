# TaskTest — AWS SaaS Task Management App

TaskTest is a full-stack, multi-tenant task management SaaS application built as a portfolio project to demonstrate practical AWS cloud engineering skills.

It supports user authentication, team collaboration, personal and team lists, and task workflows with proper role-based access controls.

**Live Demo**: [Add your CloudFront URL here]

---

## Architecture

<div align="center">
  <img src="Architecture.png" alt="TaskTest SaaS Architecture Diagram" width="850">
</div>

**High-level serverless architecture**:
- **Frontend**: Static React app hosted on Amazon S3 with CloudFront CDN for global low-latency delivery
- **Authentication**: Amazon Cognito
- **Backend**: API Gateway + AWS Lambda
- **Database**: Amazon DynamoDB (with tenant isolation)
- **Security**: IAM least-privilege roles, token-based authorization

---

## Why this project

This project showcases my ability to:
- Design and implement a secure, multi-tenant SaaS application on AWS
- Build a modern React frontend with clean service layers
- Integrate AWS Cognito authentication and authorization flows
- Develop API-driven features using Lambda, API Gateway, and DynamoDB
- Handle real-world challenges like tenant scoping, auth edge cases, and permission enforcement

---

## Core Features

- **Authentication** — Cognito sign-up/sign-in with OAuth callback and protected routes
- **Team Management** — Create teams, invite members, owner/member permission model
- **List Management** — Personal and team lists with tenant-aware filtering
- **Task Management** — CRUD operations on tasks with real-time updates to DynamoDB

---

## Tech Stack

### Frontend
- React (Vite)
- React Router
- Context API for auth state
- Service layer for API calls

### AWS Backend
- Amazon Cognito (authentication & user management)
- Amazon API Gateway (REST API)
- AWS Lambda (business logic)
- Amazon DynamoDB (NoSQL data store)
- Amazon S3 + CloudFront (static hosting & CDN)

**Additional AWS Services**:
- IAM (least-privilege roles)
- CloudWatch (monitoring & basic alarms)

---

## Architecture Highlights & Decisions

- **Serverless-first** design using S3 + CloudFront for the frontend to minimize cost and operational overhead while providing excellent global performance.
- **Tenant isolation** enforced at the application level in Lambda functions and DynamoDB access patterns.
- **Security**: Cognito for auth, IAM roles with least privilege, and token validation on all API calls.
- **Scalability**: The architecture automatically scales with demand thanks to serverless components.
- Aligned with key **AWS Well-Architected Framework** pillars (Security, Reliability, Cost Optimization).

---

## Local Development

### 1. Install dependencies

npm install


### 2. Configure environment variables
Create .env in the root:
envVITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/dev
VITE_COGNITO_DOMAIN=https://your-domain.auth.region.amazoncognito.com
VITE_CLIENT_ID=your_cognito_app_client_id

### 3. Run locally
npm run dev

### 4. Build for production
npm run build

### Project Structure

src/pages/ — Route-level components
src/components/ — Reusable UI elements
src/services/ — API and auth service layers
src/contexts/ — React context for auth/session
src/lib/ — Cognito configuration helpers


### Portfolio Highlights

Implemented realistic multi-tenant SaaS patterns with team/personal scopes
Handled complex auth and authorization flows across frontend and backend
Focused on clean code, separation of concerns, and production-like error handling
Stayed within AWS Free Tier limits through serverless design


### Future Enhancements

Infrastructure as Code (Terraform / CloudFormation)
CI/CD pipeline with GitHub Actions
Real-time features with AWS AppSync / WebSockets
Advanced monitoring dashboards and automated testing


### Author
Built by William Buechele as a portfolio project to demonstrate practical AWS SaaS cloud engineering skills.
github.com/fredly11 | https://www.linkedin.com/in/william-buechele/


