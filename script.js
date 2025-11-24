import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, get, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
  authDomain: "monitoring-kel-12.firebaseapp.com",
  databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kel-12",
  storageBucket: "monitoring-kel-12.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// CARD DATA TERKINI (NODE: /KondisiSaatIni)
const kondisiRef = ref(db, "/KondisiSaatIni");
const elStatus     = document.getElementById("status-firebase");
const elAngin      = document.getElementById("nilai-angin");
const elHujan      = document.getElementById("nilai-hujan");
const elCahaya     = document.getElementById("nilai-cahaya");
const elWaktu      = document.getElementById("nilai-waktu");
const elLastUpdate = document.getElementById("last-update-text");

// Grafik per-detk (40 data rolling window)
const ctx = document.getElementById("grafik-kondisi").getContext("2d");
const maxPoints = 40;
const chartKondisi = new Chart(ctx, {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Angin (m/s)", data: [],
        borderColor: "#307cf2", backgroundColor: "rgba(54, 162, 235, 0.15)",
        tension: 0.22, yAxisID: "y"
      },
      {
        label: "Hujan (mm)", data: [],
        borderColor: "#2edbb6", backgroundColor: "rgba(75, 192, 192, 0.15)",
        tension: 0.2, yAxisID: "y"
      },
      {
        label: "Cahaya (lx)", data: [],
        borderColor: "#ffae52", backgroundColor: "rgba(255, 159, 64, 0.13)",
        tension: 0.17, yAxisID: "y2"
      }
    ]
  },
  options: {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    stacked: false,
    scales: {
      x: { ticks: { maxRotation: 0, autoSkip: true } },
      y: { beginAtZero: true, title: { display: true, text: "Angin / Hujan" }},
      y2: {
        position: "right",
        grid: { drawOnChartArea: false },
        title: { display: true, text: "Cahaya (lx)" }
      }
    }
  }
});

onValue(
  kondisiRef,
  (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      elStatus.className = "alert alert-warning py-2";
      elStatus.textContent = "Terhubung ke Firebase, tetapi KondisiSaatIni kosong";
      elAngin.textContent  = "--";
      elHujan.textContent  = "--";
      elCahaya.textContent = "--";
      elWaktu.textContent  = "--";
      elLastUpdate.textContent = "Belum ada data dari alat.";
      return;
    }
    elStatus.className = "alert alert-success py-2";
    elStatus.textContent = "Terhubung ke Firebase";

    const angin  = Number(data.angin_mps  ?? 0).toFixed(2);
    const hujan  = Number(data.hujan_mm   ?? 0).toFixed(2);
    const cahaya = Number(data.cahaya_lx  ?? 0).toFixed(1);
    const waktu  = data.waktu ?? "--";
    elAngin.textContent  = angin;
    elHujan.textContent  = hujan;
    elCahaya.textContent = cahaya;
    elWaktu.textContent  = waktu;
    elLastUpdate.textContent = "Terakhir update: " + waktu;
    // Grafik update
    chartKondisi.data.labels.push(waktu);
    chartKondisi.data.datasets[0].data.push(Number(angin));
    chartKondisi.data.datasets[1].data.push(Number(hujan));
    chartKondisi.data.datasets[2].data.push(Number(cahaya));
    if (chartKondisi.data.labels.length > maxPoints) {
      chartKondisi.data.labels.shift();
      chartKondisi.data.datasets.forEach(ds => ds.data.shift());
    }
    chartKondisi.update();
  },
  (error) => {
    elStatus.className = "alert alert-danger py-2";
    elStatus.textContent = "Terputus dari Firebase: " + error.code;
    elAngin.textContent  = "--";
    elHujan.textContent  = "--";
    elCahaya.textContent = "--";
    elWaktu.textContent  = "--";
    elLastUpdate.textContent = "Mencoba menghubungkan kembali...";
  }
);

// TABLE DATA PER-MENIT (NODE: /PerMenit/YYYY-MM-DD)
async function loadPerMenitForTanggal(tgl) {
  const path = "/PerMenit/" + tgl;
  const minRef = ref(db, path);
  try {
    const snap = await get(minRef);
    const tbody = document.getElementById("tabel-permenit").querySelector("tbody");
    tbody.innerHTML = "";
    if (!snap.exists()) {
      const row = tbody.insertRow();
      row.innerHTML = `<td colspan="5" class="text-center">Tidak ada data untuk tanggal ini.</td>`;
      return;
    }
    snap.forEach(child => {
      const key = child.key;
      const val = child.val();
      const row = tbody.insertRow();
      row.insertCell(0).textContent = key;
      row.insertCell(1).textContent = Number(val.angin_rata2 ?? 0).toFixed(2);
      row.insertCell(2).textContent = Number(val.hujan_total_mm ?? 0).toFixed(2);
      row.insertCell(3).textContent = Number(val.cahaya_rata2 ?? 0).toFixed(2);
      row.insertCell(4).textContent = val.count ?? "-";
    });
  } catch (err) {
    const tbody = document.getElementById("tabel-permenit").querySelector("tbody");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal mengambil data! (${err.message})</td></tr>`;
  }
}

// Tombol & auto-load untuk hari ini
document.getElementById("btn-tampil").onclick = function() {
  const tgl = document.getElementById("tanggalPicker").value;
  const tbody = document.getElementById("tabel-permenit").querySelector("tbody");
  if (!tgl) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Tanggal belum dipilih.</td></tr>`;
    return;
  }
  tbody.innerHTML = `<tr><td colspan="5" class="text-center">Memuat data...</td></tr>`;
  loadPerMenitForTanggal(tgl);
};
window.addEventListener("DOMContentLoaded", () => {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let dd = String(today.getDate()).padStart(2, '0');
  const picker = document.getElementById("tanggalPicker");
  picker.value = `${yyyy}-${mm}-${dd}`;
  loadPerMenitForTanggal(picker.value);
});
