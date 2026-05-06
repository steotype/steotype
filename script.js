/* Logic and Data Fetching for SteoType (CART SYSTEM FIXED + NO BLINKING) */

const SPREADSHEET_URL = "/api/stok";
let allData = [];
let currentTab = 'ready';

// --- SISTEM KERANJANG BELANJA ---
let cart = [];

const parseNum = (str) => parseInt((str||'').toString().replace(/[^0-9]/g, '')) || 0;

function formatHarga(num) {
  return num + "K";
}

function toggleCart(kode, username, harga) {
  const index = cart.findIndex(item => item.username === username);
  if (index > -1) {
    cart.splice(index, 1);
  } else {
    cart.push({kode, username, harga});
  }
  updateCartUI();
  
  // PERBAIKAN: Jangan memanggil renderProducts() lagi agar tidak berkedip.
  // Gunakan fungsi sinkronisasi khusus di bawah ini:
  syncCartUI(); 
}

// FUNGSI BARU: Mengubah warna tombol tanpa me-refresh seluruh grid produk
function syncCartUI() {
  document.querySelectorAll('.product-card').forEach(card => {
    const username = card.dataset.username;
    const inCart = cart.some(c => c.username === username);
    const btn = card.querySelector('.btn-add-cart');
    
    if (inCart) {
      // Ubah gaya kartu menjadi aktif (biru)
      card.classList.add('border-blue-500', 'shadow-blue-900/20', 'shadow-lg');
      card.classList.remove('border-gray-700');
      // Ubah gaya tombol menjadi "Ditambahkan"
      if(btn) {
        btn.className = "btn-add-cart px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 outline-none";
        btn.innerText = "Ditambahkan";
      }
    } else {
      // Kembalikan gaya kartu ke mode normal (abu-abu)
      card.classList.remove('border-blue-500', 'shadow-blue-900/20', 'shadow-lg');
      card.classList.add('border-gray-700');
      // Kembalikan gaya tombol menjadi "Tambah"
      if(btn) {
        btn.className = "btn-add-cart px-5 py-2.5 bg-gray-800 border border-gray-600 text-blue-400 text-sm font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 hover:text-white transition shadow-sm outline-none";
        btn.innerText = "Tambah";
      }
    }
  });
}

function updateCartUI() {
  const badge = document.getElementById('cartBadge');
  const floatingCart = document.getElementById('floatingCart');
  if (cart.length > 0) {
    floatingCart.classList.remove('hidden');
    badge.innerText = cart.length;
  } else {
    floatingCart.classList.add('hidden');
    closeCartModal(); 
  }
}

function openCartModal() {
  const cartList = document.getElementById('cartItemsList');
  cartList.innerHTML = '';
  let totalHarga = 0;
  
  cart.forEach((item) => {
    totalHarga += parseNum(item.harga);
    cartList.innerHTML += `
      <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
        <div>
          <p class="text-sm font-bold text-gray-200">${item.kode}</p>
          <p class="text-xs text-gray-400 font-mono">${item.username}</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-sm font-bold text-blue-400">${item.harga}</p>
          <button onclick="toggleCart('${item.kode}', '${item.username}', '${item.harga}'); openCartModal();" class="text-gray-500 hover:text-red-400 transition bg-gray-800 p-1.5 rounded-md outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    `;
  });
  
  document.getElementById('cartTotal').innerText = formatHarga(totalHarga);
  
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const content = document.getElementById('cartModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { 
    backdrop.classList.remove('opacity-0'); 
    backdrop.classList.add('opacity-100'); 
    content.classList.remove('opacity-0', 'scale-95'); 
    content.classList.add('opacity-100', 'scale-100'); 
  }, 10);
}

function closeCartModal() {
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const content = document.getElementById('cartModalContent');
  backdrop.classList.remove('opacity-100'); 
  backdrop.classList.add('opacity-0'); 
  content.classList.remove('opacity-100', 'scale-100'); 
  content.classList.add('opacity-0', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function proceedToCheckout() {
  closeCartModal();
  const modal = document.getElementById('buyModal');
  const backdrop = document.getElementById('buyModalBackdrop');
  const content = document.getElementById('buyModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { 
    backdrop.classList.remove('opacity-0'); 
    backdrop.classList.add('opacity-100'); 
    content.classList.remove('opacity-0', 'scale-95'); 
    content.classList.add('opacity-100', 'scale-100'); 
  }, 10);
  
  document.getElementById('btn-confirm-buy').onclick = function() {
    let message = `Halo, saya mau order ${cart.length} akun:\n\n`;
    let sumHarga = 0;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.kode} | ${item.username} (${item.harga})\n`;
      sumHarga += parseNum(item.harga);
    });
    
    message += `\nTotal: ${formatHarga(sumHarga)}\n\nBisa di test dulu kak?`;
    
    window.open(`https://wa.me/6285959161539?text=${encodeURIComponent(message)}`, '_blank');
    closeBuyModal();
  };
}

