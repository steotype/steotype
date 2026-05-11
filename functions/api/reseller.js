export async function onRequest(context) {
  const url = new URL(context.request.url);
  const queryString = url.search; 

  // LINK GOOGLE SCRIPT TERBARU
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxUQQKI2MNo3jqESMvdV1O7prnqVm34SBKtXduzkExaCwR6k1m2tPggh5_CmHxwSWXg/exec" + queryString;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-store" 
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ status: "error", message: "Koneksi API Gagal." }), {
      status: 500,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
    });
  }
}
