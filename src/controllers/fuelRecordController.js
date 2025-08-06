const { validationResult } = require('express-validator');
const { query } = require('../config/db');

// Helper function to verify vehicle ownership
const verifyVehicleOwnership = async (vehicleId, userId) => {
  const result = await query(
    'SELECT id FROM vehicles WHERE id = $1 AND user_id = $2',
    [vehicleId, userId]
  );
  return result.rows.length > 0;
};

// Create fuel record
const createFuelRecord = async (req, res) => {
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

    const { vehicleId } = req.params;
    const { fill_date, price_per_liter, liters_filled } = req.body;
    const userId = req.user.id;

    // Verify vehicle ownership
    const vehicleExists = await verifyVehicleOwnership(vehicleId, userId);
    if (!vehicleExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Vehicle not found or you do not have permission to access it'
      });
    }

    const result = await query(
      'INSERT INTO fuel_records (vehicle_id, fill_date, price_per_liter, liters_filled) VALUES ($1, $2, $3, $4) RETURNING *',
      [vehicleId, fill_date, price_per_liter, liters_filled]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create fuel record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating fuel record'
    });
  }
};

// Get fuel records for a vehicle with pagination
const getFuelRecords = async (req, res) => {
  try {
    const { vehicleId } = req.params;
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Verify vehicle ownership
    const vehicleExists = await verifyVehicleOwnership(vehicleId, userId);
    if (!vehicleExists) {
      return res.status(404).json({
        status: 'error',
        message: 'Vehicle not found or you do not have permission to access it'
      });
    }

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) FROM fuel_records WHERE vehicle_id = $1',
      [vehicleId]
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Get fuel records with pagination
    const result = await query(
      'SELECT * FROM fuel_records WHERE vehicle_id = $1 ORDER BY fill_date DESC, created_at DESC LIMIT $2 OFFSET $3',
      [vehicleId, limit, offset]
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
    console.error('Get fuel records error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching fuel records'
    });
  }
};

// Update fuel record
const updateFuelRecord = async (req, res) => {
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

    const { id } = req.params;
    const { fill_date, price_per_liter, liters_filled } = req.body;
    const userId = req.user.id;

    // First verify that the fuel record exists and the user owns the vehicle
    const checkResult = await query(
      `SELECT fr.id FROM fuel_records fr 
       JOIN vehicles v ON fr.vehicle_id = v.id 
       WHERE fr.id = $1 AND v.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Fuel record not found or you do not have permission to modify it'
      });
    }

    // Update the fuel record
    const result = await query(
      'UPDATE fuel_records SET fill_date = $1, price_per_liter = $2, liters_filled = $3 WHERE id = $4 RETURNING *',
      [fill_date, price_per_liter, liters_filled, id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update fuel record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating fuel record'
    });
  }
};

// Delete fuel record
const deleteFuelRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First verify that the fuel record exists and the user owns the vehicle
    const checkResult = await query(
      `SELECT fr.id FROM fuel_records fr 
       JOIN vehicles v ON fr.vehicle_id = v.id 
       WHERE fr.id = $1 AND v.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Fuel record not found or you do not have permission to delete it'
      });
    }

    // Delete the fuel record
    await query(
      'DELETE FROM fuel_records WHERE id = $1',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        message: 'Fuel record deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete fuel record error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting fuel record'
    });
  }
};

module.exports = {
  createFuelRecord,
  getFuelRecords,
  updateFuelRecord,
  deleteFuelRecord
};
