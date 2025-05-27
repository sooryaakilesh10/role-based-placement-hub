
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get all companies
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as assigned_officer_name 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_officer_id = u.id 
      ORDER BY c.created_at DESC
    `);
    
    const companies = result.rows.map(row => ({
      id: row.id.toString(),
      companyName: row.company_name,
      companyAddress: row.company_address,
      drive: row.drive,
      typeOfDrive: row.type_of_drive,
      followUp: row.follow_up,
      isContacted: row.is_contacted,
      remarks: row.remarks,
      contactDetails: row.contact_details,
      hr1Details: row.hr1_details,
      hr2Details: row.hr2_details,
      package: row.package,
      assignedOfficer: row.assigned_officer_name || 'Unassigned',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(companies);
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create company (Admin/Manager only)
router.post('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const {
      companyName, companyAddress, drive, typeOfDrive, followUp,
      isContacted, remarks, contactDetails, hr1Details, hr2Details,
      package: packageValue, assignedOfficerId
    } = req.body;

    const result = await pool.query(`
      INSERT INTO companies (
        company_name, company_address, drive, type_of_drive, follow_up,
        is_contacted, remarks, contact_details, hr1_details, hr2_details,
        package, assigned_officer_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [
      companyName, companyAddress, drive, typeOfDrive, followUp,
      isContacted, remarks, contactDetails, hr1Details, hr2Details,
      packageValue, assignedOfficerId
    ]);

    res.status(201).json({ message: 'Company created successfully', company: result.rows[0] });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update company
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const { role } = req.user;

    // If user is Officer, create pending update instead
    if (role === 'Officer') {
      // Get original company data
      const originalResult = await pool.query('SELECT * FROM companies WHERE id = $1', [id]);
      if (originalResult.rows.length === 0) {
        return res.status(404).json({ error: 'Company not found' });
      }

      const originalData = originalResult.rows[0];
      
      // Create pending update
      await pool.query(`
        INSERT INTO pending_updates (company_id, officer_id, original_data, updated_data)
        VALUES ($1, $2, $3, $4)
      `, [id, req.user.id, originalData, updates]);

      return res.json({ message: 'Update submitted for approval' });
    }

    // Admin/Manager can update directly
    const setClause = Object.keys(updates).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [id, ...Object.values(updates)];

    await pool.query(`UPDATE companies SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, values);
    
    res.json({ message: 'Company updated successfully' });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete company (Admin/Manager only)
router.delete('/:id', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM companies WHERE id = $1', [id]);
    res.json({ message: 'Company deleted successfully' });
  } catch (error) {
    console.error('Error deleting company:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
