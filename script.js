import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
  authDomain: "monitoring-kel-12.firebaseapp.com",
  databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kel-12",
  storageBucket: "monitoring-kel-12.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// VERSI BENAR: baca node /A_KondisiSaatIni
const kondisiRef = ref(db, "/A_KondisiSaatIni");

onValue(
  kondisiRef,
  (snapshot) => {
    const data = snapshot.val();
    const statusEl = document.getElementById("status-firebase");

    if (!data) {
      if (statusEl) {
        statusEl.className = "alert alert-warning py-2";
        statusEl.textContent = "Terhubung ke Firebase, tapi A_KondisiSaatIni kosong";
      }
      document.getElementById("nilai-angin").textContent   = "--";
      document.getElementById("nilai-hujan").textContent   = "--";
      document.getElementById("nilai-cahaya").textContent  = "--";
      document.getElementById("nilai-waktu").textContent   = "--";
      document.getElementById("last-update-text").textContent = "Belum ada data dari alat.";
      return;
    }

    if (statusEl) {
      statusEl.className = "alert alert-success py-2";
      statusEl.textContent = "Terhubung ke Firebase";
    }

    const angin  = Number(data.angin_mps  ?? 0).toFixed(2);
    const hujan  = Number(data.hujan_mm   ?? 0).toFixed(2);
    const cahaya = Number(data.cahaya_lx  ?? 0).toFixed(1);
    const waktu  = data.waktu ?? "--";

    document.getElementById("nilai-angin").textContent   = angin + " m/s";
    document.getElementById("nilai-hujan").textContent   = hujan + " mm";
    document.getElementById("nilai-cahaya").textContent  = cahaya + " lx";
    document.getElementById("nilai-waktu").textContent   = waktu;
    document.getElementById("last-update-text").textContent = "Terakhir update: " + waktu;
  },
  (error) => {
    console.error(error);
    const statusEl = document.getElementById("status-firebase");
    if (statusEl) {
      statusEl.className = "alert alert-danger py-2";
      statusEl.textContent = "Terputus dari Firebase: " + error.code;
    }
  }
);
