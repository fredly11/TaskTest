# TaskSaaS — Static Marketing Site

This is a minimal Vite + React static website scaffold for a SaaS task management application.

Local development

1. Install dependencies

```bash
npm install
```

2. Run dev server

```bash
npm run dev
```

Build

```bash
npm run build
npm run preview
```

Backend integration

This scaffold posts sign-up requests to your backend at `POST /signup` (configured via `VITE_API_URL`).
For production you can front a Lambda/API Gateway endpoint with CloudFront and use Cognito for authentication.

Files added

- `index.html` — app shell
- `src/` — React app
- `public/` — static assets (favicon)
- `package.json`, `vite.config.js`
# TaskTest
A task management application demonstrating use of AWS Cloud Services in a SaaS project.
