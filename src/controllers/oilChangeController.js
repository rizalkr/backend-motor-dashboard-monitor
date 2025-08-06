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

// Create oil change record
const createOilChange = async (req, res) => {
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
    const { change_date, mileage, notes } = req.body;
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
      'INSERT INTO oil_changes (vehicle_id, change_date, mileage, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [vehicleId, change_date, mileage, notes || null]
    );

    res.status(201).json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Create oil change error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while creating oil change record'
    });
  }
};

// Get oil changes for a vehicle with pagination
const getOilChanges = async (req, res) => {
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
      'SELECT COUNT(*) FROM oil_changes WHERE vehicle_id = $1',
      [vehicleId]
    );
    const totalItems = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalItems / limit);

    // Get oil changes with pagination
    const result = await query(
      'SELECT * FROM oil_changes WHERE vehicle_id = $1 ORDER BY change_date DESC, created_at DESC LIMIT $2 OFFSET $3',
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
    console.error('Get oil changes error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while fetching oil change records'
    });
  }
};

// Update oil change record
const updateOilChange = async (req, res) => {
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
    const { change_date, mileage, notes } = req.body;
    const userId = req.user.id;

    // First verify that the oil change exists and the user owns the vehicle
    const checkResult = await query(
      `SELECT oc.id FROM oil_changes oc 
       JOIN vehicles v ON oc.vehicle_id = v.id 
       WHERE oc.id = $1 AND v.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Oil change record not found or you do not have permission to modify it'
      });
    }

    // Update the oil change record
    const result = await query(
      'UPDATE oil_changes SET change_date = $1, mileage = $2, notes = $3 WHERE id = $4 RETURNING *',
      [change_date, mileage, notes || null, id]
    );

    res.json({
      status: 'success',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update oil change error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while updating oil change record'
    });
  }
};

// Delete oil change record
const deleteOilChange = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // First verify that the oil change exists and the user owns the vehicle
    const checkResult = await query(
      `SELECT oc.id FROM oil_changes oc 
       JOIN vehicles v ON oc.vehicle_id = v.id 
       WHERE oc.id = $1 AND v.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Oil change record not found or you do not have permission to delete it'
      });
    }

    // Delete the oil change record
    await query(
      'DELETE FROM oil_changes WHERE id = $1',
      [id]
    );

    res.json({
      status: 'success',
      data: {
        message: 'Oil change record deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete oil change error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error while deleting oil change record'
    });
  }
};

module.exports = {
  createOilChange,
  getOilChanges,
  updateOilChange,
  deleteOilChange
};
