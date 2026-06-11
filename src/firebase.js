// Firebase Realtime Database Configuration
// For ECG Monitoring Dashboard

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js';
import { getDatabase, ref, onValue, set, update } from 'https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://ecg-monitor-64a01-default-rtdb.asia-southeast1.firebasedatabase.app/'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the database service
const database = getDatabase(app);

// Database references
const latestDataRef = ref(database, 'latestData');
const deviceStatusRef = ref(database, 'deviceStatus');
const historyRef = ref(database, 'history');

/**
 * Get the latest sensor data from Firebase
 * @returns {Promise<Object>} Latest data object
 */
export async function getLatestData() {
  return new Promise((resolve, reject) => {
    onValue(latestDataRef, (snapshot) => {
      if (snapshot.exists()) {
        resolve(snapshot.val());
      } else {
        resolve(null);
      }
    }, (error) => {
      reject(error);
    });
  });
}

/**
 * Update latest sensor data in Firebase
 * @param {Object} data - Data object with heartRate, spo2, hrv, ecgStatus, fallDetected, battery
 */
export async function updateLatestData(data) {
  try {
    await update(latestDataRef, {
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating Firebase data:', error);
    throw error;
  }
}

/**
 * Listen for real-time updates to latest data
 * @param {Function} callback - Function to call when data changes
 */
export function onLatestDataChange(callback) {
  onValue(latestDataRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val());
    }
  }, (error) => {
    console.error('Error listening to Firebase data:', error);
  });
}

/**
 * Update device status in Firebase
 * @param {Object} status - Status object
 */
export async function updateDeviceStatus(status) {
  try {
    await set(deviceStatusRef, {
      ...status,
      lastUpdate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating device status:', error);
    throw error;
  }
}

/**
 * Add data to history
 * @param {Object} data - Data to store in history
 */
export async function addToHistory(data) {
  try {
    const newHistoryRef = ref(database, `history/${new Date().getTime()}`);
    await set(newHistoryRef, {
      ...data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error adding to history:', error);
    throw error;
  }
}

export { database, ref };
