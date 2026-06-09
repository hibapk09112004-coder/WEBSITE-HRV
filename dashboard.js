const apiUrl = '/api/latest-data';
const statusMap = {
  green: 'status-success',
  yellow: 'status-warning',
  red: 'status-danger',
  neutral: 'status-neutral',
};

const fields = {
  heartRate: document.getElementById('heartRate'),
  spo2: document.getElementById('spo2'),
  hrv: document.getElementById('hrv'),
  ecgStatus: document.getElementById('ecgStatus'),
  fallDetected: document.getElementById('fallDetected'),
  battery: document.getElementById('battery'),
  statusText: document.getElementById('status-text'),
  lastUpdate: document.getElementById('last-update'),
  connectionAge: document.getElementById('connection-age'),
  deviceStatus: document.getElementById('device-status'),
  statusIndicator: document.getElementById('status-indicator'),
  heartRateStatus: document.getElementById('heartRate-status'),
  spo2Status: document.getElementById('spo2-status'),
  hrvStatus: document.getElementById('hrv-status'),
  ecgStatusText: document.getElementById('ecg-status-text'),
  fallStatusText: document.getElementById('fall-status-text'),
  batteryStatus: document.getElementById('battery-status'),
  heartRateDot: document.getElementById('heartRate-dot'),
  spo2Dot: document.getElementById('spo2-status-dot'),
  hrvDot: document.getElementById('hrv-dot'),
  ecgDot: document.getElementById('ecg-dot'),
  fallDot: document.getElementById('fall-dot'),
  batteryDot: document.getElementById('battery-dot'),
};

function setDot(element, color) {
  element.className = `status-dot ${statusMap[color] || statusMap.neutral}`;
}

function updateCardText(element, text, color) {
  element.textContent = text;
  const statusClass = color ? statusMap[color] : '';
  element.className = `card-status ${statusClass}`.trim();
}

function getRangeStatus(value, thresholds) {
  if (value === null || value === undefined) return { color: 'neutral', label: 'Waiting' };
  if (value <= thresholds.lowCritical || value >= thresholds.highCritical) return { color: 'red', label: thresholds.criticalLabel };
  if (value <= thresholds.lowWarning || value >= thresholds.highWarning) return { color: 'yellow', label: thresholds.warningLabel };
  return { color: 'green', label: thresholds.normalLabel };
}

function getHeartRateStatus(value) {
  return getRangeStatus(value, {
    lowCritical: 40,
    lowWarning: 50,
    highWarning: 100,
    highCritical: 130,
    normalLabel: 'Normal',
    warningLabel: 'Warning',
    criticalLabel: 'Critical',
  });
}

function getSpo2Status(value) {
  return getRangeStatus(value, {
    lowCritical: 89,
    lowWarning: 94,
    highWarning: 100,
    highCritical: 999,
    normalLabel: 'Normal',
    warningLabel: 'Warning',
    criticalLabel: 'Critical',
  });
}

function getHrvStatus(value) {
  if (value === null || value === undefined) return { color: 'neutral', label: 'Waiting' };
  if (value < 40) return { color: 'red', label: 'Critical' };
  if (value < 60) return { color: 'yellow', label: 'Warning' };
  return { color: 'green', label: 'Normal' };
}

function getBatteryStatus(value) {
  if (value === null || value === undefined) return { color: 'neutral', label: 'Waiting' };
  if (value < 20) return { color: 'red', label: 'Critical' };
  if (value < 50) return { color: 'yellow', label: 'Warning' };
  return { color: 'green', label: 'Normal' };
}

function getEcgStatus(value) {
  if (!value) return { color: 'neutral', label: 'Waiting' };
  const normalized = String(value).toLowerCase();
  if (normalized.includes('normal')) return { color: 'green', label: value };
  if (normalized.includes('warn')) return { color: 'yellow', label: value };
  return { color: 'red', label: value };
}

function getFallStatus(value) {
  if (value === null || value === undefined) return { color: 'neutral', label: 'Waiting' };
  if (value) return { color: 'red', label: 'Fall Detected' };
  return { color: 'green', label: 'No Fall' };
}

function formatTimestamp(ts) {
  if (!ts) return '--';
  return new Date(ts).toLocaleString();
}

async function fetchLatestData() {
  try {
    const response = await fetch(apiUrl);
    const payload = await response.json();
    renderDashboard(payload);
  } catch (error) {
    console.error('Failed to load dashboard data', error);
    fields.statusText.textContent = 'Unable to load data';
    fields.deviceStatus.textContent = 'Offline';
    fields.deviceStatus.className = 'status-pill status-offline';
    fields.statusIndicator.className = 'status-dot status-danger';
  }
}

function renderDashboard(payload) {
  const online = payload.online;
  const data = payload.data || {};

  fields.heartRate.textContent = data.heartRate ?? '--';
  fields.spo2.textContent = data.spo2 ?? '--';
  fields.hrv.textContent = data.hrv ?? '--';
  fields.ecgStatus.textContent = data.ecgStatus ?? '--';
  fields.fallDetected.textContent = data.fallDetected == null ? '--' : data.fallDetected ? 'YES' : 'NO';
  fields.battery.textContent = data.battery ?? '--';

  fields.lastUpdate.textContent = payload.receivedAt ? formatTimestamp(payload.receivedAt) : '--';
  fields.connectionAge.textContent = payload.ageSeconds == null ? '--' : `${payload.ageSeconds}s ago`;

  fields.deviceStatus.textContent = online ? 'ESP32 Online' : 'ESP32 Offline';
  fields.deviceStatus.className = `status-pill ${online ? 'status-online' : 'status-offline'}`;
  fields.statusIndicator.className = `status-dot ${online ? 'status-success' : 'status-danger'}`;
  fields.statusText.textContent = online ? 'Receiving live sensor data' : 'Waiting for new updates';

  const hrStatus = getHeartRateStatus(data.heartRate);
  setDot(fields.heartRateDot, hrStatus.color);
  updateCardText(fields.heartRateStatus, hrStatus.label, hrStatus.color);

  const spo2Status = getSpo2Status(data.spo2);
  setDot(fields.spo2Dot, spo2Status.color);
  updateCardText(fields.spo2Status, spo2Status.label, spo2Status.color);

  const hrvStatus = getHrvStatus(data.hrv);
  setDot(fields.hrvDot, hrvStatus.color);
  updateCardText(fields.hrvStatus, hrvStatus.label, hrvStatus.color);

  const ecgStatus = getEcgStatus(data.ecgStatus);
  setDot(fields.ecgDot, ecgStatus.color);
  updateCardText(fields.ecgStatusText, ecgStatus.label, ecgStatus.color);

  const fallStatus = getFallStatus(data.fallDetected);
  setDot(fields.fallDot, fallStatus.color);
  updateCardText(fields.fallStatusText, fallStatus.label, fallStatus.color);

  const batteryStatus = getBatteryStatus(data.battery);
  setDot(fields.batteryDot, batteryStatus.color);
  updateCardText(fields.batteryStatus, batteryStatus.label, batteryStatus.color);
}

fetchLatestData();
setInterval(fetchLatestData, 1000);
