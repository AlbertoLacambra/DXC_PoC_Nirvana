const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const promClient = require('prom-client');

const app = express();
const PORT = process.env.PORT || 8080;

// Prometheus metrics
const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// Request duration tracking
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    httpRequestDurationMicroseconds
      .labels(req.method, req.route?.path || req.path, res.statusCode)
      .observe(duration);
  });
  next();
});

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection error:', err.message);
  } else {
    console.log('✅ Database connected successfully at:', res.rows[0].now);
  }
});

// Routes

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database
    await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Liveness probe (simpler than health)
app.get('/health/live', (req, res) => {
  res.status(200).json({ status: 'alive' });
});

// Readiness probe
app.get('/health/ready', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});

// Metrics endpoint for Prometheus
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.send(await register.metrics());
});

// Home endpoint
app.get('/', (req, res) => {
  res.json({
    app: 'Mindful Moments',
    version: '1.0.0',
    description: 'Azure SRE Agent Demo Application',
    endpoints: {
      health: '/health',
      moments: '/api/moments',
      metrics: '/metrics',
      simulate_error: '/api/simulate/error',
      simulate_slow: '/api/simulate/slow'
    }
  });
});

// Get all mindful moments
app.get('/api/moments', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, content, created_at, updated_at FROM moments ORDER BY created_at DESC'
    );
    res.json({
      count: result.rows.length,
      moments: result.rows
    });
  } catch (error) {
    console.error('Error fetching moments:', error);
    res.status(500).json({ error: 'Failed to fetch moments' });
  }
});

// Get single moment
app.get('/api/moments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT id, title, content, image_url, created_at, updated_at FROM moments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching moment:', error);
    res.status(500).json({ error: 'Failed to fetch moment' });
  }
});

// Create new moment
app.post('/api/moments', async (req, res) => {
  try {
    const { title, content, image_url } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO moments (title, content, image_url) VALUES ($1, $2, $3) RETURNING *',
      [title, content, image_url || null]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating moment:', error);
    res.status(500).json({ error: 'Failed to create moment' });
  }
});

// Update moment
app.put('/api/moments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, image_url } = req.body;
    
    const result = await pool.query(
      'UPDATE moments SET title = COALESCE($1, title), content = COALESCE($2, content), image_url = COALESCE($3, image_url), updated_at = NOW() WHERE id = $4 RETURNING *',
      [title, content, image_url, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating moment:', error);
    res.status(500).json({ error: 'Failed to update moment' });
  }
});

// Delete moment
app.delete('/api/moments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM moments WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Moment not found' });
    }
    
    res.json({ message: 'Moment deleted successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Error deleting moment:', error);
    res.status(500).json({ error: 'Failed to delete moment' });
  }
});

// Simulate error (for SRE Agent testing)
app.get('/api/simulate/error', (req, res) => {
  const errorType = req.query.type || '500';
  
  switch(errorType) {
    case '500':
      throw new Error('Simulated internal server error');
    case '404':
      res.status(404).json({ error: 'Simulated not found error' });
      break;
    case 'timeout':
      // Simulate timeout (no response)
      setTimeout(() => {
        res.status(504).json({ error: 'Gateway timeout' });
      }, 30000);
      break;
    case 'db':
      // Simulate database error
      pool.query('SELECT * FROM nonexistent_table')
        .catch(err => res.status(500).json({ error: 'Database error', details: err.message }));
      break;
    default:
      res.status(400).json({ error: 'Unknown error type' });
  }
});

// Simulate slow response (for performance testing)
app.get('/api/simulate/slow', async (req, res) => {
  const delay = parseInt(req.query.delay) || 5000;
  await new Promise(resolve => setTimeout(resolve, delay));
  res.json({ message: `Responded after ${delay}ms`, timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Mindful Moments app listening on port ${PORT}`);
  console.log(`📊 Metrics available at http://localhost:${PORT}/metrics`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end(() => {
      console.log('Database pool closed');
      process.exit(0);
    });
  });
});

module.exports = app;
