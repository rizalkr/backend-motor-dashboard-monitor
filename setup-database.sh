#!/bin/bash

# Database Setup Script for Vehicle Maintenance API
# This script helps set up the PostgreSQL database

set -e  # Exit on any error

echo " Vehicle Maintenance Database Setup"
echo "===================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo " .env file not found!"
    echo "Please create a .env file with your database configuration."
    echo "See .env for template."
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$DB_NAME" ] || [ -z "$DB_USER" ]; then
    echo " Required environment variables not set!"
    echo "Please ensure DB_NAME and DB_USER are set in your .env file."
    exit 1
fi

echo " Configuration:"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo "   Host: ${DB_HOST:-localhost}"
echo "   Port: ${DB_PORT:-5432}"
echo ""

# Function to check if PostgreSQL is running
check_postgres() {
    if ! command -v psql &> /dev/null; then
        echo " PostgreSQL client (psql) not found!"
        echo "Please install PostgreSQL or make sure it's in your PATH."
        exit 1
    fi
    
    echo "1. Checking PostgreSQL connection..."
    if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
        echo " PostgreSQL is running and accessible"
    else
        echo " Cannot connect to PostgreSQL!"
        echo "Please ensure PostgreSQL is running and your credentials are correct."
        exit 1
    fi
}

# Function to create database if it doesn't exist
create_database() {
    echo ""
    echo "2. Checking if database exists..."
    
    if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        echo " Database '$DB_NAME' already exists"
    else
        echo " Creating database '$DB_NAME'..."
        createdb -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME"
        echo " Database '$DB_NAME' created successfully"
    fi
}

# Function to run schema setup
setup_schema() {
    echo ""
    echo "3. Setting up database schema..."
    
    if [ ! -f database_schema.sql ]; then
        echo " database_schema.sql file not found!"
        exit 1
    fi
    
    psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -f database_schema.sql
    echo " Database schema created successfully"
}

# Function to test the setup
test_setup() {
    echo ""
    echo "4. Testing database setup..."
    
    # Run the Node.js database test
    if [ -f test-db-connection.js ]; then
        node test-db-connection.js
    else
        echo "  test-db-connection.js not found, skipping detailed test"
        
        # Simple connection test
        if psql -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 'Database is ready!' as status;" 2>/dev/null; then
            echo " Basic database test passed"
        else
            echo " Database test failed"
            exit 1
        fi
    fi
}

# Main execution
echo "Starting database setup process..."
echo ""

check_postgres
create_database
setup_schema
test_setup

echo ""
echo " Database setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Install Node.js dependencies: npm install"
echo "2. Start the server: npm start or npm run dev"
echo "3. Test the API: curl http://localhost:3000/health"
echo ""
