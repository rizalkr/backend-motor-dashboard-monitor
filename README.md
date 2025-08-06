# Vehicle Maintenance Tracking API

A secure, multi-tenant backend service for tracking vehicle maintenance records, oil changes, and fuel consumption. Built with Node.js, Express.js, and PostgreSQL.

## Features

- **Multi-tenant Architecture**: Each user's data is properly isolated
- **JWT Authentication**: Secure token-based authentication
- **Vehicle Management**: Add, view, search, and delete vehicles
- **Oil Change Tracking**: Record and manage oil change history
- **Fuel Record Tracking**: Track fuel consumption and costs
- **Search & Pagination**: Efficient data retrieval with search functionality
- **Input Validation**: Comprehensive validation using express-validator
- **Security**: Password hashing, SQL injection prevention, CORS protection

## Technology Stack

- **Backend Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JSON Web Tokens (JWT)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Database Driver**: node-postgres (pg)
- **Environment Variables**: dotenv
- **CORS**: cors middleware

## Project Structure

```
/
├── src/
│   ├── controllers/
│   │   ├── authController.js      # Authentication logic
│   │   ├── vehicleController.js   # Vehicle management
│   │   ├── oilChangeController.js # Oil change records
│   │   └── fuelRecordController.js # Fuel tracking
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── vehicleRoutes.js       # Vehicle endpoints
│   │   ├── oilChangeRoutes.js     # Oil change endpoints
│   │   └── fuelRecordRoutes.js    # Fuel record endpoints
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── config/
│   │   └── db.js                  # Database connection
│   └── index.js                   # Server entry point
├── database_schema.sql            # Database schema
├── .env                          # Environment variables
├── .gitignore
└── package.json
```

## Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
cd dashboard-motor
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE vehicle_maintenance;
```

2. Run the database schema:
```bash
psql -U your_username -d vehicle_maintenance -f database_schema.sql
```

### 3. Environment Configuration

Update the `.env` file with your database credentials and JWT secret:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vehicle_maintenance
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=3000
NODE_ENV=development
```

### 4. Start the Server

Development mode (with auto-restart):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login user |

### Vehicles (`/api/vehicles`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vehicles` | Create a new vehicle |
| GET | `/api/vehicles` | Get all vehicles (with search & pagination) |
| GET | `/api/vehicles/:id` | Get single vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |

### Oil Changes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vehicles/:vehicleId/oil-changes` | Add oil change record |
| GET | `/api/vehicles/:vehicleId/oil-changes` | Get oil change history |
| PATCH | `/api/oil-changes/:id` | Update oil change record |
| DELETE | `/api/oil-changes/:id` | Delete oil change record |

### Fuel Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/vehicles/:vehicleId/fuel-records` | Add fuel record |
| GET | `/api/vehicles/:vehicleId/fuel-records` | Get fuel history |
| PATCH | `/api/fuel-records/:id` | Update fuel record |
| DELETE | `/api/fuel-records/:id` | Delete fuel record |

## API Usage Examples

### Authentication

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123"
  }'
```

### Vehicle Management

**Create Vehicle:**
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Honda Civic",
    "license_plate": "ABC-123"
  }'
```

**Get Vehicles with Search:**
```bash
curl "http://localhost:3000/api/vehicles?search=honda&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Oil Changes

**Add Oil Change:**
```bash
curl -X POST http://localhost:3000/api/vehicles/1/oil-changes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "change_date": "2024-01-15",
    "mileage": 15000,
    "notes": "Regular maintenance"
  }'
```

### Fuel Records

**Add Fuel Record:**
```bash
curl -X POST http://localhost:3000/api/vehicles/1/fuel-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fill_date": "2024-01-15",
    "price_per_liter": 1.45,
    "liters_filled": 45.5
  }'
```

## Response Format

### Success Response (List)
```json
{
  "status": "success",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "limit": 10
  },
  "data": [...]
}
```

### Success Response (Single Item)
```json
{
  "status": "success",
  "data": {...}
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Descriptive error message"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs with salt rounds
- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: express-validator middleware
- **CORS Protection**: Configurable CORS settings
- **Data Isolation**: Multi-tenant data separation

## Database Schema

The application uses four main tables:

- **users**: User accounts with email and hashed passwords
- **vehicles**: Vehicle information linked to users
- **oil_changes**: Oil change maintenance records
- **fuel_records**: Fuel consumption tracking

All foreign key relationships include CASCADE DELETE for data consistency.

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
