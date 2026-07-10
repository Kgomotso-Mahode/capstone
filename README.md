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

## Images

All listing placeholder images and section images are sourced from [Unsplash](https://unsplash.com), a free stock photo platform.

| Image | Source |
|-------|--------|
| Cape Town listings | [Unsplash – photo-1580060839134](https://unsplash.com/photos/photo-1580060839134-75a5edca2e99) |
| Default listing fallback | [Unsplash – photo-1560448204](https://unsplash.com/photos/photo-1560448204-e02f11c3d0e2) |
| Hero section | [Unsplash – photo-1576485290814](https://unsplash.com/photos/photo-1576485290814-1c72aa4bbb8e) |
| Gift cards section | [Unsplash – photo-1512486130939](https://unsplash.com/photos/photo-1512486130939-2c4f79935e4f) |
| Hosting section | [Unsplash – photo-1564013799919](https://unsplash.com/photos/photo-1564013799919-ab600027ffc6) |

## License

This project was built as a capstone project for educational purposes.
