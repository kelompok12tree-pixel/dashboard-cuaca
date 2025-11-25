import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
  authDomain: "monitoring-kel-12.firebaseapp.com",
  databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "monitoring-kel-12",
  storageBucket: "monitoring-kel-12.firebasestorage.app",
  messagingSenderId: "224809559356",
  appId: "1:224809559356:web:4ebfdc0c93695d8c39ea39"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
let historiArray = [];

// Ambil histori
onValue(ref(db, '/weather/histori'), (snap) => {
  const data = snap.val();
  historiArray = [];
  const tbody = document.querySelector("#history tbody");
  tbody.innerHTML = '';
  let keys = Object.keys(data || {}).sort();

  keys.forEach(k => {
    const d = data[k];
    historiArray.push(d);
    tbody.innerHTML += `<tr>
      <td>${d.waktu ?? k}</td>
      <td>${d.anemometer?.toFixed(1) ?? d.anemometer ?? ''}</td>
      <td>${d.rain_gauge?.toFixed(2) ?? d.rain_gauge ?? ''}</td>
      <td>${d.sensor_cahaya?.toFixed(1) ?? d.sensor_cahaya ?? ''}</td>
    </tr>`;
  });

  // Data terbaru ke overview
  if (historiArray.length > 0) {
    updateOverview(historiArray[historiArray.length-1]);
    drawHourlyChart(historiArray);
    drawDailyChart(historiArray);
    drawWeeklyChart(historiArray);
    drawMonthlyChart(historiArray);
  }
});

// Overview box
function updateOverview(data) {
  document.getElementById('wind').textContent  = `Angin\n${data.anemometer?.toFixed(1) ?? '-' } km/h`;
  document.getElementById('rain').textContent  = `Hujan\n${data.rain_gauge?.toFixed(2) ?? '-' } mm`;
  document.getElementById('light').textContent = `Cahaya\n${data.sensor_cahaya?.toFixed(1) ?? '-' } lux`;
  document.getElementById('last-update').textContent = "Data terakhir diperbarui: " + (data.waktu ?? '-');
}

// Grafik per jam semua sensor
function drawHourlyChart(data) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const hourly = data.slice(-24);
  const labels = hourly.map(row => row.waktu?.split(' ')[1] ?? '');
  const wind   = hourly.map(row => row.anemometer);
  const rain   = hourly.map(row => row.rain_gauge);
  const light  = hourly.map(row => row.sensor_cahaya);
  if (window.hourlyChart) window.hourlyChart.destroy();
  window.hourlyChart = new Chart(ctx, {
    type: 'line',
    data: { 
      labels, 
      datasets: [
        { label: 'Angin (km/h)',      data: wind,   borderColor:'#36f8da', tension:0.2, yAxisID:'y1'},
        { label: 'Hujan (mm)',        data: rain,   borderColor:'#ffca38', tension:0.2, yAxisID:'y2'},
        { label: 'Cahaya (lux)',      data: light,  borderColor:'#a1ff99', tension:0.2, yAxisID:'y3'}
      ] 
    },
    options:{
      plugins:{legend:{labels:{color:'#fff'}}},
      scales:{
        x:{ticks:{color:'#fff'}},
        y1:{type:'linear', position:'left', title:{display:true,text:'Angin (km/h)'}, ticks:{color:'#36f8da'}, grid:{color:'#36f8da22'}},
        y2:{type:'linear', position:'right', title:{display:true,text:'Hujan (mm)'}, ticks:{color:'#ffca38'}, grid:{drawOnChartArea:false}},
        y3:{type:'linear', title:{display:true,text:'Cahaya (lux)'}, display:false}
      }
    }
  });
}

// Grafik harian rata-rata semua sensor
function drawDailyChart(data) {
  const dailyData = {};
  data.forEach(row => {
    const tgl = row.waktu?.split(' ')[0];
    if (!dailyData[tgl]) dailyData[tgl] = [];
    dailyData[tgl].push(row);
  });
  const labels = Object.keys(dailyData);
  const wind   = Object.values(dailyData).map(v => avg(v.map(x=>x.anemometer)));
  const rain   = Object.values(dailyData).map(v => avg(v.map(x=>x.rain_gauge)));
  const light  = Object.values(dailyData).map(v => avg(v.map(x=>x.sensor_cahaya)));
  const ctx = document.getElementById('dailyChart').getContext('2d');
  if(window.dailyChart) window.dailyChart.destroy();
  window.dailyChart = new Chart(ctx, {
    type: 'line',
    data: { 
      labels, datasets: [
        { label: 'Angin (km/h)', data: wind, borderColor:'#36f8da', tension:0.2 },
        { label: 'Hujan (mm)',   data: rain, borderColor:'#ffca38', tension:0.2 },
        { label: 'Cahaya (lux)', data: light, borderColor:'#a1ff99', tension:0.2 }
      ] 
    },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

// Grafik mingguan (group by minggu, rata-rata semua sensor)
function drawWeeklyChart(data) {
  const weeklyData = {};
  data.forEach(row => {
    const key = row.waktu?.slice(0,7); // "YYYY-MM"
    if (!weeklyData[key]) weeklyData[key] = [];
    weeklyData[key].push(row);
  });
  const labels = Object.keys(weeklyData);
  const wind   = Object.values(weeklyData).map(v => avg(v.map(x=>x.anemometer)));
  const rain   = Object.values(weeklyData).map(v => avg(v.map(x=>x.rain_gauge)));
  const light  = Object.values(weeklyData).map(v => avg(v.map(x=>x.sensor_cahaya)));
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  if(window.weeklyChart) window.weeklyChart.destroy();
  window.weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels, datasets: [
        { label: 'Angin (km/h)', data: wind, backgroundColor:'#36f8da' },
        { label: 'Hujan (mm)',   data: rain, backgroundColor:'#ffca38' },
        { label: 'Cahaya (lux)', data: light, backgroundColor:'#a1ff99' }
      ] 
    },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

// Grafik bulanan (rata-rata semua sensor)
function drawMonthlyChart(data) {
  const monthlyData = {};
  data.forEach(row => {
    const key = row.waktu?.slice(0,7); // "YYYY-MM"
    if (!monthlyData[key]) monthlyData[key] = [];
    monthlyData[key].push(row);
  });
  const labels = Object.keys(monthlyData);
  const wind   = Object.values(monthlyData).map(v => avg(v.map(x=>x.anemometer)));
  const rain   = Object.values(monthlyData).map(v => avg(v.map(x=>x.rain_gauge)));
  const light  = Object.values(monthlyData).map(v => avg(v.map(x=>x.sensor_cahaya)));
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if(window.monthlyChart) window.monthlyChart.destroy();
  window.monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: { 
      labels, datasets: [
        { label: 'Angin (km/h)', data: wind, backgroundColor:'#36f8da' },
        { label: 'Hujan (mm)',   data: rain, backgroundColor:'#ffca38' },
        { label: 'Cahaya (lux)', data: light, backgroundColor:'#a1ff99' }
      ] 
    },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a,b)=>a+b,0)/arr.length;
}

// Download CSV sama dengan yang sebelumnya
function downloadCSV() {
  let csv = 'Waktu,Angin (km/h),Hujan (mm),Cahaya (lux)\n';
  historiArray.forEach(row => {
    csv += [
      row.waktu??'',
      row.anemometer?.toFixed(1)??row.anemometer??'',
      row.rain_gauge?.toFixed(2)??row.rain_gauge??'',
      row.sensor_cahaya?.toFixed(1)??row.sensor_cahaya??''
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
