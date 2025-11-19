# 🌐 IAQ Monitoring Dashboard (ESP32 + Firebase)

Proyek ini menampilkan data **kualitas udara secara realtime** dari sensor ESP32 ke Firebase dan menampilkannya di halaman web bergaya **Neon Dark (Cyber Style)**.

## 🚀 Fitur
- Realtime update dari Firebase Realtime Database
- Tampilan modern dengan tema Cyber/Neon
- Data yang ditampilkan:
  - 🌡️ Suhu (°C)
  - 💧 Kelembaban (%)
  - 🌫️ Partikel Debu (mg/m³)
  - ☁️ CO₂ (ppm)
  - 📊 Status udara
  - 🕒 Waktu update

## 🔧 Struktur Proyek
```
📁 IAQ-Monitor-Web/
├── index.html      → Tampilan utama dashboard
├── script.js       → Koneksi Firebase Realtime Database
└── README.md       → Deskripsi proyek
```

## ⚙️ Firebase Realtime Database
Struktur data dari ESP32:
```
/IAQ/
 ├── suhu
 ├── kelembaban
 ├── MQ-135
 ├── Partikel
 ├── status
 └── waktu
```

## 📡 Cara Menjalankan
1. Upload kode ESP32 ke perangkat kamu.
2. Buka `index.html` di browser **atau** upload ke GitHub Pages.
3. Dashboard akan menampilkan data sensor secara realtime!

## 💻 Teknologi
- ESP32 (C++)
- Firebase Realtime Database
- HTML5, CSS3, JavaScript (ES6 Module)
- GitHub Pages (Hosting)

---
🔥 **Developed by:** Andrean  
🧠 Powered by ESP32 + Firebase + OpenAI GPT-5
