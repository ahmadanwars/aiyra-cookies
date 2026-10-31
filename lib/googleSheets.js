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
