const { validationResult } = require('express-validator');
const { query } = require('../config/db');

// Create a new vehicle
const createVehicle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, license_plate } = req.body;
    const userId = req.user.id;

    const result = await query(
      'INSERT INTO vehicles (user_id, name, license_plate) VALUES ($1, $2, $3) RETURNING *',
      [userId, name, license_plate || null]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create vehicle error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating vehicle'
    });
  }
};

// Get all vehicles for authenticated user with search and pagination
const getVehicles = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE user_id = $1';
    let queryParams = [userId];
    let countParams = [userId];

    // Add search functionality
    if (search) {
      whereClause += ' AND (LOWER(name) LIKE $2 OR LOWER(license_plate) LIKE $2)';
      const searchPattern = `%${search.toLowerCase()}%`;
      queryParams.push(searchPattern);
      countParams.push(searchPattern);
    }

    // Get total count for pagination
    const countResult = await query(
      `SELECT COUNT(*) FROM vehicles ${whereClause}`,
      countParams
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Get vehicles with pagination
    queryParams.push(limit, offset);
    const result = await query(
      `SELECT * FROM vehicles ${whereClause} ORDER BY created_at DESC LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}`,
      queryParams
    );

    res.json({
      status: 'success',
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        limit
      },
      data: result.rows
    });

  } catch (error) {
    console.error('Get vehicles error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching vehicles'
    });
  }
};

// Get single vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const userId = req.user.id;

    const result = await query(
      'SELECT * FROM vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Vehicle not found or you do not have permission to access it'
      });
    }

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get vehicle by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching vehicle'
    });
  }
};

// Delete vehicle
const deleteVehicle = async (req, res) => {
  try {
    const vehicleId = req.params.id;
    const userId = req.user.id;

    // First check if vehicle exists and belongs to user
    const checkResult = await query(
      'SELECT id FROM vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Vehicle not found or you do not have permission to delete it'
      });
    }

    // Delete the vehicle (this will cascade delete related oil_changes and fuel_records)
    await query(
      'DELETE FROM vehicles WHERE id = $1 AND user_id = $2',
      [vehicleId, userId]
    );

    res.json({
      status: 'success',
      data: {
        message: 'Vehicle deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete vehicle error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting vehicle'
    });
  }
};

module.exports = {
  createVehicle,
  getVehicles,
  getVehicleById,
  deleteVehicle
};
