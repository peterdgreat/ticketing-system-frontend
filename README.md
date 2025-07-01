# Ticketing System Frontend

A Vue.js-based frontend application for a ticketing system that allows users to create, manage, and track support tickets.

## Features

- User authentication (Login/Signup)
- Role-based access control (Customer/Agent)
- Create and manage support tickets
- File attachments support (images, PDFs, documents)
- Real-time ticket status updates
- Ticket comments and discussions
- Export tickets to CSV (for agents)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager
- A running instance of the backend server

## Installation

1. Clone the repository:
```bash
git clone https://github.com/peterdgreat/ticketing-system-frontend
cd ticketing-system-frontend
```

2. Install dependencies:
```bash
npm install
```

## Environment Setup

Create a `.env.development` file in the root directory for development:

```plaintext
VITE_API_URL=http://localhost:3000
```

For production, create a `.env.production` file:

```plaintext
VITE_API_URL=https://ticketing-system-api-cmdx.onrender.com/graphql
```

## Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Create a production build:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```


## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Lint and fix files
- `npm run format`: Format code with Prettier




## Live preview
https://ticket-system-web.netlify.app



        