# ESP32 ECG Dashboard Payload

Send live sensor data from the ESP32 to the Vercel backend using HTTP POST.

## POST /api/update-data

Example JSON body:

```json
{
  "heartRate": 72,
  "spo2": 98,
  "hrv": 45,
  "ecgStatus": "Normal",
  "fallDetected": false,
  "battery": 87
}
```

## GET /api/latest-data

Returns the latest received sensor values and online status:

```json
{
  "online": true,
  "ageSeconds": 3,
  "data": {
    "heartRate": 72,
    "spo2": 98,
    "hrv": 45,
    "ecgStatus": "Normal",
    "fallDetected": false,
    "battery": 87
  },
  "receivedAt": 1715466752914
}
```

## Notes

- `ESP32 Online` is shown when the last update was received within 15 seconds.
- Data is held in ephemeral storage for lightweight live monitoring.
