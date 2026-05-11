// --- JALUR API TERSAMAR ---
const SPREADSHEET_URL = "/api/reseller?action=get_stok";
let allData = []; 
let currentFilteredData = []; 
let displayLimit = 12; 
let currentTab = 'ready';
let isLoadingMore = false;
let cart = [];

// --- INISIALISASI BANNER RESELLER ---
const diskonRaw = String(session.diskon || "0").toLowerCase();

function parsePrice(input) {
    let val = String(input).toLowerCase().trim();
    if (val.includes('k')) return parseFloat(val.replace('k', '').replace(/[^0-9.]/g, '')) * 1000;
    return parseInt(val.replace(/[^0-9]/g, '')) || 0;
}

const dscNominal = parsePrice(diskonRaw);
document.getElementById('nmDisplay').innerText = session.nama;
document.getElementById('dscDisplay').innerText = diskonRaw.includes('k') ? diskonRaw.toUpperCase() : "Rp " + dscNominal.toLocaleString('id-ID');

// --- FUNGSI KERANJANG ---
function toggleCart(kode, username, hargaAsli, hargaFinal) {
  const index = cart.findIndex(item => item.username === username);
  if (index > -1) { cart.splice(index, 1); } 
  else { cart.push({kode, username, hargaAsli, hargaFinal}); }
  updateCartUI();
  syncCartUI(); 
}

