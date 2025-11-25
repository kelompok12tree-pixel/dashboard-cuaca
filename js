const firebaseConfig = { /* config sesuai projectmu */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let fullLog = [];
let jamLabel=[], jamAngin=[], jamHujan=[], jamCahaya=[];
let hariLabel=[], hariAngin=[], hariHujan=[], hariCahaya=[];
let bulanLabel=[], bulanAngin=[], bulanHujan=[], bulanCahaya=[];
let chartHour, chartDay, chartMonth;

// Ambil histori (struktur: /weather/histori/key: {anemometer, rain_gauge, sensor_cahaya, waktu})
db.ref("/weather/histori").on('value', snap => {
  const data = snap.val() || {};
  fullLog = [];
  const keys = Object.keys(data).sort(); // Urutkan kronologis
  keys.forEach(function(k){
    const d = data[k];
    fullLog.push(d); // simpan untuk rekap tabel

    // Data summary terakhir, update box
    if(k === keys[keys.length-1]){
      document.getElementById('wind-val').textContent  = (d.anemometer ?? 0).toFixed(2);
      document.getElementById('rain-val').textContent  = (d.rain_gauge ?? 0).toFixed(2);
      document.getElementById('light-val').textContent = (d.sensor_cahaya ?? 0).toFixed(0);
      document.getElementById('last-update').textContent = "Data terakhir diperbarui: " + (d.waktu ?? k);

      // Kualitas status contoh sederhana
      let status = "CUACA BAIK";
      if((d.anemometer ?? 0) > 20) status = "ANGIN KENCANG";
      else if((d.rain_gauge ?? 0) > 10) status = "HUJAN DERAS";
      document.getElementById('cuaca-status').textContent = status;
    }
  });

  // Grafik per jam (24 jam terakhir)
  jamLabel  = fullLog.slice(-24).map(e=>e.waktu?.split(' ')[1] ?? '');
  jamAngin  = fullLog.slice(-24).map(e=>e.anemometer ?? 0);
  jamHujan  = fullLog.slice(-24).map(e=>e.rain_gauge ?? 0);
  jamCahaya = fullLog.slice(-24).map(e=>e.sensor_cahaya ?? 0);

  // Grafik harian, bulanan dsb. bisa digrouping berdasarkan hari/bulan
  // (contoh: groupBy log lewat fungsi JS, di sini bisa pakai slice/aggregate manual)

  drawChart();
  fillTable();
});

function drawChart(){
  if(chartHour) chartHour.destroy();
  chartHour = new Chart(document.getElementById('chart-hour').getContext('2d'), {
    type:'line',
    data:{ labels:jamLabel,
      datasets:[
        {label:'Angin',data:jamAngin,borderColor:'#36f8da',yAxisID:'y1'},
        {label:'Hujan',data:jamHujan,borderColor:'#fade62',yAxisID:'y1'},
        {label:'Cahaya',data:jamCahaya,borderColor:'#a1ff99',yAxisID:'y2'}
      ]
    },
    options:{
      plugins:{legend:{labels:{color:'#fff'}}},
      scales:{
        x:{ticks:{color:'#fff'}},
        y1:{position:'left',min:0,ticks:{color:'#36f8da'}},
        y2:{position:'right',min:0,ticks:{color:'#a1ff99'},grid:{drawOnChartArea:false}}
      }
    }
  });
  // Grafik harian dan bulanan bisa dibuat mirip, atau group/aggregate harian/bulan
}

function fillTable(){
  const tbody=document.querySelector("#data-table tbody");
  tbody.innerHTML='';
  fullLog.slice(-60).reverse().forEach(row=>{
    tbody.innerHTML += `<tr>
      <td>${row.waktu??''}</td>
      <td>${row.anemometer?.toFixed?.(2)??row.anemometer??''}</td>
      <td>${row.rain_gauge?.toFixed?.(2)??row.rain_gauge??''}</td>
      <td>${row.sensor_cahaya?.toFixed?.(1)??row.sensor_cahaya??''}</td>
      <td>${row.status??'OK'}</td>
    </tr>`;
  });
}
function downloadCSV() {
  let csv = 'Waktu,Angin (m/s),Hujan (mm),Cahaya (lux),Status\n';
  fullLog.forEach(r=>{
    csv += [
      r.waktu??'',r.anemometer??'',r.rain_gauge??'',r.sensor_cahaya??'',r.status??'OK'
    ].join(',')+'\n';
  });
  const blob=new Blob([csv],{type:'text/csv'});
  const url=window.URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='rekap.csv';a.click();window.URL.revokeObjectURL(url);
}
