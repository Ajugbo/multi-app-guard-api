import { Pool } from 'pg';

// Initialize connection pool once per cold start
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req, res) {
  // Enable CORS for mobile app testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { deviceId } = req.query;

  if (!deviceId) {
    return res.status(400).json({ 
      success: false, 
      error: 'Device ID is required' 
    });
  }

  try {
    const result = await pool.query(
      'SELECT is_active FROM drivers WHERE device_id = $1', 
      [deviceId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        isActive: false, 
        message: 'Device not registered' 
      });
    }

    return res.status(200).json({ 
      success: true, 
      isActive: result.rows[0].is_active 
    });
  } catch (error) {
    console.error('DB Error:', error.message);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
