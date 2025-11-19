import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAD1QPvINjWitgo_Rrj44s47Pr4S1BU_lM",
  authDomain: "monitoring-kualitas-udar-8ad9d.firebaseapp.com",
  databaseURL: "https://monitoring-kualitas-udar-8ad9d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kualitas-udar-8ad9d",
  storageBucket: "monitoring-kualitas-udar-8ad9d.appspot.com"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const iaqRef = ref(db, "/IAQ");

onValue(iaqRef, (snapshot) => {
  const data = snapshot.val();
  if (!data) return;
  document.getElementById("temp").textContent = data.suhu?.toFixed(1) + " °C";
  document.getElementById("hum").textContent = data.kelembaban?.toFixed(1) + " %";
  document.getElementById("partikel").textContent = (data.Partikel * 1000)?.toFixed(2) + " mg/m³";
  document.getElementById("co2").textContent = data["MQ-135"]?.toFixed(0) + " ppm";
  document.getElementById("status").textContent = data.status || "--";
  document.getElementById("time").textContent = data.waktu || "--";
});