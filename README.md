# Airbnb Clone — South Africa

A full-stack Airbnb-inspired accommodation booking platform built for South African destinations. Users can browse listings by city, create reservations, and hosts can manage their properties through a dedicated dashboard.

**Live Demo:** [https://kgomotsomcapstone.herokuapp.com](https://kgomotsomcapstone.herokuapp.com)

---

## Features

- **Browse Listings** — Search and filter accommodations by location, type, price, and guest count
- **Property Details** — Full listing pages with image gallery, amenities, reviews, and pricing breakdown
- **Reservations** — Book accommodations with date selection and guest count
- **Host Dashboard** — Create, view, and manage property listings
- **Role-Based Auth** — User, Host, and Admin roles with JWT authentication
- **Image Uploads** — Hosts can upload multiple images per listing (stored locally)
- **Responsive Design** — Mobile-first UI built with Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Tailwind CSS |
| Backend | Node.js, Express 4, Mongoose 7 |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Tokens) |
| File Uploads | Multer |
| Hosting | Heroku |

## Project Structure

```
├── backend/
│   ├── controllers/       # Route handlers
│   ├── middleware/         # Auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── uploads/           # Uploaded images (gitignored)
│   ├── server.js          # Express entry point
│   ├── seed.js            # Database seeder (40+ SA properties)
│   └── .env               # Environment variables (gitignored)
├── client/
│   ├── src/
│   │   ├── api.js         # Centralized API client
│   │   ├── components/    # Shared UI components
│   │   ├── context/       # Auth context provider
│   │   └── pages/         # Page components
│   └── package.json
├── admin/
│   └── src/               # Admin panel (React)
└── package.json           # Root scripts for build/deploy
```

## Getting Started

### Prerequisites

- Node.js 20.x
- MongoDB (local or Atlas)

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/airbnb-clone
JWT_SECRET=your-secret-key-here
```

### 3. Seed the Database (optional)

```bash
npm run seed
```

This creates 40+ South African property listings and a host user (`host@airbnb.co.za` / `host123456`).

### 4. Run in Development

Open three terminals:

```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Client (port 3000)
npm run dev:client

# Terminal 3 — Admin panel (port 3001)
npm run dev:admin
```

The client runs on `http://localhost:3000` and proxies API requests to `http://localhost:5000`.

### 5. Production Build

```bash
npm run build        # Builds client and admin
npm start            # Starts the backend server
```

In production, the backend serves both the client and admin SPAs.

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | Login (returns JWT) |
| POST | `/api/users/register` | Register new user |
| PUT | `/api/users/role` | Update user role (auth required) |

### Accommodations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/accommodations` | List all (supports filters) |
| GET | `/api/accommodations/:id` | Get single listing |
| POST | `/api/accommodations` | Create listing (host, auth + image upload) |
| PUT | `/api/accommodations/:id` | Update listing (host, auth + image upload) |
| DELETE | `/api/accommodations/:id` | Delete listing (host, auth) |

### Reservations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reservations` | Create reservation (auth required) |
| GET | `/api/reservations/user` | Get user's reservations (auth required) |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret for JWT signing |
| `PORT` | No | Server port (default: 5000) |
| `CLIENT_ORIGIN` | No | CORS allowed origins (comma-separated) |
| `REACT_APP_API_URL` | No | API base URL for client (empty = proxy in dev) |

## License

This project was built as a capstone project for educational purposes.
