import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// KONFIGURASI PROJECT WEATHER STATION-MU
const firebaseConfig = {
  apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
  authDomain: "monitoring-kel-12.firebaseapp.com",
  databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kel-12",
  storageBucket: "monitoring-kel-12.appspot.com"
  // messagingSenderId dan appId boleh ditambah kalau mau, tapi tidak wajib untuk RTDB saja
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// VERSI ALATMU: NODE UTAMA DI /A_KondisiSaatIni
const kondisiRef = ref(db, "/A_KondisiSaatIni");

onValue(kondisiRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) {
    document.getElementById("nilai-angin").textContent   = "--";
    document.getElementById("nilai-hujan").textContent   = "--";
    document.getElementById("nilai-cahaya").textContent  = "--";
    document.getElementById("nilai-waktu").textContent   = "--";
    document.getElementById("status-firebase").textContent = "Terhubung, tapi data kosong";
    return;
  }

  // Ambil field dari ESP32
  const angin  = Number(data.angin_mps  ?? 0).toFixed(2);
  const hujan  = Number(data.hujan_mm   ?? 0).toFixed(2);
  const cahaya = Number(data.cahaya_lx  ?? 0).toFixed(1);
  const waktu  = data.waktu ?? "--";

  // Tampilkan ke elemen HTML (samakan ID dengan index.html-mu)
  document.getElementById("nilai-angin").textContent  = angin + " m/s";
  document.getElementById("nilai-hujan").textContent  = hujan + " mm";
  document.getElementById("nilai-cahaya").textContent = cahaya + " lx";
  document.getElementById("nilai-waktu").textContent  = waktu;

  const last = document.getElementById("last-update-text");
  if (last) last.textContent = "Terakhir update: " + waktu;

  const statusEl = document.getElementById("status-firebase");
  if (statusEl) {
    statusEl.className = "alert alert-success py-2";
    statusEl.textContent = "Terhubung ke Firebase";
  }
}, (error) => {
  console.error(error);
  const statusEl = document.getElementById("status-firebase");
  if (statusEl) {
    statusEl.className = "alert alert-danger py-2";
    statusEl.textContent = "Terputus dari Firebase: " + error.code;
  }
});
