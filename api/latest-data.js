const fs = require('fs').promises;
const storagePath = '/tmp/latest-ecg-data.json';

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

module.exports = async (_, res) => {
  try {
    const raw = await fs.readFile(storagePath, 'utf8');
    const payload = JSON.parse(raw);
    const ageSeconds = Math.round((Date.now() - payload.receivedAt) / 1000);
    const online = ageSeconds <= 15;

    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        online,
        ageSeconds,
        data: {
          heartRate: payload.heartRate,
          spo2: payload.spo2,
          hrv: payload.hrv,
          ecgStatus: payload.ecgStatus,
          fallDetected: payload.fallDetected,
          battery: payload.battery,
        },
        receivedAt: payload.receivedAt,
      })
    );
  } catch (error) {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        online: false,
        ageSeconds: null,
        data: null,
        message: 'No data received yet.',
      })
    );
  }
};
