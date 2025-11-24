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

// Fungsi untuk ambil data per-menit berdasarkan tanggal (YYYY-MM-DD)
async function loadPerMenitForTanggal(tgl) {
  const path = "/C_PerMenit/" + tgl;
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
      const key = child.key; // format "HH-MM"
      const val = child.val();
      const row = tbody.insertRow();
      row.insertCell(0).textContent = key;
      row.insertCell(1).textContent = Number(val.angin_rata2 ?? 0).toFixed(2);
      row.insertCell(2).textContent = Number(val.hujan_total_mm ?? 0).toFixed(2);
      row.insertCell(3).textContent = Number(val.cahaya_rata2 ?? 0).toFixed(2);
      row.insertCell(4).textContent = val.count ?? "-";
    });
  } catch (err) {
    console.error(err);
    const tbody = document.getElementById("tabel-permenit").querySelector("tbody");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Gagal mengambil data! (${err.message})</td></tr>`;
  }
}

// Event listener tombol
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

// Opsional: auto-load hari ini saat halaman dibuka
window.addEventListener("DOMContentLoaded", () => {
  let today = new Date();
  let yyyy = today.getFullYear();
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let dd = String(today.getDate()).padStart(2, '0');
  const picker = document.getElementById("tanggalPicker");
  picker.value = `${yyyy}-${mm}-${dd}`;
  loadPerMenitForTanggal(picker.value);
});
