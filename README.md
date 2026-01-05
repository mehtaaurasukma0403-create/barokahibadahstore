# Barokah Ibadah Store (Uts_web1)

Aplikasi web sederhana untuk **Penjualan Barang** (alat ibadah Islam) menggunakan:
- HTML + elemen semantik (`header`, `nav`, `main`, `footer`)
- Bootstrap 5 (CDN)
- JavaScript untuk validasi & penyimpanan transaksi (localStorage)

## Struktur File
- `index.html` : Beranda
- `login.html` : Login (simulasi)
- `transaksi.html` : Form input transaksi
- `daftar_transaksi.html` : Tabel daftar transaksi
- `profil.html` : Profil aplikasi & identitas pembuat
- `js/app.js` : Validasi & logika transaksi
- `assets/` : Logo, banner, dan gambar produk (SVG)

## Cara Menjalankan
1. Pastikan semua file ada dalam satu folder yang sama: `Uts_web1`
2. Buka `index.html` menggunakan browser (Chrome/Edge/Firefox)
3. Coba input transaksi di menu **Transaksi** → klik **Simpan Transaksi**
4. Buka **Daftar Transaksi** untuk melihat data yang tersimpan

## Catatan
Data transaksi disimpan di **browser** (localStorage). Jika ingin menghapus:
- Klik tombol **Hapus** pada baris transaksi, atau
- Klik **Hapus Semua** di halaman daftar transaksi.
