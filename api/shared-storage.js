// Shared in-memory storage for sensor data
// This works within a single Vercel instance
let latestSensorData = {
  heartRate: 0,
  spo2: 0,
  hrv: 0,
  ecgStatus: 'Unknown',
  fallDetected: false,
  battery: 0,
  receivedAt: 0,
};

module.exports = {
  setLatestData: (data) => {
    latestSensorData = { ...data };
  },
  getLatestData: () => {
    return { ...latestSensorData };
  },
};
