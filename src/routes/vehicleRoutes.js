const express = require('express');
const { body, param, query } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');
const { 
  createVehicle, 
  getVehicles, 
  getVehicleById, 
  deleteVehicle 
} = require('../controllers/vehicleController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Validation rules for creating a vehicle
const createVehicleValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Vehicle name is required and must be between 1 and 100 characters'),
  body('license_plate')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('License plate must not exceed 20 characters')
];

// Validation rules for vehicle ID parameter
const vehicleIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Vehicle ID must be a positive integer')
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
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters')
];

// POST /api/vehicles - Create a new vehicle
router.post('/', createVehicleValidation, createVehicle);

// GET /api/vehicles - Get all vehicles with search and pagination
router.get('/', queryValidation, getVehicles);

// GET /api/vehicles/:id - Get a single vehicle by ID
router.get('/:id', vehicleIdValidation, getVehicleById);

// DELETE /api/vehicles/:id - Delete a vehicle
router.delete('/:id', vehicleIdValidation, deleteVehicle);

module.exports = router;
