const express = require('express');
const { body, param, query } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createFuelRecord, 
  getFuelRecords, 
  updateFuelRecord, 
  deleteFuelRecord 
} = require('../controllers/fuelRecordController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation rules for creating/updating fuel record
const fuelRecordValidation = [
  body('fill_date')
    .isISO8601()
    .toDate()
    .withMessage('Fill date must be a valid date in ISO 8601 format (YYYY-MM-DD)'),
  body('price_per_liter')
    .isFloat({ min: 0.01 })
    .withMessage('Price per liter must be a positive number greater than 0'),
  body('liters_filled')
    .isFloat({ min: 0.01 })
    .withMessage('Liters filled must be a positive number greater than 0')
];

// Validation rules for vehicle ID parameter
const vehicleIdValidation = [
  param('vehicleId')
    .isInt({ min: 1 })
    .withMessage('Vehicle ID must be a positive integer')
];

// Validation rules for fuel record ID parameter
const fuelRecordIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Fuel record ID must be a positive integer')
];

// Validation rules for query parameters
const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// POST /api/vehicles/:vehicleId/fuel-records - Create a new fuel record
router.post('/vehicles/:vehicleId/fuel-records', 
  vehicleIdValidation, 
  fuelRecordValidation, 
  createFuelRecord
);

// GET /api/vehicles/:vehicleId/fuel-records - Get all fuel records for a vehicle
router.get('/vehicles/:vehicleId/fuel-records', 
  vehicleIdValidation, 
  queryValidation, 
  getFuelRecords
);

// PATCH /api/fuel-records/:id - Update a fuel record
router.patch('/fuel-records/:id', 
  fuelRecordIdValidation, 
  fuelRecordValidation, 
  updateFuelRecord
);

// DELETE /api/fuel-records/:id - Delete a fuel record
router.delete('/fuel-records/:id', 
  fuelRecordIdValidation, 
  deleteFuelRecord
);

module.exports = router;
