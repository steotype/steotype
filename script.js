/* Logic and Data Fetching for SteoType (INFINITE SCROLL + REVERSED LOGIC FIXED V2) */

const SPREADSHEET_URL = "/api/stok";
let allData = []; 
let currentFilteredData = []; 
let displayLimit = 12; // BATAS 12 AKUN PERTAMA
let currentTab = 'ready';
let isLoadingMore = false;

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
        btn.innerText = "Ditambahkan";
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

  const cartFooter = document.querySelector('.p-4.border-t.border-gray-700.bg-gray-900\\/50.rounded-b-2xl');
  cartFooter.innerHTML = `
    <div class="flex justify-between items-center mb-4">
      <span class="text-gray-400 text-sm">Total Harga</span>
      <span id="cartTotal" class="text-xl font-bold text-blue-400">${formatHarga(totalHarga)}</span>
    </div>
    <button onclick="proceedToCheckout()" class="flex justify-center items-center gap-2 w-full py-3 bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#128C7E] hover:to-[#075E54] text-white font-bold rounded-xl transition shadow-lg shadow-green-900/20 outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
      Lanjut ke WhatsApp
    </button>
  `;
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
let isFromCheckout = false; 

function openModal(fromCheckout = false) {
  isFromCheckout = fromCheckout; 
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

function openTncFromCheckout() {
  closeBuyModal();
  setTimeout(() => { openModal(true); }, 300);
}

function closeModal() {
  const modal = document.getElementById('tncModal');
  const backdrop = document.getElementById('modalBackdrop');
  const content = document.getElementById('modalContent');
  backdrop.classList.remove('opacity-100'); 
  backdrop.classList.add('opacity-0'); 
  content.classList.remove('opacity-100', 'scale-100'); 
  content.classList.add('opacity-0', 'scale-95');
  
  setTimeout(() => { 
    modal.classList.add('hidden'); 
    if (isFromCheckout) {
      isFromCheckout = false; 
      const buyModal = document.getElementById('buyModal');
      const buyBackdrop = document.getElementById('buyModalBackdrop');
      const buyContent = document.getElementById('buyModalContent');
      buyModal.classList.remove('hidden');
      setTimeout(() => { 
        buyBackdrop.classList.remove('opacity-0'); 
        buyBackdrop.classList.add('opacity-100'); 
        buyContent.classList.remove('opacity-0', 'scale-95'); 
        buyContent.classList.add('opacity-100', 'scale-100'); 
      }, 10);
    }
  }, 300);
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

// --- CORE DATA & FILTERING LOGIC ---
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
      return item;
    });

    loader.style.display = 'none';
    updateCounts();
    applyFilters(); 
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
    filtered.sort((a, b) => parseNum(a.harga) - parseNum(b.harga));
  } else if (sortVal === 'harga-desc') {
    filtered.sort((a, b) => parseNum(b.harga) - parseNum(a.harga));
  } else if (sortVal === 'followers-desc') {
    filtered.sort((a, b) => parseNum(b.followers) - parseNum(a.followers));
  } else if (sortVal === 'tahun-asc') {
    filtered.sort((a, b) => parseNum(a.tahun_akun) - parseNum(b.tahun_akun));
  } 

  currentFilteredData = filtered;
  displayLimit = 12; // KEMBALIKAN LIMIT KE 12 SAAT FILTER/TAB BERUBAH
  renderProducts();
}

function filterAccounts() {
  applyFilters();
}

function renderProducts() {
  const grid = document.getElementById('productGrid');
  grid.innerHTML = ''; // KOSONGKAN LAYAR DULU
  
  if (currentFilteredData.length === 0) {
    document.getElementById('noResults').classList.remove('hidden');
    return;
  }
  document.getElementById('noResults').classList.add('hidden');

  renderBatch(); // MASUKKAN 12 AKUN PERTAMA
}

function renderBatch() {
  const grid = document.getElementById('productGrid');
  
  // Ambil data sesuai jumlah yang sudah terpasang di grid sampai batas Limit
  const batch = currentFilteredData.slice(grid.children.length, displayLimit);
  
  batch.forEach((item, index) => {
    const isReady = item.status_stok?.toLowerCase() === 'ready';
    const inCart = cart.some(c => c.username === item.username); 
    
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
          </div>
          <div class="mb-3">
            <h2 class="text-xl font-extrabold text-gray-100 flex items-center gap-1">Akun X ${item.tahun_akun}</h2>
            <p class="text-[15px] text-gray-400">@${item.username}</p>
          </div>
          <div class="text-[14px] text-gray-200 mb-3 space-y-1">
             <p>✅ Email: ${item.email}</p>
             <p>${item.verif_telepon?.toLowerCase() === 'tidak' ? '❌' : '✅'} Verif Telepon: ${item.verif_telepon}</p>
             <p>🛡️ Kesehatan: <span class="text-green-400">${item.kesehatan}</span></p>
             <p>⚡ Status: <span class="${item.status_htmt?.toLowerCase().includes('mt') ? 'text-yellow-400' : 'text-green-400'}">${item.status_htmt}</span></p>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-400 mb-3">
             <span class="flex items-center gap-1">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.708 2H4.292C3.028 2 2 3.028 2 4.292v15.416C2 20.972 3.028 22 4.292 22h15.416C20.972 22 22 20.972 22 19.708V4.292C22 3.028 20.972 2 19.708 2zm.792 17.708c0 .437-.355.792-.792.792H4.292a.792.792 0 01-.792-.792V9h17v10.708zM4 7V4.292c0-.16.131-.292.292-.292h15.416c.16 0 .292.131.292.292V7H4z"/></svg>
                Bergabung tahun ${item.tahun_akun}
             </span>
          </div>
          <div class="flex gap-4 text-[15px] text-gray-400 mb-4">
            <p><span class="text-gray-100 font-bold">${item.postingan}</span> Posts</p>
            <p><span class="text-gray-100 font-bold">${item.followers}</span> Followers</p>
          </div>
          <div class="mt-2 pt-4 border-t border-gray-700 flex justify-between items-center">
             <div>
                <p class="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Harga</p>
                <p class="text-xl font-bold text-blue-500">${item.harga}</p>
             </div>
             <div>
              ${isReady ? 
                (inCart ? 
                  `<button onclick="toggleCart('${item.kode}', '${item.username}', '${item.harga}')" class="btn-add-cart px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-900/20 outline-none">Ditambahkan</button>` : 
                  `<button onclick="toggleCart('${item.kode}', '${item.username}', '${item.harga}')" class="btn-add-cart px-5 py-2.5 bg-gray-800 border border-gray-600 text-blue-400 text-sm font-semibold rounded-lg hover:bg-gray-700 hover:border-gray-500 hover:text-white transition shadow-sm outline-none">Tambah</button>`
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

// --- INFINITE SCROLL HANDLER (SENSOR LEBIH PEKA) ---
window.addEventListener('scroll', () => {
  const scrollY = window.scrollY || window.pageYOffset;
  const windowHeight = window.innerHeight;
  const documentHeight = Math.max(
    document.body.scrollHeight, document.body.offsetHeight, 
    document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight
  );

  // Jika jarak pandangan kita sudah mendekati 800px dari paling bawah layar
  if ((windowHeight + scrollY) >= (documentHeight - 800)) {
    if (!isLoadingMore && displayLimit < currentFilteredData.length) {
      isLoadingMore = true;
      displayLimit += 12;
      setTimeout(() => {
        renderBatch();
      }, 100); // jeda sangat halus
    }
  }
});

window.onload = loadData;
