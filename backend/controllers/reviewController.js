const { pool } = require('../db/connection');

// Get all reviews with Paper Title and Reviewer Name JOINed
async function getAllReviews(req, res, next) {
  try {
    const { paperId, reviewerId } = req.query;

    let query = `
      SELECT 
        r.Review_ID,
        r.Paper_ID,
        r.Reviewer_ID,
        r.Score,
        r.Comments,
        r.Review_Date,
        p.Title AS Paper_Title,
        p.Status AS Paper_Status,
        rv.Name AS Reviewer_Name,
        rv.Email AS Reviewer_Email
      FROM review r
      LEFT JOIN paper p ON r.Paper_ID = p.Paper_ID
      LEFT JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
      WHERE 1=1
    `;

    const params = [];
    if (paperId) {
      query += ' AND r.Paper_ID = ?';
      params.push(paperId);
    }
    if (reviewerId) {
      query += ' AND r.Reviewer_ID = ?';
      params.push(reviewerId);
    }

    query += ' ORDER BY r.Review_ID ASC';

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Get single review
async function getReviewById(req, res, next) {
  try {
    const { id } = req.params;
    const query = `
      SELECT 
        r.*,
        p.Title AS Paper_Title,
        p.Abstract AS Paper_Abstract,
        p.Status AS Paper_Status,
        rv.Name AS Reviewer_Name,
        rv.Email AS Reviewer_Email,
        rv.Expertise AS Reviewer_Expertise
      FROM review r
      LEFT JOIN paper p ON r.Paper_ID = p.Paper_ID
      LEFT JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
      WHERE r.Review_ID = ?
    `;
    const [rows] = await pool.execute(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Review with ID ${id} not found.` });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    next(error);
  }
}

// Create review
async function createReview(req, res, next) {
  try {
    let { Review_ID, Paper_ID, Reviewer_ID, Score, Comments, Review_Date } = req.body;

    if (!Paper_ID || !Reviewer_ID) {
      return res.status(400).json({ success: false, message: 'Paper and Reviewer selections are required.' });
    }

    if (Score === undefined || Score === null || isNaN(Score)) {
      return res.status(400).json({ success: false, message: 'Valid score (1-10) is required.' });
    }

    const numScore = parseInt(Score, 10);
    if (numScore < 1 || numScore > 10) {
      return res.status(400).json({ success: false, message: 'Review Score must be between 1 and 10.' });
    }

    if (!Review_ID) {
      const [maxRows] = await pool.query('SELECT COALESCE(MAX(Review_ID), 500) AS maxId FROM review');
      Review_ID = maxRows[0].maxId + 1;
    } else {
      Review_ID = parseInt(Review_ID, 10);
    }

    if (!Review_Date) {
      Review_Date = new Date().toISOString().split('T')[0];
    }

    const insertSql = `
      INSERT INTO review (Review_ID, Paper_ID, Reviewer_ID, Score, Comments, Review_Date)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await pool.execute(insertSql, [
      Review_ID,
      parseInt(Paper_ID, 10),
      parseInt(Reviewer_ID, 10),
      numScore,
      Comments ? Comments.trim() : null,
      Review_Date
    ]);

    const [newRow] = await pool.execute(`
      SELECT 
        r.*, 
        p.Title AS Paper_Title, 
        rv.Name AS Reviewer_Name 
      FROM review r
      LEFT JOIN paper p ON r.Paper_ID = p.Paper_ID
      LEFT JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
      WHERE r.Review_ID = ?
    `, [Review_ID]);

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: newRow[0]
    });
  } catch (error) {
    next(error);
  }
}

// Delete review
async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;

    const [check] = await pool.execute('SELECT * FROM review WHERE Review_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Review with ID ${id} not found.` });
    }

    await pool.execute('DELETE FROM review WHERE Review_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Review deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllReviews,
  getReviewById,
  createReview,
  deleteReview
};
