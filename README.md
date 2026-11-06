# VoltKart

VoltKart is a full-stack electronics storefront built as a demonstration of a modern shopping experience. Customers can browse products, manage a cart, create an account, and place cash-on-delivery orders.

## Features

- Product catalogue with search, category filters, sorting, product details, specifications, and sample reviews
- Shopping cart saved in the browser
- Account registration, login, and password recovery
- Protected checkout and order history
- Delivery address collection and cash-on-delivery orders
- Server-side product pricing and order total calculation

## Technology

- Frontend: React, React Router, Vite, Tailwind CSS, and Lucide icons
- Backend: Node.js, Express, and Mongoose
- Database: MongoDB
- Authentication: JSON Web Tokens and bcrypt password hashing

## Requirements

- Node.js 20.19 or later, or Node.js 22.12 or later
- npm
- A MongoDB instance, either local or hosted

## Getting started

1. Install the dependencies separately in the `server` and `client` directories using npm.
2. Copy `server/.env.example` to `server/.env`, then set `PORT` to the desired API port (the default is 5000), `FRONTEND_URL` to the frontend origin, `MONGO_URI` to your MongoDB connection string, and `JWT_SECRET` to a strong, unique secret. For multiple frontend origins, separate them with commas. Set `FRONTEND_URL=*` only when temporarily allowing all origins; restrict it to the deployed frontend origin when available. The real `.env` file is excluded from Git.
3. Start the backend from the `server` directory with `npm run dev`. The API connects to MongoDB before it starts listening.
4. In a separate terminal, start the frontend from the `client` directory with `npm run dev`.
5. Open `http://localhost:5173` in a browser. The Vite development server forwards API requests to the backend on port 5000.

Never commit real credentials or production secrets. Use a securely managed environment configuration for deployments.

## Application overview

The frontend is a single-page application. Its development server proxies API requests to the Express service. The backend serves the product catalogue and reviews, validates checkout details, calculates order totals from its own catalogue, and stores accounts and orders in MongoDB.

The cart and signed-in session are persisted in the browser. Order placement and order history require authentication. Passwords are stored as bcrypt hashes.

Password recovery is intended for local development: the backend prints a reset link to its console and includes a development reset link in its response outside production. No email delivery service is configured.

## Project structure

- `client/` — React application, static product images, and frontend build configuration
- `server/` — Express API, MongoDB models, product catalogue, and server scripts

## Available scripts

- Client: `npm run dev` starts the development server, `npm run build` creates a production build, `npm run preview` previews that build, and `npm run lint` runs ESLint.
- Server: `npm run dev` starts the API with automatic restarts; `npm start` starts it without watch mode.

## Deploy the frontend to Netlify

1. Import `AkshtSaxena/voltkart-ecommerce` from GitHub in Netlify.
2. Set the base directory to `client`, the build command to `npm run build`, and the publish directory to `dist`.
3. Deploy the site. In production, the client uses the public Render API URL in its source code; no API secret or frontend environment variable is required. The `_redirects` file configures SPA route fallback.
4. Copy the generated Netlify site origin into the Render API service's `FRONTEND_URL` setting, replacing `*` with the exact origin, then redeploy the API.
