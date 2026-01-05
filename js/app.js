/* Barokah Ibadah Store - App Script
   - Validasi form (Bootstrap validation)
   - Simpan transaksi ke localStorage
   - Render tabel daftar transaksi
*/
(function () {
  "use strict";

  const STORAGE_KEY = "barokahIbadah.transaksi";
  const USER_KEY = "barokahIbadah.user";

  // =========================
  // 0) Guard: wajib login dulu
  // =========================
  function currentPage() {
    const p = (window.location.pathname || "").split("/").pop();
    return p && p.length ? p : "index.html";
  }

  function isAllowedNextPage(page) {
    // batasi redirect hanya ke halaman internal yang kita punya
    const allowed = ["index.html", "transaksi.html", "daftar_transaksi.html", "profil.html", "login.html"];
    return allowed.includes(page);
  }

  const page = currentPage();
  const isLoginPage = page === "login.html";
  const isLoggedIn = !!sessionStorage.getItem(USER_KEY);

  // Jika user membuka halaman selain login tanpa session login, paksa kembali ke login.
  if (!isLoginPage && !isLoggedIn) {
    const next = encodeURIComponent(page);
    window.location.replace(`login.html?next=${next}`);
    return; // hentikan eksekusi script di halaman yang tidak boleh diakses
  }

  function toRupiah(number) {
    const n = Number(number) || 0;
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
  }

  function loadTransaksi() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const data = raw ? JSON.parse(raw) : [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      return [];
    }
  }

  function saveTransaksi(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function showAlert(containerId, type, message) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = `
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>`;
  }

  // =========================
  // 1) Bootstrap validation
  // =========================
  const forms = document.querySelectorAll(".needs-validation");
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }
        form.classList.add("was-validated");
      },
      false
    );
  });

  // =========================
  // 2) Login form (simulasi)
  // =========================
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      if (!loginForm.checkValidity()) return; // ditangani oleh handler validasi di atas
      event.preventDefault();

      const username = (document.getElementById("username")?.value || "").trim();
      // Simulasi: selalu "berhasil"
      sessionStorage.setItem(USER_KEY, username || "user");

      // Jika ada parameter next, arahkan ke halaman tersebut (jika aman)
      const params = new URLSearchParams(window.location.search);
      const nextPage = (params.get("next") || "index.html").trim();
      const target = isAllowedNextPage(nextPage) ? nextPage : "index.html";
      window.location.href = target;
    });
  }

  // =========================
  // 3) Transaksi form
  // =========================
  const transaksiForm = document.getElementById("transaksiForm");
  if (transaksiForm) {
    // Set tanggal default hari ini (jika kosong)
    const tanggalEl = document.getElementById("tanggal");
    if (tanggalEl && !tanggalEl.value) {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      tanggalEl.value = `${yyyy}-${mm}-${dd}`;
    }

    transaksiForm.addEventListener("submit", function (event) {
      if (!transaksiForm.checkValidity()) return; // submit akan ditolak oleh handler validasi global
      event.preventDefault();

      const namaBarang = (document.getElementById("namaBarang")?.value || "").trim();
      const kategori = document.getElementById("kategori")?.value || "";
      const deskripsi = (document.getElementById("deskripsi")?.value || "").trim();
      const jumlah = Number(document.getElementById("jumlah")?.value || 0);
      const tanggal = document.getElementById("tanggal")?.value || "";
      const harga = Number(document.getElementById("harga")?.value || 0);

      // Validasi tambahan (di luar HTML5)
      if (jumlah < 1 || harga < 0) {
        showAlert("formAlert", "danger", "<b>Gagal:</b> Jumlah minimal 1 dan harga tidak boleh negatif.");
        return;
      }

      const transaksi = {
        id: Date.now(),
        namaBarang,
        deskripsi,
        jumlah,
        kategori,
        tanggal,
        harga,
        total: jumlah * harga,
      };

      const list = loadTransaksi();
      list.push(transaksi);
      saveTransaksi(list);

      showAlert(
        "formAlert",
        "success",
        `<b>Berhasil!</b> Transaksi tersimpan. <a href="daftar_transaksi.html" class="alert-link">Klik di sini</a> untuk melihat daftar transaksi.`
      );

      transaksiForm.reset();
      transaksiForm.classList.remove("was-validated");

      // set tanggal default lagi setelah reset
      if (tanggalEl) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        tanggalEl.value = `${yyyy}-${mm}-${dd}`;
      }
    });
  }

  // =========================
  // 4) Daftar transaksi table
  // =========================
  const tbody = document.getElementById("transaksiTableBody");
  if (tbody) {
    const emptyState = document.getElementById("emptyState");
    const countEl = document.getElementById("countTransaksi");
    const grandTotalEl = document.getElementById("grandTotal");
    const btnClearAll = document.getElementById("btnClearAll");

    function render() {
      const list = loadTransaksi();

      tbody.innerHTML = "";
      let sum = 0;

      if (list.length === 0) {
        emptyState?.classList.remove("d-none");
      } else {
        emptyState?.classList.add("d-none");
      }

      list.forEach((t, idx) => {
        sum += Number(t.total) || 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${idx + 1}</td>
          <td>
            <div class="fw-semibold">${escapeHtml(t.namaBarang || "-")}</div>
            <div class="small text-body-secondary">${escapeHtml(t.deskripsi || "-")}</div>
          </td>
          <td>${Number(t.jumlah) || 0}</td>
          <td><span class="badge text-bg-light border">${escapeHtml(t.kategori || "-")}</span></td>
          <td>${escapeHtml(t.tanggal || "-")}</td>
          <td class="text-end">${toRupiah(t.harga)}</td>
          <td class="text-end fw-semibold">${toRupiah(t.total)}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${t.id}">Hapus</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if (countEl) countEl.textContent = String(list.length);
      if (grandTotalEl) grandTotalEl.textContent = toRupiah(sum);
    }

    // Escape HTML untuk mencegah input menjadi markup
    function escapeHtml(str) {
      return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
    }

    // Event delete (delegation)
    tbody.addEventListener("click", function (e) {
      const btn = e.target?.closest("button[data-action='delete']");
      if (!btn) return;

      const id = Number(btn.getAttribute("data-id"));
      const list = loadTransaksi().filter((t) => Number(t.id) !== id);
      saveTransaksi(list);
      render();
    });

    // Clear all
    btnClearAll?.addEventListener("click", function () {
      const ok = confirm("Yakin ingin menghapus semua transaksi?");
      if (!ok) return;
      saveTransaksi([]);
      render();
    });

    render();
  }

   // =========================
   // 5) Logout
   // =========================
   window.logout = function () {
     const ok = confirm("Apakah Anda yakin ingin logout?");
      if (!ok) return;

   sessionStorage.removeItem("barokahIbadah.user");
   window.location.href = "login.html";
   };
})();
