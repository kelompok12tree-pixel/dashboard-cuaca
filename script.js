import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, onValue, query, orderByKey, limitToLast
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-eCZun9Chghk2z0rdPrEuIKkMojrM5g0",
  authDomain: "monitoring-ver-j.firebaseapp.com",
  databaseURL: "https://monitoring-ver-j-default-rtdb.asia-southeast1.firebasedatabase.app"
};
const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// -- KARTU RINGKASAN / PANEL UTAMA (Realtime) --
function updateSummaryCard(id, value) {
  document.getElementById(id).textContent = value != null ? Number(value).toFixed(2) : "—";
}
onValue(ref(db, "/weather/keadaan_sekarang"), (snap) => {
  const d = snap.val() ?? {};
  updateSummaryCard("val-angin", d.anemometer);
  updateSummaryCard("val-hujan", d.rain_gauge);
  updateSummaryCard("val-cahaya", d.sensor_cahaya);
});

// -- HISTORI & GRAFIK --
const tblBody = document.getElementById('histori-body');
const ctxChart = document.getElementById('grafik-sensor').getContext('2d');
const chart = new Chart(ctxChart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'Angin (km/h)', data: [], borderColor: '#31c7ff', backgroundColor: 'rgba(49,199,255,0.13)', yAxisID: 'y', tension:0.2 },
      { label: 'Hujan (mm)',   data: [], borderColor: '#44e691', backgroundColor: 'rgba(68,230,145,0.13)', yAxisID: 'y2', tension:0.18 },
      { label: 'Cahaya (lx)',  data: [], borderColor: '#ffe066', backgroundColor: 'rgba(255,224,102,0.13)', yAxisID: 'y', tension:0.15 }
    ]
  },
  options: {
    responsive: true,
    plugins: { legend: {labels:{color:'#eafcff'}}, title: {display: false}},
    scales: {
      x: { ticks: {color:'#aee3ff'} },
      y:  {type:'linear', display:true, position:'left',  title:{display:true, text:'Angin/Cahaya',color:'#aee3ff'}, ticks:{color:'#aee3ff'} },
      y2: {type:'linear', display:true, position:'right', title:{display:true, text:'Hujan',color:'#44e691'}, grid:{drawOnChartArea:false}, ticks:{color:'#44e691'}}
    }
  }
});

let historiLastArr = [];
onValue(query(ref(db, '/weather/histori'), orderByKey(), limitToLast(100)), snap => {
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
  arr.sort((a,b)=>a.waktu.localeCompare(b.waktu)).reverse();
  // isi tabel
  tblBody.innerHTML = arr.map(r => `
    <tr>
      <td>${r.waktu}</td>
      <td class="value-angin">${r.angin.toFixed(2)}</td>
      <td class="value-hujan">${r.hujan.toFixed(2)}</td>
      <td class="value-cahaya">${r.cahaya.toFixed(2)}</td>
    </tr>
  `).join('');
  // update grafik
  const arrR = [...arr].reverse();
  chart.data.labels = arrR.map(d=>d.waktu.slice(11));
  chart.data.datasets[0].data = arrR.map(d=>d.angin);
  chart.data.datasets[1].data = arrR.map(d=>d.hujan);
  chart.data.datasets[2].data = arrR.map(d=>d.cahaya);
  chart.update();
  historiLastArr = arr;
});

// ---- DOWNLOAD CSV ----
document.getElementById('downloadCsvBtn').onclick = function(){
  let csv = "Waktu,Angin (km/h),Hujan (mm),Cahaya (lx)\n";
  historiLastArr.forEach(r => {
    csv += `${r.waktu},${r.angin.toFixed(2)},${r.hujan.toFixed(2)},${r.cahaya.toFixed(2)}\n`;
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = "data-cuaca.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
