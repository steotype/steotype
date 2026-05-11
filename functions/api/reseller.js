export async function onRequest(context) {
  // Tangkap semua parameter yang dikirim dari website
  const url = new URL(context.request.url);
  const queryString = url.search; 

  // LINK GOOGLE SCRIPT TERBARU
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwyxQyiE0A1_seUgpO_6a2mFlJOc5iSFKEy6xK-uFdXqOAC66EABmTUmctXJX34YSRs/exec" + queryString;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store" // Memastikan Cloudflare tidak menyimpan cache basi
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", message: "Koneksi API Gagal." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
