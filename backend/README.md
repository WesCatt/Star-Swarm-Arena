# Backend Deploy

This folder contains the backend runtime files that need to ship together.

Deploy these two paths together:

- `backend/`
- `dist/`

Typical server steps:

```bash
cd backend
npm install
npm start
```

Optional environment variables:

```bash
HOST=0.0.0.0
PORT=3001
```

The backend server serves the built frontend from the sibling `dist/` directory, so the deployed layout should look like this:

```text
your-deploy-root/
  backend/
  dist/
```
