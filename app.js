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

let waktuLabels = [], anginArr = [], hujanArr = [], cahayaArr = [], chart;
db.ref('/weather/keadaan_sekarang').on('value', snap => {
  const data = snap.val();

  document.getElementById('wind').textContent  = (data?.anemometer ?? 0).toFixed(2);
  document.getElementById('rain').textContent  = (data?.rain_gauge ?? 0).toFixed(2);
  document.getElementById('light').textContent = (data?.sensor_cahaya ?? 0).toFixed(1);

  const now = new Date();
  document.getElementById('waktu-update').textContent = "Waktu: " + (data?.waktu ?? now.toLocaleTimeString());
  document.getElementById('last-update').textContent  = "Data terakhir diperbarui: " + now.toLocaleDateString() + " " + now.toLocaleTimeString();

  waktuLabels.push(data?.waktu ?? now.toLocaleTimeString());
  anginArr.push(parseFloat(data?.anemometer ?? 0));
  hujanArr.push(parseFloat(data?.rain_gauge ?? 0));
  cahayaArr.push(parseFloat(data?.sensor_cahaya ?? 0));
  if (waktuLabels.length > 30) { waktuLabels.shift(); anginArr.shift(); hujanArr.shift(); cahayaArr.shift(); }
  updateChart();
});

function updateChart() {
  const ctx = document.getElementById('realtimeChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type:'line',
    data:{ labels:waktuLabels,
      datasets:[
        {label:'Angin',data:anginArr,borderColor:'#36f8da',yAxisID:'y1',tension:0.2},
        {label:'Hujan',data:hujanArr,borderColor:'#fade62',yAxisID:'y1',tension:0.2},
        {label:'Cahaya',data:cahayaArr,borderColor:'#a1ff99',yAxisID:'y2',tension:0.18}
      ]
    },
    options:{
      plugins:{legend:{labels:{color:'#fff'}}},
      scales:{
        x:{ticks:{color:'#a1ff99'}},
        y1:{position:'left',min:0,ticks:{color:'#36f8da'}},
        y2:{position:'right',min:0,ticks:{color:'#a1ff99'},grid:{drawOnChartArea:false}}
      }
    }
  });
}
