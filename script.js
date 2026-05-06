/* Logic and Data Fetching for SteoType (FINAL WA BUTTON UPDATE) */

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

  // MENGUBAH TOMBOL CHECKOUT MENJADI TOMBOL WHATSAPP HIJAU
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
