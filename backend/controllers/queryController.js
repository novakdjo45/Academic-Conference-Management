const { pool } = require('../db/connection');

// Preset demo queries from the report and presentation requirements
const DEMO_QUERIES = [
  {
    id: 'demo-master',
    title: 'Presentation Demo Query (Papers, Authors & Review Scores)',
    description: 'Master JOIN query displaying Paper title, Author name, and Reviewer score for presentation viva.',
    sql: `SELECT 
    p.Title AS Paper_Title,
    a.Name AS Author_Name,
    r.Score AS Review_Score,
    r.Comments AS Review_Comments,
    p.Status AS Paper_Status
FROM paper p
JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
JOIN author a ON pa.Author_ID = a.Author_ID
JOIN review r ON p.Paper_ID = r.Paper_ID
ORDER BY p.Paper_ID, a.Name;`
  },
  {
    id: 'demo-1',
    title: 'Query 1: Papers with Conference and Status',
    description: 'Lists all papers with their assigned conference title and current review status.',
    sql: `SELECT 
    p.Paper_ID,
    p.Title,
    p.Status,
    c.Conference_Name
FROM paper p
JOIN conference c ON p.Conference_ID = c.Conference_ID;`
  },
  {
    id: 'demo-2',
    title: 'Query 2: Authors of Each Paper (M:N Join)',
    description: 'Resolves many-to-many relationship through PAPER_AUTHOR junction table.',
    sql: `SELECT 
    p.Title,
    a.Name AS Author
FROM paper p
JOIN paper_author pa ON p.Paper_ID = pa.Paper_ID
JOIN author a ON pa.Author_ID = a.Author_ID
ORDER BY p.Paper_ID;`
  },
  {
    id: 'demo-3',
    title: 'Query 3: Average Review Score per Paper',
    description: 'Computes aggregated review rating using AVG() and GROUP BY.',
    sql: `SELECT 
    p.Title,
    ROUND(AVG(r.Score), 2) AS Avg_Score
FROM paper p
JOIN review r ON p.Paper_ID = r.Paper_ID
GROUP BY p.Paper_ID, p.Title;`
  },
  {
    id: 'demo-4',
    title: 'Query 4: Reviewer Workload & Reviews Done',
    description: 'Aggregates total reviews completed per reviewer using LEFT JOIN and COUNT().',
    sql: `SELECT 
    rv.Name,
    COUNT(r.Review_ID) AS Reviews_Done,
    rv.Current_Load
FROM reviewer rv
LEFT JOIN review r ON rv.Reviewer_ID = r.Reviewer_ID
GROUP BY rv.Reviewer_ID, rv.Name, rv.Current_Load;`
  },
  {
    id: 'demo-5',
    title: 'Query 5: Decisions Grouped by Outcome',
    description: 'Shows distribution of Accept vs Revise vs Reject outcomes.',
    sql: `SELECT 
    Outcome,
    COUNT(*) AS Total
FROM decision
GROUP BY Outcome;`
  },
  {
    id: 'demo-6',
    title: 'Query 6: Papers Still Waiting for a Decision (Subquery)',
    description: 'Finds papers without a recorded decision using a NOT IN subquery.',
    sql: `SELECT 
    Paper_ID,
    Title,
    Status
FROM paper
WHERE Paper_ID NOT IN (SELECT Paper_ID FROM decision WHERE Paper_ID IS NOT NULL);`
  },
  {
    id: 'demo-7',
    title: 'Query 7: Conference Acceptance Rate Calculation',
    description: 'Calculates overall percentage of accepted papers using mathematical aggregation.',
    sql: `SELECT 
    ROUND(100.0 * SUM(CASE WHEN Outcome = 'Accept' OR Outcome = 'Approved' THEN 1 ELSE 0 END) / COUNT(*), 2) AS Acceptance_Rate_Percent
FROM decision;`
  },
  {
    id: 'demo-8',
    title: 'Query 8: Full Review Details with Paper & Reviewer Names',
    description: 'Multi-table join across Reviews, Papers, Reviewers, and Conferences.',
    sql: `SELECT 
    r.Review_ID,
    p.Title AS Paper_Title,
    rv.Name AS Reviewer_Name,
    r.Score,
    r.Comments,
    r.Review_Date
FROM review r
JOIN paper p ON r.Paper_ID = p.Paper_ID
JOIN reviewer rv ON r.Reviewer_ID = rv.Reviewer_ID
ORDER BY r.Review_ID;`
  }
];

function getDemoQueries(req, res) {
  res.json({ success: true, queries: DEMO_QUERIES });
}

async function executeQuery(req, res, next) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, message: 'SQL query string is required.' });
    }

    const trimmed = query.trim().replace(/;+$/, '');

    // Allow safe read queries only
    const upper = trimmed.toUpperCase();
    const isAllowed = /^(SELECT|SHOW|DESCRIBE|EXPLAIN)\b/.test(upper);

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: 'Security policy: Only safe read queries (SELECT, SHOW, DESCRIBE, EXPLAIN) are permitted in the web Query Console.'
      });
    }

    // Disallow dangerous keywords
    const forbidden = ['DROP ', 'ALTER ', 'TRUNCATE ', 'RENAME ', 'GRANT ', 'REVOKE '];
    if (forbidden.some(word => upper.includes(word))) {
      return res.status(403).json({
        success: false,
        message: 'Query contains prohibited DDL/administrative commands.'
      });
    }

    const startTime = Date.now();
    const [rows, fields] = await pool.query(trimmed);
    const executionTimeMs = Date.now() - startTime;

    const columns = fields ? fields.map(f => f.name) : (rows.length > 0 ? Object.keys(rows[0]) : []);

    res.json({
      success: true,
      executionTimeMs,
      rowCount: Array.isArray(rows) ? rows.length : 0,
      columns,
      data: rows
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDemoQueries,
  executeQuery
};
