const { pool } = require('../db/connection');

// Get all reviewers with their completed reviews count
async function getAllReviewers(req, res, next) {
  try {
    const query = `
      SELECT 
        rv.Reviewer_ID,
        rv.Name,
        rv.Email,
        rv.Expertise,
        rv.Current_Load,
        COUNT(r.Review_ID) AS Completed_Reviews,
        ROUND(AVG(r.Score), 1) AS Avg_Score_Given
      FROM reviewer rv
      LEFT JOIN review r ON rv.Reviewer_ID = r.Reviewer_ID
      GROUP BY rv.Reviewer_ID, rv.Name, rv.Email, rv.Expertise, rv.Current_Load
      ORDER BY rv.Reviewer_ID ASC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Get single reviewer
async function getReviewerById(req, res, next) {
  try {
    const { id } = req.params;
    const [reviewers] = await pool.execute('SELECT * FROM reviewer WHERE Reviewer_ID = ?', [id]);
    if (reviewers.length === 0) {
      return res.status(404).json({ success: false, message: `Reviewer with ID ${id} not found.` });
    }

    // Get reviews written by this reviewer
    const [reviews] = await pool.execute(`
      SELECT r.Review_ID, r.Score, r.Comments, r.Review_Date, p.Paper_ID, p.Title AS Paper_Title
      FROM review r
      JOIN paper p ON r.Paper_ID = p.Paper_ID
      WHERE r.Reviewer_ID = ?
      ORDER BY r.Review_Date DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...reviewers[0],
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create reviewer
async function createReviewer(req, res, next) {
  try {
    let { Reviewer_ID, Name, Email, Expertise, Current_Load } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required fields.' });
    }

    if (!Reviewer_ID) {
      const [maxRows] = await pool.query('SELECT COALESCE(MAX(Reviewer_ID), 200) AS maxId FROM reviewer');
      Reviewer_ID = maxRows[0].maxId + 1;
    } else {
      Reviewer_ID = parseInt(Reviewer_ID, 10);
    }

    const load = Current_Load !== undefined && Current_Load !== '' ? parseInt(Current_Load, 10) : 0;

    const sql = 'INSERT INTO reviewer (Reviewer_ID, Name, Email, Expertise, Current_Load) VALUES (?, ?, ?, ?, ?)';
    await pool.execute(sql, [Reviewer_ID, Name.trim(), Email.trim(), Expertise ? Expertise.trim() : null, load]);

    const [newRow] = await pool.execute('SELECT * FROM reviewer WHERE Reviewer_ID = ?', [Reviewer_ID]);

    res.status(201).json({
      success: true,
      message: 'Reviewer inserted successfully',
      data: newRow[0]
    });
  } catch (error) {
    next(error);
  }
}

// Delete reviewer
async function deleteReviewer(req, res, next) {
  try {
    const { id } = req.params;

    const [check] = await pool.execute('SELECT * FROM reviewer WHERE Reviewer_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Reviewer with ID ${id} not found.` });
    }

    // Check if referenced in review table
    const [revCount] = await pool.execute('SELECT COUNT(*) AS count FROM review WHERE Reviewer_ID = ?', [id]);
    if (revCount[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete reviewer "${check[0].Name}" (ID ${id}) because they have submitted ${revCount[0].count} review(s).`
      });
    }

    await pool.execute('DELETE FROM reviewer WHERE Reviewer_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Reviewer deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllReviewers,
  getReviewerById,
  createReviewer,
  deleteReviewer
};
