# TaskTest — AWS SaaS Task Management App

TaskTest is a full-stack task management application built as a portfolio project to demonstrate practical SaaS architecture on AWS.

It supports authentication, team collaboration, personal/team list management, and task workflows with role-aware access controls.

---

## Why this project

This project showcases my ability to:

- Design and implement a multi-tenant SaaS workflow
- Build a modern React frontend with modular service layers
- Integrate AWS Cognito authentication and authorization
- Build API-driven features backed by Lambda + API Gateway + DynamoDB
- Debug real-world auth/tenant scoping issues across frontend and backend

---

## Core features

- **Authentication**
	- Cognito Managed sign-in / sign-up
	- OAuth callback/token exchange flow
	- Protected app flows based on signed-in state

- **Team management**
	- Create teams
	- Add/remove team members
	- Owner/member permission checks

- **List management**
	- Create **personal** and **team** lists
	- Filter lists by personal or selected team
	- Tenant-aware list loading

- **Task management**
	- Fetch tasks for a selected list
	- Create tasks in a list
	- Edit task fields and persist updates via PATCH

---

## Tech stack

### Frontend
- React (Vite)
- React Router
- Context API for auth state
- Service layer pattern for API integration

### AWS / Backend
- Amazon Cognito (authentication)
- API Gateway (REST endpoints)
- AWS Lambda (business logic)
- DynamoDB (data persistence)

---

## Architecture snapshot

1. User signs in via Cognito hosted UI.
2. Frontend exchanges auth code for tokens and stores session state.
3. React app calls API Gateway endpoints with bearer token.
4. Lambda functions enforce authorization and tenant/team membership rules.
5. DynamoDB stores team, list, and task records keyed for tenant isolation.

---

## Local development

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Create a `.env` file in the project root with values for your AWS resources.

Example:

```env
VITE_API_URL=https://your-api-id.execute-api.region.amazonaws.com/dev
VITE_COGNITO_DOMAIN=https://your-domain.auth.region.amazoncognito.com
VITE_CLIENT_ID=your_cognito_app_client_id
```

### 3) Run locally

```bash
npm run dev
```

### 4) Build for production

```bash
npm run build
npm run preview
```

---

## Project structure

- `src/pages/` — route-level pages (Home, Teams, Lists, ListDetail, Auth pages)
- `src/components/` — reusable UI components (forms, navbar, footer)
- `src/services/` — API/service calls (`api.js`, `auth.js`, etc.)
- `src/contexts/` — React auth context and session state
- `src/lib/` — Cognito/Amplify configuration helpers

---

## Portfolio highlights

- Built a realistic SaaS collaboration flow with team + personal scopes
- Implemented tenant-aware API query strategies for cross-user/team access
- Handled real integration edge cases (token handling, 401 vs 403 behavior, tenant key alignment)
- Iteratively improved UX with dedicated Teams, Lists, and List Detail pages

---

## Future enhancements

- End-to-end automated tests (frontend + Lambda integration)
- Better role granularity (owner/admin/member permissions)
- Real-time updates (WebSockets/AppSync)
- Deployment pipeline (GitHub Actions + IaC)

---

## Author

Built by **William Buechele** as a portfolio project focused on practical AWS SaaS cloud engineering.
