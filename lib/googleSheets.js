// Helper utility to connect Google Sheets with Aiyra Cookies Next.js

export const SPREADSHEET_ID = '1qNF4XHN3vjB91rjluYgVLJRJMC971dgVsXsGIppB9wg';
export const SPREADSHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/edit`;

/**
 * Fetch data from a specific sheet tab using Google Visualization API (GViz)
 * Works for any public / "Anyone with link" spreadsheet without API keys!
 */
export async function fetchSheetData(sheetName = 'Produk', spreadsheetId = SPREADSHEET_ID) {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;

    const text = await response.text();
    // GViz returns /*O_o*/\ngoogle.visualization.Query.setResponse({...});
    const jsonString = text.replace(/^[^{]*\{/, '{').replace(/\);?$/, '');
    const data = JSON.parse(jsonString);

    if (!data.table || !data.table.rows || data.table.rows.length === 0) {
      return [];
    }

    // Extract headers from cols
    const headers = data.table.cols.map((col) => (col.label || col.id).trim());

    // Map rows to objects
    const items = data.table.rows.map((row) => {
      const item = {};
      row.c.forEach((cell, index) => {
        const header = headers[index] || `col_${index}`;
        item[header] = cell ? cell.v : '';
      });
      return item;
    });

    return items;
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    return null;
  }
}

/**
 * Send POST request to Google Apps Script Web App via Next.js API bridge
 * Used for saving new Users (Register) and new Orders
 */
export async function sendToGoogleAppsScript(scriptUrl, payload) {
  if (!scriptUrl) {
    console.warn('Google Script URL belum diset di pengaturan');
    return { success: false, message: 'Google Script URL belum diset' };
  }

  try {
    const response = await fetch('/api/sheet', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ scriptUrl, payload }),
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending data to Google Apps Script:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all cloud database records (Orders & Users) for multi-device 2-way sync
 * 1. Primary: Calls Google Apps Script via /api/sheet?action=getAllData
 * 2. Secondary Fallback: Direct Google Visualization API (GViz)
 */
export async function fetchCloudDatabase(scriptUrl, spreadsheetId = SPREADSHEET_ID) {
  // 1. Try Google Apps Script API via /api/sheet
  if (scriptUrl) {
    try {
      const res = await fetch(`/api/sheet?action=getAllData&scriptUrl=${encodeURIComponent(scriptUrl)}`, {
        cache: 'no-store'
      });
      const json = await res.json();
      if (json && json.success && json.data) {
        return {
          success: true,
          source: 'AppsScript',
          orders: json.data.orders || [],
          users: json.data.users || []
        };
      }
    } catch (err) {
      console.warn('[Sync] Apps Script fetch failed, falling back to GViz...', err);
    }
  }

  // 2. Fallback: Google Visualization API (GViz) on public sheets
  if (spreadsheetId) {
    try {
      const [rawOrders, rawUsers] = await Promise.all([
        fetchSheetData('Pesanan', spreadsheetId),
        fetchSheetData('Users', spreadsheetId)
      ]);

      let parsedOrders = [];
      if (rawOrders && Array.isArray(rawOrders)) {
        parsedOrders = rawOrders.map((o) => ({
          invoiceId: String(o.invoiceId || o.col_0 || ''),
          date: String(o.date || o.col_1 || ''),
          customer: {
            name: String(o.customerName || o.col_2 || 'Pelanggan'),
            phone: String(o.customerPhone || o.col_3 || ''),
            address: String(o.address || o.col_4 || '')
          },
          itemsSummary: String(o.items || o.col_5 || ''),
          totalPrice: Number(o.totalPrice || o.col_6) || 0,
          status: String(o.status || o.col_7 || 'Waiting List')
        })).filter((o) => o.invoiceId && o.invoiceId !== 'invoiceId');
      }

      let parsedUsers = [];
      if (rawUsers && Array.isArray(rawUsers)) {
        parsedUsers = rawUsers.map((u) => ({
          id: String(u.id || u.col_0 || ''),
          fullName: String(u.fullName || u.col_1 || ''),
          phone: String(u.phone || u.col_2 || ''),
          password: String(u.password || u.col_3 || ''),
          address: String(u.address || u.col_4 || ''),
          role: String(u.role || u.col_5 || 'user'),
          status: String(u.status || u.col_6 || 'approved'),
          registeredAt: String(u.registeredAt || u.col_7 || '')
        })).filter((u) => u.phone && u.phone !== 'phone');
      }

      if (parsedOrders.length > 0 || parsedUsers.length > 0) {
        return {
          success: true,
          source: 'GViz',
          orders: parsedOrders,
          users: parsedUsers
        };
      }
    } catch (err) {
      console.error('[Sync] GViz fallback failed:', err);
    }
  }

  return { success: false, message: 'Tidak dapat mengambil data dari Google Spreadsheet.' };
}
