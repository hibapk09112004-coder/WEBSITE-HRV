const { kv } = require('@vercel/kv');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, headers);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, headers);
    res.end(JSON.stringify({ error: 'Use POST to send ESP32 data.' }));
    return;
  }

  try {
    const body = await getBody(req);
    const data = JSON.parse(body);

    const payload = {
      heartRate: Number(data.heartRate) || 0,
      spo2: Number(data.spo2) || 0,
      hrv: Number(data.hrv) || 0,
      ecgStatus: String(data.ecgStatus || 'Unknown'),
      fallDetected:
        data.fallDetected === true ||
        data.fallDetected === 'true' ||
        data.fallDetected === 1 ||
        data.fallDetected === '1',
      battery: Number(data.battery) || 0,
      receivedAt: Date.now(),
    };

    try {
      await kv.set('ecg:latest', JSON.stringify(payload), { ex: 300 });
    } catch (kvError) {
      console.log('KV not available');
    }

    res.writeHead(200, headers);
    res.end(JSON.stringify({ success: true, payload }));
  } catch (error) {
    res.writeHead(400, headers);
    res.end(JSON.stringify({ error: 'Invalid JSON payload', details: error.message }));
  }
};

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}
