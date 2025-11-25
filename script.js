import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getDatabase, ref, onValue, query, orderByKey, limitToLast
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyD-eCZun9Chghk2z0rdPrEuIKkMojrM5g0",
  authDomain: "monitoring-ver-j.firebaseapp.com",
  databaseURL: "https://monitoring-ver-j-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

function setGauge(id, val) {
  document.getElementById(id).textContent = (val != null ? Number(val).toFixed(2) : "-");
}
onValue(ref(db, "/weather/keadaan_sekarang"), snap => {
  const d = snap.val() ?? {};
  setGauge("gauge-angin", d.anemometer);
  setGauge("gauge-hujan", d.rain_gauge);
  setGauge("gauge-cahaya", d.sensor_cahaya);
});

// -------- HISTORI + GRAFIK --------
const tabelBody = document.querySelector('#histori-table tbody');
const ctxChart = document.getElementById('grafik-garis').getContext('2d');
const chart = new Chart(ctxChart, {
  type: 'line',
  data: {
    labels: [],
    datasets: [
      { label: 'Angin (km/h)', data: [], borderColor: '#31c7ff', backgroundColor: 'rgba(49,199,255,0.25)', yAxisID: 'y', tension:0.25 },
      { label: 'Hujan (mm)',   data: [], borderColor: '#44e691', backgroundColor: 'rgba(68,230,145,0.18)', yAxisID: 'y2', tension:0.2 },
      { label: 'Cahaya (lx)',  data: [], borderColor: '#ffe066', backgroundColor: 'rgba(255,224,102,0.17)', yAxisID: 'y', tension:0.18 }
    ]
  },
  options: {
    plugins: { legend: {labels:{color:'#fff'}}, title: {display:false}},
    scales: {
      x: { ticks: {color:'#fff'} },
      y:  {type:'linear', display:true, position:'left',  title:{display:true, text:'Angin/Cahaya',color:'#fff'}, ticks:{color:'#79bbff'} },
      y2: {type:'linear', display:true, position:'right', title:{display:true, text:'Hujan',color:'#49ffa1'}, grid:{drawOnChartArea:false}, ticks:{color:'#63ffaa'} }
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
  tabelBody.innerHTML = arr.map(r => `
    <tr>
      <td>${r.waktu}</td>
      <td class="value-angin">${r.angin.toFixed(1)}</td>
      <td class="value-hujan">${r.hujan.toFixed(2)}</td>
      <td class="value-cahaya">${r.cahaya.toFixed(1)}</td>
    </tr>
  `).reverse().join('');

  chart.data.labels = arr.map(d=>d.waktu.slice(11));
  chart.data.datasets[0].data = arr.map(d=>d.angin);
  chart.data.datasets[1].data = arr.map(d=>d.hujan);
  chart.data.datasets[2].data = arr.map(d=>d.cahaya);
  chart.update();
});
