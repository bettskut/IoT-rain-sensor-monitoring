#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22
#define RAIN_PIN 32

// ======================
// WIFI
// ======================
const char* ssid = "oktobert";
const char* password = "12348765";

// IP PC
const char* serverURL = "http://10.18.19.62:3000/sensor";

DHT dht(DHTPIN, DHTTYPE);

int lastRain = 0;


// ======================
// BACA RAIN (SMOOTH)
// ======================
int readRain() {
  long total = 0;
  int valid = 0;

  for (int i = 0; i < 40; i++) {
    int val = analogRead(RAIN_PIN);

    if (val > 50 && val < 4040) {
      total += val;
      valid++;
    }

    delay(2);
  }

  if (valid == 0) return 4095;

  return total / valid;
}


void setup() {
  Serial.begin(115200);
  dht.begin();

  analogReadResolution(12);
  analogSetAttenuation(ADC_11db);

  // ===== CONNECT WIFI =====
  WiFi.begin(ssid, password);
  Serial.print("Connecting WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\nWiFi Connected!");
  Serial.println(WiFi.localIP());
}


void loop() {

  int rainValue = readRain();

  rainValue = (lastRain * 0.7) + (rainValue * 0.3);
  lastRain = rainValue;

  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    delay(2000);
    return;
  }

  String status = "TIDAK HUJAN";

  if (rainValue < 1200) status = "HUJAN DERAS";
  else if (rainValue < 2800) status = "GERIMIS";

  // ======================
  // PRINT SERIAL
  // ======================
  Serial.printf("T: %.1f | H: %.1f | R: %d | %s\n",
                temperature, humidity, rainValue, status.c_str());


  // ======================
  // KIRIM KE SERVER
  // ======================
  if (WiFi.status() == WL_CONNECTED) {

    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["temp"] = temperature;
    doc["humidity"] = humidity;
    doc["rain"] = rainValue;
    doc["status"] = status;

    String body;
    serializeJson(doc, body);

    int code = http.POST(body);

    Serial.print("POST code: ");
    Serial.println(code);

    http.end();
  }

  delay(2000);
}
