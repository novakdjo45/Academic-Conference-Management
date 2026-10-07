const { pool, testConnection } = require('../db/connection');

async function getStats(req, res, next) {
  try {
    const [authorRows] = await pool.query('SELECT COUNT(*) AS total FROM author');
    const [paperRows] = await pool.query('SELECT COUNT(*) AS total FROM paper');
    const [reviewerRows] = await pool.query('SELECT COUNT(*) AS total FROM reviewer');
    const [reviewRows] = await pool.query('SELECT COUNT(*) AS total FROM review');
    const [conferenceRows] = await pool.query('SELECT COUNT(*) AS total FROM conference');
    const [decisionRows] = await pool.query('SELECT COUNT(*) AS total FROM decision');

    // Status distribution
    const [statusRows] = await pool.query(`
      SELECT Status, COUNT(*) AS count 
      FROM paper 
      GROUP BY Status
    `);

    // Average review score
    const [avgScoreRows] = await pool.query(`
      SELECT ROUND(AVG(Score), 2) AS avg_score, MIN(Score) as min_score, MAX(Score) as max_score 
      FROM review
    `);

    // Decision breakdown
    const [decisionBreakdown] = await pool.query(`
      SELECT Outcome, COUNT(*) AS count 
      FROM decision 
      GROUP BY Outcome
    `);

    // Recent papers
    const [recentPapers] = await pool.query(`
      SELECT 
        p.Paper_ID,
        p.Title,
        p.Status,
        p.Submission_Date,
        c.Conference_Name,
        GROUP_CONCAT(a.Name SEPARATOR ', ') AS Authors
      FROM paper p
      LEFT JOIN conference c ON p.Conference_ID = c.Conference_ID
      LEFT JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
      LEFT JOIN author a ON pa.Author_ID = a.Author_ID
      GROUP BY p.Paper_ID, p.Title, p.Status, p.Submission_Date, c.Conference_Name
      ORDER BY p.Paper_ID DESC
      LIMIT 5
    `);

    // Recent reviews
    const [recentReviews] = await pool.query(`
      SELECT 
        r.Review_ID,
        r.Score,
        r.Comments,
        r.Review_Date,
        p.Title AS Paper_Title,
        rv.Name AS Reviewer_Name
      FROM review r
      LEFT JOIN paper p ON r.Paper_ID = p.Paper_ID
      LEFT JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
      ORDER BY r.Review_ID DESC
      LIMIT 5
    `);

    res.json({
      success: true,
      stats: {
        totalAuthors: authorRows[0].total,
        totalPapers: paperRows[0].total,
        totalReviewers: reviewerRows[0].total,
        totalReviews: reviewRows[0].total,
        totalConferences: conferenceRows[0].total,
        totalDecisions: decisionRows[0].total,
        avgScore: avgScoreRows[0].avg_score || 0,
        minScore: avgScoreRows[0].min_score || 0,
        maxScore: avgScoreRows[0].max_score || 0
      },
      statusDistribution: statusRows,
      decisionBreakdown,
      recentPapers,
      recentReviews
    });
  } catch (error) {
    next(error);
  }
}

async function getHealth(req, res) {
  const result = await testConnection();
  if (result.connected) {
    res.json({ success: true, status: 'connected', database: result.database });
  } else {
    res.status(503).json({ success: false, status: 'offline', error: result.error });
  }
}

module.exports = {
  getStats,
  getHealth
};
