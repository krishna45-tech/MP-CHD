# CardioSight

CardioSight is a full-stack machine-learning application for **coronary
heart disease risk prediction**. The project combines an Angular
frontend, an Express/Node.js backend, PostgreSQL for application data,
and a Django-based ML service.

## Project Structure

``` text
CardioSight/
├── Backend/          # Express/Node.js API gateway and PostgreSQL integration
├── Frontend/         # Angular web application
└── ML/               # Django ML service and trained model artifacts
```

## Tech Stack

### Frontend

-   Angular
-   TypeScript
-   HTML / SCSS
-   Angular Router
-   HTTP client/services for API communication

### Backend

-   Node.js
-   Express.js
-   PostgreSQL
-   JWT authentication
-   bcrypt password hashing
-   CORS
-   dotenv

### Machine Learning

-   Python
-   Django
-   Trained machine-learning model
-   `joblib` model artifact

## Main Features

-   User registration and login
-   JWT-based authentication
-   Protected application routes
-   User profile management
-   Health-risk prediction workflow
-   Prediction result display
-   Prediction/history-related functionality
-   Dashboard and analytics views
-   Admin dashboard and user management
-   Health-related informational content
-   PostgreSQL-backed application data

## Architecture

``` text
                         ┌──────────────────────┐
                         │   Angular Frontend   │
                         │    localhost:4200    │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │  Express Backend     │
                         │    localhost:3000    │
                         └───────┬───────┬──────┘
                                 │       │
                       PostgreSQL│       │ML requests
                                 ▼       ▼
                    ┌──────────────┐  ┌────────────────┐
                    │ PostgreSQL   │  │ Django ML      │
                    │ :5432        │  │ Service :8000  │
                    └──────────────┘  └────────────────┘
```

## Prerequisites

Install the following before running the project:

-   Node.js
-   npm
-   PostgreSQL
-   Python 3
-   pip
-   Angular CLI (or use the project's npm scripts)

## 1. Clone the Repository

``` bash
git clone <YOUR_REPOSITORY_URL>
cd CardioSight
```

## 2. Backend Setup

``` bash
cd Backend
npm install
```

Create a `.env` file inside `Backend/`.

Example:

``` env
PORT=3000

DATABASE_URL=postgres://cardiosight:cardiosight@localhost:5432/cardiosight
PGHOST=localhost
PGPORT=5432
PGUSER=cardiosight
PGPASSWORD=cardiosight
PGDATABASE=cardiosight

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

ML_SERVER_URL=http://localhost:8000

CORS_ORIGINS=http://localhost:4200
```

> Never commit `.env` files or real secrets to GitHub.

Start the backend:

``` bash
npm start
```

The API runs on:

``` text
http://localhost:3000
```

Health check:

``` text
http://localhost:3000/api/health
```

## 3. Frontend Setup

Open a new terminal:

``` bash
cd Frontend
npm install
```

Start Angular on the fixed development port:

``` bash
npm start
```

The frontend runs on:

``` text
http://localhost:4200
```

The frontend API configuration points to:

``` text
http://localhost:3000/api
```

## 4. ML Service Setup

The ML component is located in:

``` text
ML/
```

Create and activate a Python virtual environment if one is not already
available:

``` bash
cd ML
python3 -m venv .venv
source .venv/bin/activate
```

Install the required Python dependencies according to the ML project's
dependency file.

Then start the Django ML service using the project's Django
configuration.

The backend is configured to communicate with the ML service through:

``` env
ML_SERVER_URL=http://localhost:8000
```

## Running the Complete Application

Run the three services in separate terminals.

### Terminal 1 --- PostgreSQL

Make sure PostgreSQL is running and the CardioSight database is
available.

### Terminal 2 --- ML Service

Start the Django ML service on:

``` text
http://localhost:8000
```

### Terminal 3 --- Backend

``` bash
cd Backend
npm start
```

Backend:

``` text
http://localhost:3000
```

### Terminal 4 --- Frontend

``` bash
cd Frontend
npm start
```

Frontend:

``` text
http://localhost:4200
```

## API

The Express backend exposes routes under:

``` text
/api
```

Authentication routes are under:

``` text
/api/auth
```

For example:

``` text
POST /api/auth/signin
POST /api/auth/signup
GET  /api/health
```

Additional user, prediction, dashboard, and admin routes are implemented
under the backend API.

## Environment Variables

The backend uses environment variables for:

-   PostgreSQL connection details
-   JWT configuration
-   ML service URL
-   CORS configuration
-   Server port

Keep secrets local and use a safe secret value for `JWT_SECRET`.

A `.env.example` file can be added to document required variables
without exposing credentials.

## Security Notes

-   Passwords are hashed using bcrypt.
-   Authentication uses JWT.
-   CORS is configured for the Angular development server.
-   Environment files are excluded from Git.
-   Database credentials and JWT secrets should never be committed to
    the repository.

## Development Ports

  Service                 Port
  ------------------- --------
  Angular Frontend      `4200`
  Express Backend       `3000`
  Django ML Service     `8000`
  PostgreSQL            `5432`

## Future Improvements

-   Improve model evaluation and validation
-   Add more comprehensive automated tests
-   Add production deployment configuration
-   Add model monitoring and versioning
-   Improve API documentation
-   Add CI/CD pipeline
-   Add Docker-based development/deployment
-   Improve accessibility and responsive design

## Contributors

CardioSight was developed as a team project.

Add team member names and GitHub profiles here:

``` text
1. Name — GitHub profile
2. Name — GitHub profile
3. Name — GitHub profile
```

## License

This project is intended for academic/project purposes. Add the
appropriate license before distributing it publicly.
