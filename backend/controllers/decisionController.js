const { pool } = require('../db/connection');

// Get all decisions with Paper details JOINed
async function getAllDecisions(req, res, next) {
  try {
    const query = `
      SELECT 
        d.Decision_ID,
        d.Paper_ID,
        d.Outcome,
        d.Decision_Date,
        d.Remarks,
        p.Title AS Paper_Title,
        p.Status AS Paper_Current_Status,
        c.Conference_Name,
        GROUP_CONCAT(DISTINCT a.Name SEPARATOR ', ') AS Authors
      FROM decision d
      JOIN paper p ON d.Paper_ID = p.Paper_ID
      LEFT JOIN conference c ON p.Conference_ID = c.Conference_ID
      LEFT JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
      LEFT JOIN author a ON pa.Author_ID = a.Author_ID
      GROUP BY d.Decision_ID, d.Paper_ID, d.Outcome, d.Decision_Date, d.Remarks, p.Title, p.Status, c.Conference_Name
      ORDER BY d.Decision_ID ASC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Create decision (and sync paper status)
async function createDecision(req, res, next) {
  const connection = await pool.getConnection();
  try {
    let { Decision_ID, Paper_ID, Outcome, Decision_Date, Remarks } = req.body;

    if (!Paper_ID || !Outcome) {
      return res.status(400).json({ success: false, message: 'Paper ID and Outcome are required.' });
    }

    await connection.beginTransaction();

    if (!Decision_ID) {
      const [maxRows] = await connection.query('SELECT COALESCE(MAX(Decision_ID), 600) AS maxId FROM decision');
      Decision_ID = maxRows[0].maxId + 1;
    } else {
      Decision_ID = parseInt(Decision_ID, 10);
    }

    if (!Decision_Date) {
      Decision_Date = new Date().toISOString().split('T')[0];
    }

    const insertSql = `
      INSERT INTO decision (Decision_ID, Paper_ID, Outcome, Decision_Date, Remarks)
      VALUES (?, ?, ?, ?, ?)
    `;
    await connection.execute(insertSql, [
      Decision_ID,
      parseInt(Paper_ID, 10),
      Outcome.trim(),
      Decision_Date,
      Remarks ? Remarks.trim() : null
    ]);

    // Update Paper status
    let mappedStatus = Outcome.trim();
    if (mappedStatus.toLowerCase() === 'accept') mappedStatus = 'Approved';
    if (mappedStatus.toLowerCase() === 'reject') mappedStatus = 'Rejected';
    if (mappedStatus.toLowerCase() === 'revise') mappedStatus = 'Revise';

    await connection.execute('UPDATE paper SET Status = ? WHERE Paper_ID = ?', [mappedStatus, parseInt(Paper_ID, 10)]);

    await connection.commit();

    const [newRow] = await pool.execute(`
      SELECT d.*, p.Title AS Paper_Title
      FROM decision d
      JOIN paper p ON d.Paper_ID = p.Paper_ID
      WHERE d.Decision_ID = ?
    `, [Decision_ID]);

    res.status(201).json({
      success: true,
      message: 'Decision recorded successfully and Paper status updated',
      data: newRow[0]
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// Delete decision
async function deleteDecision(req, res, next) {
  try {
    const { id } = req.params;

    const [check] = await pool.execute('SELECT * FROM decision WHERE Decision_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Decision with ID ${id} not found.` });
    }

    await pool.execute('DELETE FROM decision WHERE Decision_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Decision deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDecisions,
  createDecision,
  deleteDecision
};
