// PASTE INI untuk versi langsung index.html tanpa import/export/module/npm
const firebaseConfig = {
  apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
  authDomain: "monitoring-kel-12.firebaseapp.com",
  databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kel-12",
  storageBucket: "monitoring-kel-12.firebasestorage.app",
  messagingSenderId: "224809559356",
  appId: "1:224809559356:web:4ebfdc0c93695d8c39ea39"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let historiArray = [];

db.ref("/weather/histori").on('value', function(snap) {
  const data = snap.val();
  historiArray = [];
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = '';
  if(!data) return;
  const keys = Object.keys(data).sort();
  keys.forEach(function(k){
    const d = data[k];
    historiArray.push(d);
    tbody.innerHTML += `<tr>
      <td>${d.waktu ?? k}</td>
      <td>${d.anemometer?.toFixed?.(1) ?? d.anemometer ?? ''}</td>
      <td>${d.rain_gauge?.toFixed?.(2) ?? d.rain_gauge ?? ''}</td>
      <td>${d.sensor_cahaya?.toFixed?.(1) ?? d.sensor_cahaya ?? ''}</td>
    </tr>`;
  });
  // Update overview & grafik
  if(historiArray.length) {
    updateOverview(historiArray[historiArray.length-1]);
    drawHourlyChart(historiArray);
    // ...Tambahkan grafik lain jika mau
  }
});

function updateOverview(data) {
  document.getElementById('wind').textContent  = `Angin\n${data.anemometer?.toFixed?.(1) ?? '-' } km/h`;
  document.getElementById('rain').textContent  = `Hujan\n${data.rain_gauge?.toFixed?.(2) ?? '-' } mm`;
  document.getElementById('light').textContent = `Cahaya\n${data.sensor_cahaya?.toFixed?.(1) ?? '-' } lux`;
  document.getElementById('last-update').textContent = "Data terakhir diperbarui: " + (data.waktu ?? '-');
}

function drawHourlyChart(data) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const hourly = data.slice(-24);
  const labels = hourly.map(row => row.waktu?.split(' ')[1] ?? '');
  const wind   = hourly.map(row => row.anemometer);
  const rain   = hourly.map(row => row.rain_gauge);
  const light  = hourly.map(row => row.sensor_cahaya);
  if(window.hourlyChart) window.hourlyChart.destroy();
  window.hourlyChart = new Chart(ctx, {
    type: 'line',
    data: { 
      labels, 
      datasets: [
        { label:'Angin', data:wind, borderColor:'#36f8da', tension:0.2 },
        { label:'Hujan', data:rain, borderColor:'#ffca38', tension:0.2 },
        { label:'Cahaya', data:light, borderColor:'#a1ff99', tension:0.2 }
      ] 
    },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}
