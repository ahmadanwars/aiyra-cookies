export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const scriptUrl = searchParams.get('scriptUrl');
    const action = searchParams.get('action') || 'getAllData';

    if (!scriptUrl) {
      return Response.json(
        { success: false, message: 'Google Apps Script URL belum diisi di Pengaturan Admin.' },
        { status: 400 }
      );
    }

    const targetUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}action=${encodeURIComponent(action)}`;
    console.log('[API/SHEET GET] Fetching:', targetUrl);

    const response = await fetch(targetUrl, {
      cache: 'no-store',
      redirect: 'follow',
    });

    const text = await response.text();
    console.log('[API/SHEET GET] Response status:', response.status);

    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {}

    if (data && data.success === true) {
      return Response.json({ success: true, data });
    }

    return Response.json({
      success: false,
      message: 'Gagal membaca data dari Google Apps Script.',
      raw: text.substring(0, 300)
    });
  } catch (error) {
    console.error('[API/SHEET GET] Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { scriptUrl, payload } = await request.json();

    if (!scriptUrl) {
      return Response.json(
        { success: false, message: 'Google Apps Script URL belum diisi di Pengaturan Admin.' },
        { status: 400 }
      );
    }

    console.log('[API/SHEET] Calling Google Apps Script URL:', scriptUrl);
    console.log('[API/SHEET] Payload:', JSON.stringify(payload));

    // 1. Try POST request to Google Apps Script Web App
    let response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      redirect: 'follow',
    });

    let text = await response.text();
    console.log('[API/SHEET] POST Status:', response.status);
    console.log('[API/SHEET] POST Response:', text.substring(0, 300));

    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {}

    // 2. If POST didn't return { success: true }, try GET query parameter fallback
    if (!data || data.success !== true) {
      try {
        const queryParams = new URLSearchParams();
        for (const key in payload) {
          queryParams.set(
            key,
            typeof payload[key] === 'object' ? JSON.stringify(payload[key]) : String(payload[key])
          );
        }
        const getUrl = `${scriptUrl}${scriptUrl.includes('?') ? '&' : '?'}${queryParams.toString()}`;
        console.log('[API/SHEET] Trying GET fallback...');
        const getRes = await fetch(getUrl, { redirect: 'follow' });
        const getText = await getRes.text();
        console.log('[API/SHEET] GET Status:', getRes.status);
        console.log('[API/SHEET] GET Response:', getText.substring(0, 300));
        try {
          const getData = JSON.parse(getText);
          if (getData && getData.success === true) {
            return Response.json({ success: true, data: getData });
          }
        } catch (e) {}
      } catch (err) {
        console.error('[API/SHEET] GET fallback error:', err);
      }
    }

    // Check if POST succeeded
    if (data && data.success === true) {
      return Response.json({ success: true, data });
    }

    // If Google returned HTML or permission error
    const isHtml = text.trim().startsWith('<') || text.includes('<!DOCTYPE html>') || text.includes('<html');
    let errorMessage = 'Gagal menyimpan ke Google Spreadsheet.';
    if (isHtml) {
      if (text.includes('accounts.google.com') || text.includes('Sign in')) {
        errorMessage = 'Izin Akses Web App: "Who has access" harus dipilih "Anyone" (Siapa saja), bukan "Only myself".';
      } else {
        errorMessage = 'Google mengembalikan halaman HTML. Pastikan Anda sudah Deploy ulang dengan "New version" di Apps Script.';
      }
    } else if (data && data.error) {
      errorMessage = data.error;
    }

    return Response.json({
      success: false,
      message: errorMessage,
      raw: text.substring(0, 300)
    });
  } catch (error) {
    console.error('[API/SHEET] Error forwarding to Google Apps Script:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
