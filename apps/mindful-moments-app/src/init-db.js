const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function initDatabase() {
  try {
    console.log('🔍 Checking if database schema exists...');
    
    //  Check if moments table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'moments'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Database already initialized');
      return;
    }
    
    console.log('🛠️  Initializing database schema...');
    
    // Create moments table
    await pool.query(`
      CREATE TABLE moments (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Moments table created');
    
    // Create index
    await pool.query(`
      CREATE INDEX idx_moments_created_at ON moments(created_at DESC);
    `);
    
    console.log('✅ Index created');
    
    // Create update trigger function
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    console.log('✅ Trigger function created');
    
    // Create trigger
    await pool.query(`
      CREATE TRIGGER update_moments_updated_at 
      BEFORE UPDATE ON moments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✅ Trigger created');
    
    // Insert sample data
    await pool.query(`
      INSERT INTO moments (title, content) VALUES
        ('Morning Meditation', 'Started the day with 10 minutes of mindful breathing. Feeling centered and calm.'),
        ('Gratitude Practice', 'Three things I''m grateful for today: health, family, and the beautiful sunrise.'),
        ('Mindful Walk', 'Took a 20-minute walk in nature, focusing on each step and the sounds around me.'),
        ('Breathing Exercise', 'Box breathing: 4-4-4-4. Helped reduce stress before an important meeting.'),
        ('Evening Reflection', 'Reflected on the day. Acknowledged challenges and celebrated small wins.');
    `);
    
    console.log('✅ Sample data inserted');
    console.log('🎉 Database initialized successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization error:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = initDatabase;
