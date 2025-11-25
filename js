// == KONFIGURASI SESUAI FIREBASE PROYEK AKTIF ==
const firebaseConfig = {
  apiKey: "AIzaSyD-eCZun9Chghk2z0rdPrEuIKkMojrM5g0",
  authDomain: "monitoring-ver-j.firebaseapp.com",
  databaseURL: "https://monitoring-ver-j-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-ver-j",
  storageBucket: "monitoring-ver-j.appspot.com",
  messagingSenderId: "237639687534",
  appId: "1:237639687534:web:4e61c13e6537455c34757f"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
let historiArray = [];

// Ambil data histori, render tabel & grafik
db.ref("/weather/histori").on('value', function(snap) {
  // LOG DIAGNOSA -- ini WAJIB!
  console.log("ISI DARI FIREBASE:", snap.val());
  
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
  // Update box overview & grafik
  if(historiArray.length) {
    updateOverview(historiArray[historiArray.length-1]);
    drawHourlyChart(historiArray);
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
function downloadCSV() {
  let csv = 'Waktu,Angin (km/h),Hujan (mm),Cahaya (lux)\n';
  historiArray.forEach(row => {
    csv += [
      row.waktu??'',
      row.anemometer?.toFixed?.(1)??row.anemometer??'',
      row.rain_gauge?.toFixed?.(2)??row.rain_gauge??'',
      row.sensor_cahaya?.toFixed?.(1)??row.sensor_cahaya??''
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
