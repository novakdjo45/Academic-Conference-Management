const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { testConnection } = require('./db/connection');
const { errorHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Request logger for debugging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// API Routes
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/authors', require('./routes/authors'));
app.use('/api/papers', require('./routes/papers'));
app.use('/api/reviewers', require('./routes/reviewers'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/conferences', require('./routes/conferences'));
app.use('/api/decisions', require('./routes/decisions'));
app.use('/api/query', require('./routes/query'));

// Direct health check
app.get('/api/health', async (req, res) => {
  const result = await testConnection();
  if (result.connected) {
    res.json({
      success: true,
      status: 'connected',
      database: result.database,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT
    });
  } else {
    res.status(503).json({
      success: false,
      status: 'offline',
      error: result.error
    });
  }
});

// Root ping
app.get('/', (req, res) => {
  res.json({
    name: 'ConferenceDB API',
    subtitle: 'Academic Conference Paper Submission & Review System',
    status: 'running',
    endpoints: [
      '/api/health',
      '/api/dashboard/stats',
      '/api/authors',
      '/api/papers',
      '/api/reviewers',
      '/api/reviews',
      '/api/conferences',
      '/api/decisions',
      '/api/query/presets',
      '/api/query/execute'
    ]
  });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 ConferenceDB Backend running on port ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  const dbStatus = await testConnection();
  if (dbStatus.connected) {
    console.log(`✅ Connected to MySQL database [${dbStatus.database}]`);
  } else {
    console.error(`❌ Failed to connect to MySQL: ${dbStatus.error}`);
  }
  console.log(`=================================================`);
});
