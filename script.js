import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, onValue, query, orderByKey, limitToLast,
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// --- SETUP FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyD-eCZun9Chghk2z0rdPrEuIKkMojrM5g0",
  authDomain: "monitoring-ver-j.firebaseapp.com",
  databaseURL: "https://monitoring-ver-j-default-rtdb.asia-southeast1.firebasedatabase.app",
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ----------------- KARTU REALTIME -----------------
const cardsDIV = document.getElementById('realtime-cards');
function updateRealtimeCard(d) {
  cardsDIV.innerHTML = `
    <div class="card">
      <b>Angin</b><br/>${d.anemometer?.toFixed(1) ?? '—'} km/h
      <br/><b>Curah Hujan</b><br/>${d.rain_gauge?.toFixed(2) ?? '—'} mm
      <br/><b>Cahaya</b><br/>${d.sensor_cahaya?.toFixed(1) ?? '—'} lx
      <br/><span style="font-size:14px;color:#888">Update: ${d.waktu??'-'}</span>
    </div>
  `;
}
onValue(ref(db, "/weather/keadaan_sekarang"), snap => {
  const data = snap.val() ?? {};
  updateRealtimeCard(data);
});

// ----------------- HISTORI & GRAFIK GARIS -----------------
const tabelBody = document.querySelector('#histori-table tbody');
const ctxChart = document.getElementById('chart-garis').getContext('2d');

const chart = new Chart(ctxChart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      {label:'Angin (km/h)',   data:[], borderColor:'#0077cc', backgroundColor:'#0077cc33', yAxisID: 'y', tension:0.2},
      {label:'Hujan (mm)',     data:[], borderColor:'#229944', backgroundColor:'#22994433', yAxisID: 'y2', tension:0.2},
      {label:'Cahaya (lx)',    data:[], borderColor:'#ffaa00', backgroundColor:'#ffaa0022', yAxisID: 'y', tension:0.2}
    ]
  },
  options: {
    plugins: { legend: {position:'top'}, title: {display:true, text:'Grafik Angin-Hujan-Cahaya (log)'} },
    scales: {
      y:  {type:'linear', display:true, position:'left',  title:{display:true, text:'Angin/Cahaya'}},
      y2: {type:'linear', display:true, position:'right', title:{display:true, text:'Hujan'}, grid:{drawOnChartArea:false}}
    }
  }
});

onValue(query(ref(db, '/weather/histori'), orderByKey(), limitToLast(36)), snap => {
  const arr = [];
  snap.forEach(child => {
    const d = child.val();
    arr.push({
      waktu: d.waktu ?? child.key,
      angin: Number(d.anemometer ?? 0),
      hujan: Number(d.rain_gauge ?? 0),
      cahaya:Number(d.sensor_cahaya ?? 0)
    });
  });
  arr.sort((a,b)=>a.waktu.localeCompare(b.waktu));

  // update tabel
  tabelBody.innerHTML = arr.map(r => `
    <tr>
      <td>${r.waktu}</td>
      <td>${r.angin.toFixed(1)}</td>
      <td>${r.hujan.toFixed(2)}</td>
      <td>${r.cahaya.toFixed(1)}</td>
    </tr>
  `).reverse().join('');

  // update grafik
  chart.data.labels = arr.map(d=>d.waktu.slice(11)); // jam:menit:detik saja
  chart.data.datasets[0].data = arr.map(d=>d.angin);
  chart.data.datasets[1].data = arr.map(d=>d.hujan);
  chart.data.datasets[2].data = arr.map(d=>d.cahaya);
  chart.update();
});
