const updateData = require('./update-data');

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

module.exports = async (_, res) => {
  try {
    const latestData = await storage.getLatestData();

    if (!latestData || !latestData.receivedAt) {
      res.writeHead(200, headers);
      res.end(
        JSON.stringify({
          online: false,
          ageSeconds: null,
          data: null,
          message: 'No data received yet.',
        })
      );
      return;
    }

    const ageSeconds = Math.round((Date.now() - latestData.receivedAt) / 1000);
    const online = ageSeconds <= 15;

    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        online,
        ageSeconds,
        data: {
          heartRate: latestData.heartRate,
          spo2: latestData.spo2,
          hrv: latestData.hrv,
          ecgStatus: latestData.ecgStatus,
          fallDetected: latestData.fallDetected,
          battery: latestData.battery,
        },
        receivedAt: latestData.receivedAt,
      })
    );
  } catch (error) {
    res.writeHead(200, headers);
    res.end(
      JSON.stringify({
        online: false,
        ageSeconds: null,
        data: null,
        message: 'Error reading data.',
      })
    );
  }
};

