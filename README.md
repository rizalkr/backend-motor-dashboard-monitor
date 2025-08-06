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

#### Option A: Automated Setup (Recommended)
```bash
# 1. First, ensure PostgreSQL is installed and running
sudo systemctl start postgresql  # On Linux
brew services start postgresql   # On macOS

# 2. Configure your .env file with database credentials
cp .env.example .env  # Then edit .env with your settings

# 3. Run the automated setup script
./setup-database.sh
```

#### Option B: Manual Setup
1. Create a PostgreSQL database:
```sql
sudo -u postgres psql
CREATE DATABASE vehicle_maintenance;
CREATE USER your_db_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE vehicle_maintenance TO your_db_user;
\q
```

2. Run the database schema:
```bash
psql -U your_db_user -d vehicle_maintenance -f database_schema.sql
```

### 3. Database Status Check

Check if your database is ready:
```bash
# Quick status check
npm run check-db

# Detailed connection test
npm run test-db
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

## Troubleshooting Database Issues

### Common Database Connection Problems

#### 1. "password authentication failed"
```bash
# Check PostgreSQL user exists and has correct password
sudo -u postgres psql
\du  # List all users
ALTER USER your_db_user WITH PASSWORD 'new_password';
```

#### 2. "database does not exist"
```bash
# Create the database
sudo -u postgres createdb vehicle_maintenance
# Or grant createdb permission to your user
sudo -u postgres psql
ALTER USER your_db_user CREATEDB;
```

#### 3. "connection refused" / PostgreSQL not running
```bash
# On Ubuntu/Debian
sudo systemctl status postgresql
sudo systemctl start postgresql

# On macOS with Homebrew
brew services list | grep postgresql
brew services start postgresql

# On Windows
# Use Services manager or PostgreSQL installer tools
```

#### 4. Check PostgreSQL configuration
```bash
# Find PostgreSQL config files
sudo -u postgres psql -c "SHOW config_file;"

# Common locations:
# Ubuntu: /etc/postgresql/*/main/postgresql.conf
# macOS: /usr/local/var/postgres/postgresql.conf
```

### Database Verification Commands

```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Test connection manually
psql -h localhost -U your_db_user -d vehicle_maintenance -c "SELECT version();"

# List all databases
psql -h localhost -U your_db_user -l

# Quick API health check
curl http://localhost:3000/health
```

### Environment Variables Checklist

Make sure your `.env` file contains:
```env
DB_HOST=localhost          # PostgreSQL host
DB_PORT=5432              # PostgreSQL port (default: 5432)
DB_NAME=vehicle_maintenance # Database name
DB_USER=your_db_user      # PostgreSQL username
DB_PASSWORD=your_password  # PostgreSQL password
JWT_SECRET=your_secret_key # Strong secret for JWT tokens
```

### Scripts Available

| Command | Description |
|---------|-------------|
| `npm run check-db` | Quick database status check |
| `npm run test-db` | Detailed database connection test |
| `./setup-database.sh` | Automated database setup |
| `npm run setup-db` | Run schema SQL file |
```
