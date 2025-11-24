<!-- Firebase SDK -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>
<script>
  // Konfigurasi Firebase sesuai projectmu!
  var firebaseConfig = {
    apiKey: "AIzaSyCcTrvQyf5g2AAmHOLuXQeBbeR4hjGxYSw",
    databaseURL: "https://monitoring-kel-12-default-rtdb.asia-southeast1.firebasedatabase.app/"
  };
  firebase.initializeApp(firebaseConfig);
  var db = firebase.database();

  // Fungsi muat data per-menit
  function loadData() {
    var tgl = document.getElementById('tanggalPicker').value;
    var tbody = document.getElementById("tabelData").querySelector("tbody");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Memuat data...</td></tr>`;
    if (!tgl) {
      tbody.innerHTML = `<tr><td colspan="5" class="text-center">Tanggal belum dipilih.</td></tr>`;
      return;
    }
    var path = '/C_PerMenit/' + tgl;
    db.ref(path).once("value", function(snapshot) {
      tbody.innerHTML = "";
      if (!snapshot.exists()) {
        var row = tbody.insertRow();
        row.innerHTML = `<td colspan="5" class="text-center">Tidak ada data untuk tanggal ini.</td>`;
      } else {
        snapshot.forEach(function(childSnap) {
          var key = childSnap.key; // jam-menit
          var val = childSnap.val();
          var row = tbody.insertRow();
          row.insertCell(0).textContent = key;
          row.insertCell(1).textContent = Number(val.angin_rata2 ?? 0).toFixed(2);
          row.insertCell(2).textContent = Number(val.hujan_total_mm ?? 0).toFixed(2);
          row.insertCell(3).textContent = Number(val.cahaya_rata2 ?? 0).toFixed(2);
          row.insertCell(4).textContent = val.count ?? "-";
        });
      }
    });
  }
</script>
