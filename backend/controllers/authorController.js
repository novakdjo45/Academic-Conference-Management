const { pool } = require('../db/connection');

// Get all authors (with count of papers co-authored)
async function getAllAuthors(req, res, next) {
  try {
    const query = `
      SELECT 
        a.Author_ID,
        a.Name,
        a.Email,
        a.Affiliation,
        COUNT(pa.Paper_ID) AS Paper_Count
      FROM author a
      LEFT JOIN paper_author pa ON a.Author_ID = pa.Author_ID
      GROUP BY a.Author_ID, a.Name, a.Email, a.Affiliation
      ORDER BY a.Author_ID ASC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Get single author with their papers
async function getAuthorById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM author WHERE Author_ID = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: `Author with ID ${id} not found.` });
    }

    // Get papers written by this author
    const [paperRows] = await pool.execute(`
      SELECT p.Paper_ID, p.Title, p.Status, p.Submission_Date, c.Conference_Name
      FROM paper p
      JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
      LEFT JOIN conference c ON p.Conference_ID = c.Conference_ID
      WHERE pa.Author_ID = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...rows[0],
        papers: paperRows
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create new author
async function createAuthor(req, res, next) {
  try {
    let { Author_ID, Name, Email, Affiliation } = req.body;

    if (!Name || !Email) {
      return res.status(400).json({ success: false, message: 'Name and Email are required fields.' });
    }

    // If Author_ID is not provided, auto-generate next ID
    if (!Author_ID) {
      const [maxRows] = await pool.query('SELECT COALESCE(MAX(Author_ID), 100) AS maxId FROM author');
      Author_ID = maxRows[0].maxId + 1;
    } else {
      Author_ID = parseInt(Author_ID, 10);
    }

    const insertSql = 'INSERT INTO author (Author_ID, Name, Email, Affiliation) VALUES (?, ?, ?, ?)';
    await pool.execute(insertSql, [Author_ID, Name.trim(), Email.trim(), Affiliation ? Affiliation.trim() : null]);

    const [newRow] = await pool.execute('SELECT * FROM author WHERE Author_ID = ?', [Author_ID]);

    res.status(201).json({
      success: true,
      message: 'Author inserted successfully',
      data: newRow[0]
    });
  } catch (error) {
    next(error);
  }
}

// Delete author
async function deleteAuthor(req, res, next) {
  try {
    const { id } = req.params;

    // First check if exists
    const [check] = await pool.execute('SELECT * FROM author WHERE Author_ID = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ success: false, message: `Author with ID ${id} not found.` });
    }

    // Check if referenced in paper_author or notification
    const [refPaper] = await pool.execute('SELECT COUNT(*) AS count FROM paper_author WHERE Author_ID = ?', [id]);
    if (refPaper[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete author "${check[0].Name}" (ID ${id}) because they are linked to ${refPaper[0].count} paper(s) in paper_author.`
      });
    }

    const [refNotif] = await pool.execute('SELECT COUNT(*) AS count FROM notification WHERE Author_ID = ?', [id]);
    if (refNotif[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete author (ID ${id}) because notifications exist for this author.`
      });
    }

    await pool.execute('DELETE FROM author WHERE Author_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Author deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  deleteAuthor
};
