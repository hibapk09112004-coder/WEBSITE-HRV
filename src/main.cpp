#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>

#define ECG_PIN A0

const char* ssid = "OPPO A3 Pro 5G";
const char* password = "password!";
const char* serverUrl = "https://ecgmonitor.vercel.app/api/update-data";
const unsigned long sendIntervalMs = 1000;
unsigned long lastSendMs = 0;

void connectWiFi() {
  Serial.printf("Connecting to Wi-Fi '%s'...\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(500);
  }
  Serial.println();
  Serial.print("Wi-Fi connected. IP address: ");
  Serial.println(WiFi.localIP());
}

String buildPayload(int rawEcg) {
  int heartRate = 72;  // Replace with actual BPM logic
  int spo2 = 98;      // Replace with real SpO2 logic
  int hrv = 45;       // Replace with HRV calculation
  bool fallDetected = false;
  int battery = 87;

  String payload = "{";
  payload += "\"heartRate\":" + String(heartRate) + ",";
  payload += "\"spo2\":" + String(spo2) + ",";
  payload += "\"hrv\":" + String(hrv) + ",";
  payload += "\"ecgStatus\":\"Normal\",";
  payload += "\"fallDetected\":" + String(fallDetected ? "true" : "false") + ",";
  payload += "\"battery\":" + String(battery);
  payload += "}";

  return payload;
}

bool sendData(int rawEcg) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi is not connected, cannot send data.");
    return false;
  }

  String payload = buildPayload(rawEcg);
  Serial.println("\n--- Sending sensor payload ---");
  Serial.printf("URL: %s\n", serverUrl);
  Serial.printf("Payload length: %u\n", payload.length());
  Serial.println(payload);

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient https;
  https.begin(client, serverUrl);
  https.addHeader("Content-Type", "application/json");

  int httpCode = https.POST(payload);
  String response = https.getString();
  Serial.printf("POST response code: %d\n", httpCode);
  Serial.println("Backend response:");
 Serial.println("========== SERVER RESPONSE ==========");
Serial.println(response);
Serial.println("====================================");

  if (httpCode <= 0) {
    Serial.printf("POST failed, error: %s\n", https.errorToString(httpCode).c_str());
  } else if (httpCode != 200) {
    Serial.println("Server returned non-200 status.");
  }

  https.end();
  return httpCode == 200;
}

void setup() {
  Serial.begin(115200);
  delay(3000);
  Serial.println("ESP32 STARTED");
  pinMode(ECG_PIN, INPUT);
  connectWiFi();
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Wi-Fi disconnected, reconnecting...");
    connectWiFi();
  }

  if (millis() - lastSendMs >= sendIntervalMs) {
    lastSendMs = millis();
    int ecgValue = analogRead(ECG_PIN);
    Serial.printf("Raw ECG reading: %d\n", ecgValue);

    bool success = sendData(ecgValue);
    Serial.printf("Send %s\n", success ? "successful" : "failed");
  }
}