function syncCartUI() {
  document.querySelectorAll('.product-card').forEach(card => {
    const username = card.dataset.username;
    const inCart = cart.some(c => c.username === username);
    const btn = card.querySelector('.btn-add-cart');
    
    if (inCart) {
      card.classList.add('border-blue-500', 'shadow-blue-900/20', 'shadow-lg');
      card.classList.remove('border-gray-700');
      if(btn) {
        btn.className = "btn-add-cart px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 outline-none";
        btn.innerText = "Terpilih";
      }
    } else {
      card.classList.remove('border-blue-500', 'shadow-blue-900/20', 'shadow-lg');
      card.classList.add('border-gray-700');
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
    totalHarga += item.hargaFinal;
    cartList.innerHTML += `
      <div class="flex justify-between items-center py-2 border-b border-gray-700/50">
        <div>
          <p class="text-sm font-bold text-gray-200">${item.kode}</p>
          <p class="text-xs text-gray-400 font-mono">@${item.username}</p>
        </div>
        <div class="flex items-center gap-4">
          <p class="text-sm font-bold text-blue-400">Rp ${item.hargaFinal.toLocaleString('id-ID')}</p>
          <button onclick="toggleCart('${item.kode}', '${item.username}', ${item.hargaAsli}, ${item.hargaFinal}); openCartModal();" class="text-gray-500 hover:text-red-400 transition bg-gray-800 p-1.5 rounded-md outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
    `;
  });
  
  document.getElementById('cartTotal').innerText = "Rp " + totalHarga.toLocaleString('id-ID');
  
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const content = document.getElementById('cartModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { backdrop.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('scale-95', 'scale-100'); }, 10);
}

function closeCartModal() {
  const modal = document.getElementById('cartModal');
  const backdrop = document.getElementById('cartModalBackdrop');
  const content = document.getElementById('cartModalContent');
  backdrop.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('scale-100', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function proceedToCheckout() {
  closeCartModal();
  const modal = document.getElementById('buyModal');
  const backdrop = document.getElementById('buyModalBackdrop');
  const content = document.getElementById('buyModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { backdrop.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('scale-95', 'scale-100'); }, 10);
  
  document.getElementById('btn-confirm-buy').onclick = function() {
    let message = `Halo, saya reseller *${session.nama}* mau order ${cart.length} akun:\n\n`;
    let sumHarga = 0;
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.kode} | ${item.username} (Rp ${item.hargaFinal.toLocaleString('id-ID')})\n`;
      sumHarga += item.hargaFinal;
    });
    message += `\nTotal: Rp ${sumHarga.toLocaleString('id-ID')}`;
    window.open(`https://wa.me/6285959161539?text=${encodeURIComponent(message)}`, '_blank');
    closeBuyModal();
  };
}

// --- FUNGSI MODAL ---
let isFromCheckout = false; 
function openModal(fromCheckout = false) {
  isFromCheckout = fromCheckout; 
  const modal = document.getElementById('tncModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { backdrop.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('scale-95', 'scale-100'); }, 10);
}

function openTncFromCheckout() { closeBuyModal(); setTimeout(() => { openModal(true); }, 300); }

function closeModal() {
  const modal = document.getElementById('tncModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  backdrop.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('scale-100', 'scale-95');
  setTimeout(() => { 
    modal.classList.add('hidden'); 
    if (isFromCheckout) {
      isFromCheckout = false; 
      const buyModal = document.getElementById('buyModal');
      const buyBackdrop = document.getElementById('buyModalBackdrop');
      const buyContent = document.getElementById('buyModalContent');
      buyModal.classList.remove('hidden');
      setTimeout(() => { buyBackdrop.classList.replace('opacity-0', 'opacity-100'); buyContent.classList.replace('opacity-0', 'opacity-100'); buyContent.classList.replace('scale-95', 'scale-100'); }, 10);
    }
  }, 300);
}

function closeBuyModal() {
  const modal = document.getElementById('buyModal');
  const backdrop = document.getElementById('buyModalBackdrop');
  const content = document.getElementById('buyModalContent');
  backdrop.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('scale-100', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

function openInfoModal() {
  const modal = document.getElementById('infoModal');
  const backdrop = document.getElementById('infoModalBackdrop');
  const content = document.getElementById('infoModalContent');
  modal.classList.remove('hidden');
  setTimeout(() => { backdrop.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('opacity-0', 'opacity-100'); content.classList.replace('scale-95', 'scale-100'); }, 10);
}

function closeInfoModal() {
  const modal = document.getElementById('infoModal');
  const backdrop = document.getElementById('infoModalBackdrop');
  const content = document.getElementById('infoModalContent');
  backdrop.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('opacity-100', 'opacity-0'); content.classList.replace('scale-100', 'scale-95');
  setTimeout(() => { modal.classList.add('hidden'); }, 300);
}

// --- CORE DATA FETCHING ---
async function loadData() {
  const grid = document.getElementById('productGrid');
  const loader = document.getElementById('loadingIndicator');
  try {
    const response = await fetch(SPREADSHEET_URL);
    const rawData = await response.json();
    
    allData = rawData.map(item => {
      let fVal = (item.followers || '').toString().trim();
      let hVal = (item.status_htmt || '').toLowerCase();
      let extra = ` f${fVal} `;
      if(hVal.includes('mt')) extra += 'mt masuk mt ';
      if(hVal.includes('ht')) extra += 'ht masuk ht ';
      item.searchIndex = (JSON.stringify(item).toLowerCase() + extra);

      item.hAsliNum = parsePrice(item.harga);
      item.hFinalNum = Math.max(0, item.hAsliNum - dscNominal);

      return item;
    });

    loader.style.display = 'none';
    updateCounts();
    applyFilters(); 
  } catch (e) {
    loader.style.display = 'none';
    grid.innerHTML = '<p class="text-center text-red-400 py-10 max-w-md mx-auto font-bold uppercase tracking-widest text-xs">Gagal memuat database reseller.</p>';
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
    btn.className = (t === tab) ? 
      "w-full py-2.5 rounded-xl border border-blue-500 bg-blue-600 text-xs font-bold text-white shadow-lg shadow-blue-900/20 transition-all outline-none" :
      "w-full py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-xs font-bold text-gray-400 hover:bg-gray-700 transition-all outline-none";
  });
  document.getElementById('searchInput').value = '';
  document.getElementById('sortSelect').value = 'default';
  applyFilters();
}

function applyFilters() {
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

  const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
  if (searchInput !== "") {
    filtered = filtered.filter(item => item.searchIndex.includes(searchInput));
  }

  const sortVal = document.getElementById('sortSelect').value;
  if (sortVal === 'harga-asc') {
    filtered.sort((a, b) => a.hFinalNum - b.hFinalNum);
  } else if (sortVal === 'harga-desc') {
    filtered.sort((a, b) => b.hFinalNum - a.hFinalNum);
  } else if (sortVal === 'followers-desc') {
    filtered.sort((a, b) => parsePrice(b.followers) - parsePrice(a.followers));
  } else if (sortVal === 'tahun-asc') {
    filtered.sort((a, b) => parsePrice(a.tahun_akun) - parsePrice(b.tahun_akun));
  } 

  currentFilteredData = filtered;
  displayLimit = 12; 
  renderProducts();
}

function filterAccounts() { applyFilters(); }

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = ''; 
  if (currentFilteredData.length === 0) {
    document.getElementById('noResults').classList.remove('hidden');
    return;
  }
  document.getElementById('noResults').classList.add('hidden');
  renderBatch(); 
}

// --- RENDER BATCH PERSIS VERSI PUBLIK ---
function renderBatch() {
  const grid = document.getElementById('productGrid');
  const batch = currentFilteredData.slice(grid.children.length, displayLimit);
  
  batch.forEach((item) => {
    const isReady = item.status_stok?.toLowerCase() === 'ready';
    const inCart = cart.some(c => c.username === item.username); 

    // Logika Ikon Publik
    const telpText = item.verif_telepon || '-';
    const telpLow = telpText.toLowerCase().trim();
    const telpIcon = (telpLow === 'tidak' || telpLow === 'kosong' || telpLow === '-' || telpLow === '') ? '❌' : '✅';

    const emailText = item.email || '-';
    const emailLow = emailText.toLowerCase().trim();
    const emailIcon = (emailLow === 'tidak' || emailLow === 'kosong' || emailLow === '-' || emailLow === '') ? '❌' : '✅';

    const kesText = item.kesehatan || '-';
    const kesLow = kesText.toLowerCase().trim();
    const kesIcon = kesLow.includes('go green') ? '🛡️' : '🚦';
    const kesColor = kesLow.includes('go green') ? 'text-green-400' : 'text-gray-400';

    const htmtText = item.status_htmt || '-';
    const htmtLow = htmtText.toLowerCase().trim();
    let htmtIcon = '⚡'; let htmtColor = 'text-gray-400';
    if (htmtLow.includes('htmt')) { htmtIcon = '🔥'; htmtColor = 'text-orange-400'; } 
    else if (htmtLow.includes('mt')) { htmtIcon = '👍🏻'; htmtColor = 'text-green-400'; }
    
    // Kerangka HTML Kartu Publik (Dimodifikasi Harga & Tombol Cart)
    const cardHtml = `
      <div class="product-card bg-gray-800 rounded-2xl border ${inCart ? 'border-blue-500 shadow-blue-900/20 shadow-lg' : 'border-gray-700'} fade-in-down overflow-hidden ${!isReady ? 'opacity-60' : ''}" data-username="${item.username}">
        <div class="h-24 bg-gray-900 relative">
           <span class="absolute top-3 left-3 px-2 py-1 bg-black/60 text-gray-300 text-[10px] font-mono rounded backdrop-blur border border-gray-700">KODE: ${item.kode}</span>
           <span class="absolute top-3 right-3 px-2.5 py-1 ${isReady ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} text-[10px] uppercase font-bold rounded backdrop-blur">${item.status_stok}</span>
        </div>
        <div class="px-4 pb-4">
          <div class="flex justify-between items-start -mt-10 mb-2 relative z-10">
            <div class="w-[72px] h-[72px] rounded-full border-4 border-gray-800 bg-gray-900 flex items-center justify-center text-gray-600 overflow-hidden">
              <svg class="w-10 h-10 mt-2" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            </div>
            <div class="mt-12">
              ${isReady ? 
                `<a href="${item.link_akun}" target="_blank" class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-600 bg-gray-800 text-[13px] font-bold text-white hover:bg-gray-700 hover:border-gray-500 transition-colors shadow-sm outline-none">
                  Cek Profil <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                </a>` 
                : 
                `<span class="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-gray-700 bg-gray-900/50 text-[13px] font-bold text-gray-500 cursor-not-allowed">
                  <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/></svg> Privat
                </span>`
              }
            </div>
          </div>

          <div class="mb-3">
            <h2 class="text-xl font-extrabold text-gray-100 flex items-center gap-1">Akun X ${item.tahun_akun}</h2>
            <p class="text-[15px] text-gray-400">@${item.username}</p>
          </div>

          <div class="text-[14px] text-gray-200 mb-3 space-y-1">
             <p>${emailIcon} Email: ${emailText}</p>
             <p>${telpIcon} Verif Telepon: ${telpText}</p>
             <p>${kesIcon} Kesehatan: <span class="${kesColor} font-semibold">${kesText}</span></p>
             <p>${htmtIcon} Status: <span class="${htmtColor} font-semibold">${htmtText}</span></p>
          </div>

          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-3">
             <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.708 2H4.292C3.028 2 2 3.028 2 4.292v15.416C2 20.972 3.028 22 4.292 22h15.416C20.972 22 22 20.972 22 19.708V4.292C22 3.028 20.972 2 19.708 2zm.792 17.708c0 .437-.355.792-.792.792H4.292a.792.792 0 01-.792-.792V9h17v10.708zM4 7V4.292c0-.16.131-.292.292-.292h15.416c.16 0 .292.131.292.292V7H4z"/></svg>
                Bergabung ${item.tahun_akun}
             </span>
          </div>

          <div class="flex gap-4 text-[15px] text-gray-400 mb-4">
            <p><span class="text-gray-100 font-bold">${item.postingan}</span> Posts</p>
            <p><span class="text-gray-100 font-bold">${item.followers}</span> Followers</p>
          </div>

          <div class="mt-2 pt-4 border-t border-gray-700 flex justify-between items-center">
             <div>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Partner Price</p>
                <p class="text-xl font-bold text-blue-500">Rp ${item.hFinalNum.toLocaleString('id-ID')}</p>
                <p class="text-[10px] text-gray-600 line-through font-bold">Rp ${item.hAsliNum.toLocaleString('id-ID')}</p>
             </div>
             <div>
              ${isReady ? 
                (inCart ? 
                  `<button onclick="toggleCart('${item.kode}', '${item.username}', ${item.hAsliNum}, ${item.hFinalNum})" class="btn-add-cart px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 outline-none">Terpilih</button>` : 
                  `<button onclick="toggleCart('${item.kode}', '${item.username}', ${item.hAsliNum}, ${item.hFinalNum})" class="btn-add-cart px-5 py-2.5 bg-gray-800 border border-gray-600 text-blue-400 text-sm font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 hover:text-white transition shadow-sm outline-none">Tambah</button>`
                ) :
                `<button disabled class="px-5 py-2.5 bg-gray-700 text-gray-500 text-sm font-semibold rounded-lg cursor-not-allowed">Sold</button>`
              }
             </div>
          </div>
        </div>
      </div>
    `;
    grid.insertAdjacentHTML('beforeend', cardHtml);
  });
  isLoadingMore = false;
}

// --- INFINITE SCROLL ---
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);

  if ((windowHeight + scrollY) >= (documentHeight - 800)) {
    if (!isLoadingMore && displayLimit < currentFilteredData.length) {
      isLoadingMore = true; displayLimit += 12;
      setTimeout(() => { renderBatch(); }, 100); 
    }
  }
});

window.onload = loadData;
