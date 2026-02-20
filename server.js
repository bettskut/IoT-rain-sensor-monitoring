const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); 

// --- KONFIGURASI MONGODB LOKAL ---
// Menggunakan 127.0.0.1 (localhost) agar tidak diblokir provider internet
const MONGODB_URI = "mongodb://127.0.0.1:27017/rain_sensor_db";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Berhasil Koneksi ke MongoDB LOKAL"))
  .catch(err => console.error("❌ Gagal Koneksi MongoDB Lokal:", err.message));

// Schema
const RainLogSchema = new mongoose.Schema({
  temp: Number,
  humidity: Number,
  rain: Number,
  status: String,
  timestamp: { type: Date, default: Date.now }
});

const RainLog = mongoose.model("RainLog", RainLogSchema);

// Database sementara (RAM)
let latestData = {
  temp: 0,
  humidity: 0,
  rain: 0,
  status: "STABLE"
};

// 1. ENDPOINT UNTUK SENSOR
app.post("/sensor", async (req, res) => {
  try {
    const { temp, humidity, rain, status } = req.body;

    latestData = {
      temp: temp || 0,
      humidity: humidity || 0,
      rain: rain || 0,
      status: status || "ACTIVE"
    };
    
    console.log("--- DATA SENSOR MASUK ---");
    console.log(`Temp: ${latestData.temp}°C | Rain: ${latestData.rain} | Status: ${latestData.status}`);

    // LOGIKA FILTER: Simpan ke MongoDB jika status adalah 'HUJAN'
    if (latestData.status === "HUJAN" || latestData.rain < 3500) {
      const newLog = new RainLog(latestData);
      await newLog.save();
      console.log("🌧️  Data Hujan tersimpan ke MongoDB Lokal!");
    }
    
    res.status(200).send("Data Received");
  } catch (err) {
    console.error("Error processing data:", err);
    res.status(500).send("Server Error");
  }
});

// 2. ENDPOINT UNTUK DASHBOARD
app.get("/data", (req, res) => {
  res.json(latestData);
});

// KONFIGURASI SERVER
const PORT = 3000;
const IP_ADDRESS = '10.18.19.62'; // Sesuaikan IP

app.listen(PORT, IP_ADDRESS, () => {
  console.log("========================================");
  console.log(`   SERVER IOT + DATABASE LOKAL RUNNING   `);
  console.log(` URL Dashboard: http://${IP_ADDRESS}:${PORT}/data `);
  console.log(` URL Sensor   : http://${IP_ADDRESS}:${PORT}/sensor `);
  console.log("========================================");
});
