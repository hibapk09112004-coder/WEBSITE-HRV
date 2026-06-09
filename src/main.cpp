#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>

#define ECG_PIN A0

const char* ssid = "ECG_MONITOR";
const char* password = "12345678";

WebServer server(80);

void handleRoot() {
  int ecgValue = analogRead(ECG_PIN);

  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="1">
<title>ECG Monitor</title>
<style>
body {
  font-family: Arial, sans-serif;
  text-align: center;
  margin-top: 40px;
}
.value {
  font-size: 32px;
  color: blue;
}
</style>
</head>
<body>
<h1>Portable ECG Monitoring System</h1>
<p>ECG Signal Value:</p>
<div class="value">
)rawliteral";

  html += String(ecgValue);

  html += R"rawliteral(
</div>
</body>
</html>
)rawliteral";
https://git-scm.com/download/win
  server.send(200, "text/html", html);
}

void setup() {
  Serial.begin(115200);

  pinMode(ECG_PIN, INPUT);

  // Create Wi-Fi hotspot
  WiFi.softAP(ssid, password);

  Serial.println("WiFi Access Point Started");
  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());

  server.on("/", handleRoot);

  server.begin();

  Serial.println("Web Server Started");
}

void loop() {
  server.handleClient();
}