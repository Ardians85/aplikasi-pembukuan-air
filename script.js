// Array untuk menyimpan data pembayaran
let payments = [];

// Load data dari localStorage saat halaman dibuka
function loadData() {
    const savedData = localStorage.getItem('paymentData');
    if (savedData) {
        payments = JSON.parse(savedData);
    }
    applyFilters();
}

// Save data ke localStorage
function saveData() {
    localStorage.setItem('paymentData', JSON.stringify(payments));
    applyFilters();
}

// Format angka ke Rupiah
function formatRupiah(angka) {
    return 'Rp ' + angka.toLocaleString('id-ID');
}

// Tambah pembayaran baru
document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nama = document.getElementById('nama').value.trim();
    const tanggal = document.getElementById('tanggal').value;
    const nominal = parseFloat(document.getElementById('nominal').value);
    const bulan = document.getElementById('bulan').value;
    const tahun = parseInt(document.getElementById('tahun').value);
    
    if (!nama || !tanggal || !nominal || !bulan || !tahun) {
        alert('Semua field harus diisi!');
        return;
    }
    
    if (nominal <= 0) {
        alert('Nominal harus lebih dari 0!');
        return;
    }
    
    const newPayment = {
        id: Date.now(),
        nama: nama,
        tanggal: tanggal,
        nominal: nominal,
        bulan: bulan,
        tahun: tahun,
        createdAt: new Date().toISOString()
    };
    
    payments.push(newPayment);
    saveData();
    
    // Reset form
    document.getElementById('paymentForm').reset();
    document.getElementById('tahun').value = '2024';
    
    alert('Pembayaran berhasil ditambahkan!');
});

// Filter dan tampilkan data
function applyFilters() {
    const filterBulan = document.getElementById('filterBulan').value;
    const filterTahun = document.getElementById('filterTahun').value;
    const filterNama = document.getElementById('filterNama').value.toLowerCase();
    
    let filteredPayments = [...payments];
    
    // Filter berdasarkan bulan
    if (filterBulan !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.bulan === filterBulan);
    }
    
    // Filter berdasarkan tahun
    if (filterTahun) {
        filteredPayments = filteredPayments.filter(p => p.tahun === parseInt(filterTahun));
    }
    
    // Filter berdasarkan nama
    if (filterNama) {
        filteredPayments = filteredPayments.filter(p => p.nama.toLowerCase().includes(filterNama));
    }
    
    // Urutkan berdasarkan tanggal
    filteredPayments.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    
    displayReport(filteredPayments);
    updateSummary(filteredPayments);
}

// Tampilkan laporan di tabel
function displayReport(filteredPayments) {
    const tableBody = document.getElementById('tableBody');
    
    if (filteredPayments.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Tidak ada data pembayaran</td></tr>';
        return;
    }
    
    let html = '';
    filteredPayments.forEach((payment, index) => {
        html += `
            <tr>
                <td>${index + 1}</td>
                <td><strong>${escapeHtml(payment.nama)}</strong></td>
                <td>${formatTanggal(payment.tanggal)}</td>
                <td>${payment.bulan}</td>
                <td>${payment.tahun}</td>
                <td style="color: #28a745; font-weight: bold;">${formatRupiah(payment.nominal)}</td>
                <td>
                    <button class="action-btn" onclick="editPayment(${payment.id})" style="background: #2196F3;">✏️ Edit</button>
                    <button class="action-btn btn-danger" onclick="deletePayment(${payment.id})">🗑️ Hapus</button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// Update ringkasan kartu
function updateSummary(filteredPayments) {
    const total = filteredPayments.reduce((sum, p) => sum + p.nominal, 0);
    const jumlahTransaksi = filteredPayments.length;
    const uniquePelanggan = new Set(filteredPayments.map(p => p.nama)).size;
    const rataRata = jumlahTransaksi > 0 ? total / jumlahTransaksi : 0;
    
    document.getElementById('totalPembayaran').innerHTML = formatRupiah(total);
    document.getElementById('jumlahTransaksi').innerHTML = jumlahTransaksi;
    document.getElementById('totalPelanggan').innerHTML = uniquePelanggan;
    document.getElementById('rataRata').innerHTML = formatRupiah(rataRata);
}

// Format tanggal
function formatTanggal(tanggal) {
    const date = new Date(tanggal);
    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Hapus pembayaran
function deletePayment(id) {
    if (confirm('Apakah Anda yakin ingin menghapus pembayaran ini?')) {
        payments = payments.filter(p => p.id !== id);
        saveData();
        alert('Pembayaran berhasil dihapus!');
    }
}

// Edit pembayaran
function editPayment(id) {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;
    
    const newNama = prompt('Edit Nama:', payment.nama);
    const newTanggal = prompt('Edit Tanggal (YYYY-MM-DD):', payment.tanggal);
    const newNominal = parseFloat(prompt('Edit Nominal:', payment.nominal));
    const newBulan = prompt('Edit Bulan:', payment.bulan);
    const newTahun = parseInt(prompt('Edit Tahun:', payment.tahun));
    
    if (newNama && newTanggal && newNominal && newBulan && newTahun) {
        payment.nama = newNama;
        payment.tanggal = newTanggal;
        payment.nominal = newNominal;
        payment.bulan = newBulan;
        payment.tahun = newTahun;
        saveData();
        alert('Data berhasil diupdate!');
    }
}

// Reset semua data
function resetAllData() {
    if (confirm('PERINGATAN! Ini akan menghapus SEMUA data pembayaran. Lanjutkan?')) {
        payments = [];
        saveData();
        alert('Semua data telah direset!');
    }
}

// Cetak laporan
function printReport() {
    window.print();
}

// Export ke CSV
function exportToCSV() {
    const filterBulan = document.getElementById('filterBulan').value;
    const filterTahun = document.getElementById('filterTahun').value;
    
    let filteredPayments = [...payments];
    
    if (filterBulan !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.bulan === filterBulan);
    }
    if (filterTahun) {
        filteredPayments = filteredPayments.filter(p => p.tahun === parseInt(filterTahun));
    }
    
    if (filteredPayments.length === 0) {
        alert('Tidak ada data untuk diexport!');
        return;
    }
    
    // Header CSV
    let csv = 'No,Nama Pelanggan,Tanggal,Bulan,Tahun,Nominal\n';
    
    // Data CSV
    filteredPayments.forEach((payment, index) => {
        csv += `${index + 1},${payment.nama},${payment.tanggal},${payment.bulan},${payment.tahun},${payment.nominal}\n`;
    });
    
    // Download file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `laporan_pembayaran_air_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert('Laporan berhasil diexport!');
}

// Escape HTML untuk keamanan
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event listener untuk filter
document.getElementById('filterBulan').addEventListener('change', applyFilters);
document.getElementById('filterTahun').addEventListener('input', applyFilters);
document.getElementById('filterNama').addEventListener('input', applyFilters);

// Load data saat halaman dibuka
loadData();