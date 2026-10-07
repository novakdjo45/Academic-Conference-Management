const { pool } = require('../db/connection');

// Get all conferences
async function getAllConferences(req, res, next) {
  try {
    const query = `
      SELECT 
        c.Conference_ID,
        c.Conference_Name,
        c.Start_Date,
        c.End_Date,
        c.Location,
        COUNT(p.Paper_ID) AS Total_Papers
      FROM conference c
      LEFT JOIN paper p ON c.Conference_ID = p.Conference_ID
      GROUP BY c.Conference_ID, c.Conference_Name, c.Start_Date, c.End_Date, c.Location
      ORDER BY c.Conference_ID ASC
    `;
    const [rows] = await pool.query(query);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    next(error);
  }
}

// Get single conference
async function getConferenceById(req, res, next) {
  try {
    const { id } = req.params;
    const [confs] = await pool.execute('SELECT * FROM conference WHERE Conference_ID = ?', [id]);
    if (confs.length === 0) {
      return res.status(404).json({ success: false, message: `Conference with ID ${id} not found.` });
    }

    const [papers] = await pool.execute(`
      SELECT Paper_ID, Title, Status, Submission_Date 
      FROM paper 
      WHERE Conference_ID = ?
    `, [id]);

    res.json({
      success: true,
      data: {
        ...confs[0],
        papers
      }
    });
  } catch (error) {
    next(error);
  }
}

// Create conference
async function createConference(req, res, next) {
  try {
    let { Conference_ID, Conference_Name, Start_Date, End_Date, Location } = req.body;

    if (!Conference_Name) {
      return res.status(400).json({ success: false, message: 'Conference Name is required.' });
    }

    if (!Conference_ID) {
      const [maxRows] = await pool.query('SELECT COALESCE(MAX(Conference_ID), 0) AS maxId FROM conference');
      Conference_ID = maxRows[0].maxId + 1;
    } else {
      Conference_ID = parseInt(Conference_ID, 10);
    }

    const sql = `
      INSERT INTO conference (Conference_ID, Conference_Name, Start_Date, End_Date, Location)
      VALUES (?, ?, ?, ?, ?)
    `;
    await pool.execute(sql, [
      Conference_ID,
      Conference_Name.trim(),
      Start_Date || null,
      End_Date || null,
      Location ? Location.trim() : null
    ]);

    const [newRow] = await pool.execute('SELECT * FROM conference WHERE Conference_ID = ?', [Conference_ID]);

    res.status(201).json({
      success: true,
      message: 'Conference created successfully',
      data: newRow[0]
    });
  } catch (error) {
    next(error);
  }
}

// Delete conference
async function deleteConference(req, res, next) {
  try {
    const { id } = req.params;

    const [conf] = await pool.execute('SELECT * FROM conference WHERE Conference_ID = ?', [id]);
    if (conf.length === 0) {
      return res.status(404).json({ success: false, message: `Conference with ID ${id} not found.` });
    }

    // Check if papers reference this conference
    const [papers] = await pool.execute('SELECT COUNT(*) AS count FROM paper WHERE Conference_ID = ?', [id]);
    if (papers[0].count > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete conference "${conf[0].Conference_Name}" because ${papers[0].count} paper(s) are submitted to it.`
      });
    }

    await pool.execute('DELETE FROM conference WHERE Conference_ID = ?', [id]);

    res.json({
      success: true,
      message: 'Conference deleted successfully',
      deletedId: id
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllConferences,
  getConferenceById,
  createConference,
  deleteConference
};
