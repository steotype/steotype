export async function onRequest(context) {
  // 1. Tangkap semua parameter dari website (?action=login atau ?action=get_stok)
  const url = new URL(context.request.url);
  const queryString = url.search; 

  // 2. Tempelkan ke URL Asli Google Script kamu (yang disembunyikan)
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxM0LN44xzbUy4VDb8fVk_Olb3avz7m-AWlB_iKkDGprIjSayyaac4hBOlMYAznJGvB/exec" + queryString;

  try {
    // 3. Ambil data dari Google secara diam-diam
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    // 4. Kirim hasilnya ke website
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store" // Memastikan data login/stok selalu baru
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", message: "Koneksi API Gagal." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
