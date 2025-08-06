const express = require('express');
const { body, param, query } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createOilChange, 
  getOilChanges, 
  updateOilChange, 
  deleteOilChange 
} = require('../controllers/oilChangeController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation rules for creating/updating oil change
const oilChangeValidation = [
  body('change_date')
    .isISO8601()
    .toDate()
    .withMessage('Change date must be a valid date in ISO 8601 format (YYYY-MM-DD)'),
  body('mileage')
    .isInt({ min: 0 })
    .withMessage('Mileage must be a non-negative integer'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters')
];

// Validation rules for vehicle ID parameter
const vehicleIdValidation = [
  param('vehicleId')
    .isInt({ min: 1 })
    .withMessage('Vehicle ID must be a positive integer')
];

// Validation rules for oil change ID parameter
const oilChangeIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Oil change ID must be a positive integer')
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

// POST /api/vehicles/:vehicleId/oil-changes - Create a new oil change record
router.post('/vehicles/:vehicleId/oil-changes', 
  vehicleIdValidation, 
  oilChangeValidation, 
  createOilChange
);

// GET /api/vehicles/:vehicleId/oil-changes - Get all oil change records for a vehicle
router.get('/vehicles/:vehicleId/oil-changes', 
  vehicleIdValidation, 
  queryValidation, 
  getOilChanges
);

// PATCH /api/oil-changes/:id - Update an oil change record
router.patch('/oil-changes/:id', 
  oilChangeIdValidation, 
  oilChangeValidation, 
  updateOilChange
);

// DELETE /api/oil-changes/:id - Delete an oil change record
router.delete('/oil-changes/:id', 
  oilChangeIdValidation, 
  deleteOilChange
);

module.exports = router;
