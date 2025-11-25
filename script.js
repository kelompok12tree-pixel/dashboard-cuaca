const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  databaseURL: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let historiArray = [];

function updateOverview(data) {
  document.getElementById('wind').textContent  = `Angin\n${data.anemometer?.toFixed(1) ?? '-' } km/h`;
  document.getElementById('rain').textContent  = `Hujan\n${data.rain_gauge?.toFixed(2) ?? '-' } mm`;
  document.getElementById('light').textContent = `Cahaya\n${data.sensor_cahaya?.toFixed(1) ?? '-' } lux`;
  document.getElementById('last-update').textContent = "Data terakhir diperbarui: " + (data.waktu ?? '-');
}

db.ref("/weather/keadaan_sekarang").on('value', snap => {
  const data = snap.val();
  if (data) updateOverview(data);
});

// --- Ambil dan olah histori ---
db.ref("/weather/histori").limitToLast(300).on('value', snap => {
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
    drawDailyChart(historiArray);
    drawWeeklyChart(historiArray);
    drawMonthlyChart(historiArray);
  }
});

// --- Download CSV dari histori ---
function downloadCSV() {
  let csv = 'Waktu,Angin (km/h),Hujan (mm),Cahaya (lux)\n';
  historiArray.forEach(row => {
    csv += [row.waktu, row.anemometer?.toFixed(1)??'', row.rain_gauge?.toFixed(2)??'', row.sensor_cahaya?.toFixed(1)??''].join(',')+'\n';
  });
  const blob = new Blob([csv], {type: 'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'histori.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// --- Grafik per jam ---
function drawHourlyChart(data) {
  const ctx = document.getElementById('hourlyChart').getContext('2d');
  const hourly = data.slice(-24); // ambil data 24 jam terakhir
  const labels = hourly.map(row => row.waktu?.split(' ')[1]);
  const wind = hourly.map(row => row.anemometer);
  if (window.hourlyChart) window.hourlyChart.destroy();
  window.hourlyChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Angin (km/h)', data: wind, borderColor:'#36f8da', tension:0.2 }] },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

// --- Grafik harian (average tiap hari) ---
function drawDailyChart(data) {
  const dailyData = {};
  data.forEach(row => {
    const tgl = row.waktu?.split(' ')[0];
    if (!dailyData[tgl]) dailyData[tgl] = [];
    dailyData[tgl].push(row.anemometer);
  });
  const labels = Object.keys(dailyData);
  const wind = Object.values(dailyData).map(v => avg(v));
  const ctx = document.getElementById('dailyChart').getContext('2d');
  if(window.dailyChart) window.dailyChart.destroy();
  window.dailyChart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: [{ label: 'Angin Harian (km/h)', data: wind, borderColor:'#ffca38', tension:0.2 }] },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

// --- Grafik mingguan (average per minggu) ---
function drawWeeklyChart(data) {
  const weeklyData = {};
  data.forEach(row => {
    const tgl = row.waktu?.split(' ')[0];
    const minggu = tgl?.substring(0,7); // "YYYY-MM"
    if (!weeklyData[minggu]) weeklyData[minggu] = [];
    weeklyData[minggu].push(row.anemometer);
  });
  const labels = Object.keys(weeklyData);
  const wind = Object.values(weeklyData).map(v => avg(v));
  const ctx = document.getElementById('weeklyChart').getContext('2d');
  if(window.weeklyChart) window.weeklyChart.destroy();
  window.weeklyChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Angin Mingguan (km/h)', data: wind, backgroundColor:'#66eabd' }] },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

// --- Grafik bulanan (average per bulan) ---
function drawMonthlyChart(data) {
  const monthlyData = {};
  data.forEach(row => {
    const tgl = row.waktu?.split(' ')[0];
    const bulan = tgl?.substring(0,7);
    if (!monthlyData[bulan]) monthlyData[bulan] = [];
    monthlyData[bulan].push(row.anemometer);
  });
  const labels = Object.keys(monthlyData);
  const wind = Object.values(monthlyData).map(v => avg(v));
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  if(window.monthlyChart) window.monthlyChart.destroy();
  window.monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{ label: 'Angin Bulanan (km/h)', data: wind, backgroundColor:'#1fc762' }] },
    options:{ plugins:{legend:{labels:{color:'#fff'}}}, scales:{x:{ticks:{color:'#fff'}},y:{ticks:{color:'#fff'}}}}
  });
}

function avg(arr) {
  return arr.length === 0 ? 0 : arr.reduce((a,b)=>a+b,0)/arr.length;
}
