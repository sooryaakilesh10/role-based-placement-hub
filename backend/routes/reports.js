
const express = require('express');
const ExcelJS = require('exceljs');
const pool = require('../config/database');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Generate companies Excel report
router.get('/companies/excel', authenticateToken, requireRole(['Admin', 'Manager']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as assigned_officer_name 
      FROM companies c 
      LEFT JOIN users u ON c.assigned_officer_id = u.id 
      ORDER BY c.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Companies Report');

    // Add headers
    worksheet.columns = [
      { header: 'Company ID', key: 'id', width: 10 },
      { header: 'Company Name', key: 'company_name', width: 30 },
      { header: 'Address', key: 'company_address', width: 40 },
      { header: 'Drive', key: 'drive', width: 25 },
      { header: 'Type of Drive', key: 'type_of_drive', width: 15 },
      { header: 'Follow Up', key: 'follow_up', width: 15 },
      { header: 'Is Contacted', key: 'is_contacted', width: 12 },
      { header: 'Remarks', key: 'remarks', width: 30 },
      { header: 'Contact Details', key: 'contact_details', width: 30 },
      { header: 'HR1 Details', key: 'hr1_details', width: 25 },
      { header: 'HR2 Details', key: 'hr2_details', width: 25 },
      { header: 'Package', key: 'package', width: 15 },
      { header: 'Assigned Officer', key: 'assigned_officer_name', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 },
    ];

    // Add data
    result.rows.forEach(row => {
      worksheet.addRow({
        ...row,
        is_contacted: row.is_contacted ? 'Yes' : 'No',
        assigned_officer_name: row.assigned_officer_name || 'Unassigned'
      });
    });

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="companies-report-${new Date().toISOString().split('T')[0]}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
