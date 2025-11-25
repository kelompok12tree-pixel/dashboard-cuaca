const firebaseConfig = {
  apiKey: "AIzaSyD-eCZun9Chghk2z0rdPrEuIKkMojrM5g0",
  authDomain: "monitoring-ver-j.firebaseapp.com",
  databaseURL: "https://monitoring-ver-j-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-ver-j",
  storageBucket: "monitoring-ver-j.firebasestorage.app",
  messagingSenderId: "237639687534",
  appId: "1:237639687534:web:4e61c13e6537455c34757f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let historiArray = [];

function updateOverview(data) {
  document.getElementById('wind').textContent  = `Angin: ${data.anemometer?.toFixed(1) ?? '-'} km/h`;
  document.getElementById('rain').textContent  = `Hujan: ${data.rain_gauge?.toFixed(2) ?? '-'} mm`;
  document.getElementById('light').textContent = `Cahaya: ${data.sensor_cahaya?.toFixed(1) ?? '-'} lux`;
  document.getElementById('waktu').textContent = `Waktu: ${data.waktu ?? '-'}`;
}

db.ref("/weather/keadaan_sekarang").on('value', snap => {
  const data = snap.val();
  if (data) updateOverview(data);
});

db.ref("/weather/histori").limitToLast(60).on('value', snap => {
  const data = snap.val();
  historiArray = [];
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = '';
  if (data) {
    Object.values(data).forEach(d => {
      historiArray.push(d);
      tbody.innerHTML += `<tr>
        <td>${d.waktu}</td>
        <td>${d.anemometer?.toFixed(1) ?? ''}</td>
        <td>${d.rain_gauge?.toFixed(2) ?? ''}</td>
        <td>${d.sensor_cahaya?.toFixed(1) ?? ''}</td>
      </tr>`;
    });
    drawHourlyChart(historiArray);
  }
});

function downloadCSV() {
  let csv = 'Waktu,Angin (km/h),Hujan (mm),Cahaya (lux)\n';
  historiArray.forEach(row => {
    csv += [
      row.waktu,
      row.anemometer?.toFixed(1)??'',
      row.rain_gauge?.toFixed(2)??'',
      row.sensor_cahaya?.toFixed(1)??''
    ].join(',')+'\n';
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'histori.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// Chart.js grafik angin per jam
function drawHourlyChart(data) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const labels = data.map(row => row.waktu?.split(' ')[1]);
  const wind = data.map(row => row.anemometer);
  if (window.hourlyChart) window.hourlyChart.destroy();
  window.hourlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels, datasets: [{
        label: 'Angin (km/h)', data: wind, borderColor:'#36f8da', tension:0.2
      }]
    },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}
