
const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Get pending updates (Admin/Manager only)
router.get('/', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT pu.*, c.company_name, u.name as officer_name
      FROM pending_updates pu
      JOIN companies c ON pu.company_id = c.id
      JOIN users u ON pu.officer_id = u.id
      ORDER BY pu.created_at DESC
    `);

    const pendingUpdates = result.rows.map(row => ({
      id: row.id.toString(),
      companyId: row.company_id.toString(),
      originalData: row.original_data,
      updatedData: row.updated_data,
      officerId: row.officer_id.toString(),
      officerName: row.officer_name,
      companyName: row.company_name,
      status: row.status,
      createdAt: row.created_at,
      reviewedBy: row.reviewed_by?.toString(),
      reviewedAt: row.reviewed_at
    }));

    res.json(pendingUpdates);
  } catch (error) {
    console.error('Error fetching pending updates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Approve pending update
router.post('/:id/approve', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get pending update
    const pendingResult = await pool.query('SELECT * FROM pending_updates WHERE id = $1', [id]);
    if (pendingResult.rows.length === 0) {
      return res.status(404).json({ error: 'Pending update not found' });
    }

    const pendingUpdate = pendingResult.rows[0];
    const { company_id, updated_data } = pendingUpdate;

    // Update company with new data
    const updateFields = Object.keys(updated_data).map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = [company_id, ...Object.values(updated_data)];

    await pool.query(`UPDATE companies SET ${updateFields}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`, values);

    // Mark as approved
    await pool.query(`
      UPDATE pending_updates 
      SET status = 'approved', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [req.user.id, id]);

    res.json({ message: 'Update approved and applied successfully' });
  } catch (error) {
    console.error('Error approving update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reject pending update
router.post('/:id/reject', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`
      UPDATE pending_updates 
      SET status = 'rejected', reviewed_by = $1, reviewed_at = CURRENT_TIMESTAMP 
      WHERE id = $2
    `, [req.user.id, id]);

    res.json({ message: 'Update rejected successfully' });
  } catch (error) {
    console.error('Error rejecting update:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
