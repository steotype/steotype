export async function onRequest(context) {
  // Masukkan URL Google Web App Anda di sini
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwA5cEzHO0HvOHLKJf2xHIx_X0bI_IwttXvaDKb6pOViSlXYSZJe_NPJOSpaIMoe0xqkg/exec";

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", 
        "Cache-Control": "s-maxage=60"
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Gagal mengambil data." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
