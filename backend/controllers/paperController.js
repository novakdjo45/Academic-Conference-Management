const { pool } = require('../db/connection');

// Get all papers with Authors, Conference, and Review stats joined
async function getAllPapers(req, res, next) {
  try {
    const { status, conferenceId, search } = req.query;

    let query = `
      SELECT 
        p.Paper_ID,
        p.Title,
        p.Abstract,
        p.Submission_Date,
        p.Status,
        p.Conference_ID,
        c.Conference_Name,
        GROUP_CONCAT(DISTINCT a.Name ORDER BY a.Name SEPARATOR ', ') AS Authors,
        GROUP_CONCAT(DISTINCT a.Author_ID) AS Author_IDs,
        COUNT(DISTINCT r.Review_ID) AS Review_Count,
        ROUND(AVG(r.Score), 1) AS Avg_Score,
        d.Outcome AS Decision_Outcome
      FROM paper p
      LEFT JOIN conference c ON p.Conference_ID = c.Conference_ID
      LEFT JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
      LEFT JOIN author a ON pa.Author_ID = a.Author_ID
      LEFT JOIN review r ON p.Paper_ID = r.Paper_ID
      LEFT JOIN decision d ON p.Paper_ID = d.Paper_ID
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ' AND p.Status = ?';
      params.push(status);
    }

    if (conferenceId) {
      query += ' AND p.Conference_ID = ?';
      params.push(conferenceId);
    }

    if (search) {
      query += ' AND (p.Title LIKE ? OR p.Abstract LIKE ? OR a.Name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += `
      GROUP BY p.Paper_ID, p.Title, p.Abstract, p.Submission_Date, p.Status, p.Conference_ID, c.Conference_Name, d.Outcome
      ORDER BY p.Paper_ID ASC
    `;

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Get single paper with complete details
async function getPaperById(req, res, next) {
  try {
    const { id } = req.params;

    const paperSql = `
      SELECT 
        p.*,
        c.Conference_Name,
        c.Location AS Conference_Location
      FROM paper p
      LEFT JOIN conference c ON p.Conference_ID = c.Conference_ID
      WHERE p.Paper_ID = ?
    `;
    const [papers] = await pool.execute(paperSql, [id]);
    if (papers.length === 0) {
      return res.status(404).json({ success: false, message: `Paper with ID ${id} not found.` });
    }

    // Get Authors
    const [authors] = await pool.execute(`
      SELECT a.Author_ID, a.Name, a.Email, a.Affiliation
      FROM author a
      JOIN paper_author pa ON a.Author_ID = pa.Author_ID
      WHERE pa.Paper_ID = ?
    `, [id]);

    // Get Reviews
    const [reviews] = await pool.execute(`
      SELECT r.Review_ID, r.Score, r.Comments, r.Review_Date, rv.Reviewer_ID, rv.Name AS Reviewer_Name
      FROM review r
      LEFT JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
      WHERE r.Paper_ID = ?
      ORDER BY r.Review_ID ASC
    `, [id]);

    // Get Decision if any
    const [decisions] = await pool.execute('SELECT * FROM decision WHERE Paper_ID = ?', [id]);

    res.json({
      success: true,
      data: {
        ...papers[0],
        authors,
        reviews,
        decision: decisions[0] || null
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create new Paper
async function createPaper(req, res, next) {
  const connection = await pool.getConnection();
  try {
    let { Paper_ID, Title, Abstract, Submission_Date, Status, Conference_ID, Author_IDs } = req.body;

    if (!Title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    await connection.beginTransaction();

    // Auto calculate Paper_ID if not given
    if (!Paper_ID) {
      const [maxRows] = await connection.query('SELECT COALESCE(MAX(Paper_ID), 1000) AS maxId FROM paper');
      Paper_ID = maxRows[0].maxId + 1;
    } else {
      Paper_ID = parseInt(Paper_ID, 10);
    }

    // Default Submission Date to today if empty
    if (!Submission_Date) {
      Submission_Date = new Date().toISOString().split('T')[0];
    }

    if (!Status) {
      Status = 'Under Review';
    }

    const insertPaperSql = `
      INSERT INTO paper (Paper_ID, Title, Abstract, Submission_Date, Status, Conference_ID)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    await connection.execute(insertPaperSql, [
      Paper_ID,
      Title.trim(),
      Abstract ? Abstract.trim() : null,
      Submission_Date,
      Status.trim(),
      Conference_ID ? parseInt(Conference_ID, 10) : null
    ]);

    // Link authors in paper_author junction table
    if (Author_IDs) {
      const authorList = Array.isArray(Author_IDs) ? Author_IDs : [Author_IDs];
      for (const authId of authorList) {
        if (authId) {
          await connection.execute(
            'INSERT INTO paper_author (Paper_ID, Author_ID) VALUES (?, ?)',
            [Paper_ID, parseInt(authId, 10)]
          );
        }
      }
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Paper created successfully',
      data: { Paper_ID, Title, Status, Submission_Date }
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// Delete Paper
async function deletePaper(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;

    const [paper] = await connection.execute('SELECT * FROM paper WHERE Paper_ID = ?', [id]);
    if (paper.length === 0) {
      return res.status(404).json({ success: false, message: `Paper with ID ${id} not found.` });
    }

    // Check if referenced by reviews or decisions or notifications
    const [revCount] = await connection.execute('SELECT COUNT(*) AS count FROM review WHERE Paper_ID = ?', [id]);
    if (revCount[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete paper "${paper[0].Title}" (ID ${id}) because it has ${revCount[0].count} review(s) attached.`
      });
    }

    const [decCount] = await connection.execute('SELECT COUNT(*) AS count FROM decision WHERE Paper_ID = ?', [id]);
    if (decCount[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete paper (ID ${id}) because an official Decision is recorded for it.`
      });
    }

    await connection.beginTransaction();

    // Remove junction entries from paper_author
    await connection.execute('DELETE FROM paper_author WHERE Paper_ID = ?', [id]);
    // Delete from paper
    await connection.execute('DELETE FROM paper WHERE Paper_ID = ?', [id]);

    await connection.commit();

    res.json({
      success: true,
      message: 'Paper deleted successfully',
      deletedId: id
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  getAllPapers,
  getPaperById,
  createPaper,
  deletePaper
};