// --- MODAL TNC & CONFIRMATION ---
function openModal() {
  const modal = document.getElementById('tncModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { 
    backdrop.classList.remove('opacity-0'); 
    backdrop.classList.add('opacity-100'); 
    content.classList.remove('opacity-0', 'scale-95'); 
    content.classList.add('opacity-100', 'scale-100'); 
  }, 10);
}

function closeModal() {
  const modal = document.getElementById('tncModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  backdrop.classList.remove('opacity-100'); 
  backdrop.classList.add('opacity-0'); 
  content.classList.remove('opacity-100', 'scale-100'); 
  content.classList.add('opacity-0', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function closeBuyModal() {
  const modal = document.getElementById('buyModal');
  const backdrop = document.getElementById('buyModalBackdrop');
  const content = document.getElementById('buyModalContent');
  backdrop.classList.remove('opacity-100'); 
  backdrop.classList.add('opacity-0'); 
  content.classList.remove('opacity-100', 'scale-100'); 
  content.classList.add('opacity-0', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// --- DATA FETCHING AND RENDERING ---
async function loadData() {
  const grid = document.getElementById('productGrid');
  const loader = document.getElementById('loadingIndicator');
  try {
    const response = await fetch(SPREADSHEET_URL);
    allData = await response.json();
    loader.style.display = 'none';
    updateCounts();
    renderProducts();
  } catch (e) {
    loader.style.display = 'none';
    grid.innerHTML = '<p class="text-center text-red-400 py-10 max-w-md mx-auto">Gagal memuat data stok.</p>';
  }
}

function updateCounts() {
  const readyCount = allData.filter(item => item.status_stok?.toLowerCase() === 'ready').length;
  const soldCount = allData.filter(item => item.status_stok?.toLowerCase() === 'sold').length;
  const mtCount = allData.filter(item => { 
    const isReady = item.status_stok?.toLowerCase() === 'ready'; 
    const htmtVal = item.status_htmt?.toLowerCase() || ''; 
    return isReady && htmtVal.includes('mt') && !htmtVal.includes('ht'); 
  }).length;
  const htmtCount = allData.filter(item => { 
    const isReady = item.status_stok?.toLowerCase() === 'ready'; 
    const htmtVal = item.status_htmt?.toLowerCase() || ''; 
    return isReady && htmtVal.includes('ht'); 
  }).length;
  
  document.getElementById('count-ready').innerText = readyCount;
  document.getElementById('count-sold').innerText = soldCount;
  document.getElementById('count-mt').innerText = mtCount;
  document.getElementById('count-htmt').innerText = htmtCount;
}

function switchTab(tab) {
  currentTab = tab;
  const tabs = ['ready', 'sold', 'mt', 'htmt'];
  
  tabs.forEach(t => { 
    const btn = document.getElementById(`btn-${t}`); 
    if (t === tab) { 
      btn.className = "w-full py-2.5 rounded-xl border border-blue-500 bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all outline-none";
    } else { 
      btn.className = "w-full py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-bold text-gray-400 hover:bg-gray-700 transition-all outline-none";
    } 
  });

  document.getElementById('searchInput').value = '';
  document.getElementById('noResults').classList.add('hidden');
  document.getElementById('sortSelect').value = 'default';
  renderProducts();
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = '';
  let filtered = [];
  
  if (currentTab === 'ready' || currentTab === 'sold') {
    filtered = allData.filter(item => item.status_stok?.toLowerCase() === currentTab);
  } else if (currentTab === 'mt') {
    filtered = allData.filter(item => { 
      const isReady = item.status_stok?.toLowerCase() === 'ready'; 
      const htmtVal = item.status_htmt?.toLowerCase() || ''; 
      return isReady && htmtVal.includes('mt') && !htmtVal.includes('ht'); 
    });
  } else if (currentTab === 'htmt') {
    filtered = allData.filter(item => { 
      const isReady = item.status_stok?.toLowerCase() === 'ready'; 
      const htmtVal = item.status_htmt?.toLowerCase() || ''; 
      return isReady && htmtVal.includes('ht'); 
    });
  }

  const sortVal = document.getElementById('sortSelect').value;

  if (sortVal === 'harga-asc') {
    filtered.sort((a, b) => parseNum(a.harga) - parseNum(b.harga));
  } else if (sortVal === 'harga-desc') {
    filtered.sort((a, b) => parseNum(b.harga) - parseNum(a.harga));
  } else if (sortVal === 'followers-desc') {
    filtered.sort((a, b) => parseNum(a.followers) - parseNum(b.followers));
  } else if (sortVal === 'tahun-asc') {
    filtered.sort((a, b) => parseNum(a.tahun_akun) - parseNum(b.tahun_akun));
  } else {
    if (currentTab === 'sold') filtered.reverse();
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="text-center text-gray-500 py-10 md:col-span-2 lg:col-span-3">Tidak ada akun di kategori ini.</p>`;
    return;
  }

  filtered.forEach((item, index) => {
    const isReady = item.status_stok?.toLowerCase() === 'ready';
    const inCart = cart.some(c => c.username === item.username); 
    
    // PERBAIKAN: Menambahkan data-username=".." dan class="btn-add-cart" agar mudah dicari oleh sistem
    const cardHtml = `
      <div class="product-card bg-gray-800 rounded-2xl p-5 shadow-sm border ${inCart ? 'border-blue-500 shadow-blue-900/20 shadow-lg' : 'border-gray-700'} fade-in-down ${!isReady ? 'opacity-60' : ''}" data-username="${item.username}" style="animation-delay: ${index * 0.05}s">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h2 class="text-lg font-bold text-gray-100">Akun X ${item.tahun_akun}</h2>
            <span class="text-xs text-gray-500 font-mono">KODE: ${item.kode}</span>
          </div>
          <span class="px-2.5 py-1 ${isReady ? 'bg-green-900/40 text-green-400 border-green-800' : 'bg-red-900/40 text-red-400 border-red-800'} text-[10px] uppercase font-bold rounded border tracking-wider">${item.status_stok}</span>
        </div>
        <div class="bg-gray-900/60 rounded-xl p-4 mb-5 border border-gray-700/50 space-y-3">
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Username</span><span class="text-gray-200 font-semibold font-mono">${item.username}</span></div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Link Profil</span>${isReady ? `<a href="${item.link_akun}" target="_blank" class="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2 flex items-center gap-1">Cek Akun</a>` : `<span class="text-gray-500 italic">Privat</span>`}</div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Followers</span><span class="text-gray-200 font-semibold val-followers">${item.followers}</span></div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Postingan</span><span class="text-gray-200 font-semibold">${item.postingan}</span></div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Email</span><span class="text-gray-200 font-semibold">${item.email}</span></div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Verif Telepon</span><span class="${item.verif_telepon?.toLowerCase() === 'tidak' ? 'text-red-400' : 'text-green-400'} font-semibold">${item.verif_telepon}</span></div>
          <div class="flex justify-between items-center text-sm border-b border-gray-700/50 pb-2"><span class="text-gray-400">Masuk HT/MT</span><span class="${item.status_htmt?.toLowerCase().includes('mt') ? 'text-yellow-400' : 'text-green-400'} font-semibold val-htmt">${item.status_htmt}</span></div>
          <div class="flex justify-between items-center text-sm"><span class="text-gray-400">Kesehatan</span><span class="text-green-400 font-semibold">${item.kesehatan}</span></div>
        </div>
        <div class="flex items-center justify-between pt-2">
          <div>
            <p class="text-xs text-gray-500 mb-0.5">Harga</p>
            <p class="text-xl font-bold text-blue-500">${item.harga}</p>
          </div>
          ${isReady ? 
            (inCart ? 
              `<button onclick="toggleCart('${item.kode}', '${item.username}', '${item.harga}')" class="btn-add-cart px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 outline-none">Ditambahkan</button>` 
              : 
              `<button onclick="toggleCart('${item.kode}', '${item.username}', '${item.harga}')" class="btn-add-cart px-5 py-2.5 bg-gray-800 border border-gray-600 text-blue-400 text-sm font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 hover:text-white transition shadow-sm outline-none">Tambah</button>`
            ) :
            `<button disabled class="px-5 py-2.5 bg-gray-700 text-gray-400 text-sm font-semibold rounded-lg cursor-not-allowed">Sold</button>`
          }
        </div>
      </div>`;
    grid.innerHTML += cardHtml;
  });
  generateSearchIndex();
  filterAccounts(); 
}

function generateSearchIndex() {
  document.querySelectorAll('.product-card').forEach(card => {
    let fVal = card.querySelector('.val-followers')?.innerText.trim() || '';
    let hVal = card.querySelector('.val-htmt')?.innerText.trim().toLowerCase() || '';
    let extra = ` f${fVal} `;
    if(hVal.includes('mt')) extra += 'mt masuk mt ';
    if(hVal.includes('ht')) extra += 'ht masuk ht ';
    let cleanText = card.innerText.toLowerCase().replace(/masuk ht\/mt/g, '');
    card.dataset.search = cleanText + " " + extra;
  });
}

function filterAccounts() {
  let input = document.getElementById('searchInput').value.toLowerCase().trim();
  let visibleCount = 0;
  document.querySelectorAll('.product-card').forEach(card => {
    let isMatch = card.dataset.search.includes(input);
    card.style.display = isMatch ? "block" : "none";
    if (isMatch) visibleCount++;
  });
  const noResultsDiv = document.getElementById('noResults');
  if (visibleCount === 0 && input !== "") { 
    noResultsDiv.classList.remove('hidden'); 
  } else { 
    noResultsDiv.classList.add('hidden'); 
  }
}

window.onload = loadData;
