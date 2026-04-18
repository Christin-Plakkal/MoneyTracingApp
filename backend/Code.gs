const SPREADSHEET_ID = '1by-UEi7K8cWsCUraykmYVYuh-mqyJ7ywcZidCQzI4eI'; // User will need to replace this or it will use active spreadsheet
const ALLOWED_EMAIL = 'christinplakkal@gmail.com'; // User will need to replace this

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'getTransactions') {
    const sheet = ss.getSheetByName('Transactions');
    if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      let obj = {};
      headers.forEach((header, i) => obj[header] = row[i]);
      return obj;
    });
    return createResponse(rows);
  }
  
  if (action === 'getCategories') {
    const sheet = ss.getSheetByName('Categories');
    if (!sheet) return createResponse(['Income', 'Expense', 'Charity']);
    const categories = sheet.getDataRange().getValues().flat().filter(String);
    return createResponse(categories);
  }

  return createResponse({ error: 'Invalid action' });
}

function doPost(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = JSON.parse(e.postData.contents);
  const action = data.action;

  if (action === 'addTransaction') {
    let sheet = ss.getSheetByName('Transactions');
    if (!sheet) {
      sheet = ss.insertSheet('Transactions');
      sheet.appendRow(['Date', 'Category', 'Amount', 'Type', 'GroupPayment', 'MyShare', 'Notes']);
    }
    sheet.appendRow([
      data.date,
      data.category,
      data.amount,
      data.type,
      data.groupPayment,
      data.myShare,
      data.notes
    ]);
    return createResponse({ success: true });
  }

  if (action === 'addCategory') {
    let sheet = ss.getSheetByName('Categories');
    if (!sheet) {
      sheet = ss.insertSheet('Categories');
    }
    sheet.appendRow([data.category]);
    return createResponse({ success: true });
  }

  if (action === 'deleteTransaction') {
    const sheet = ss.getSheetByName('Transactions');
    if (!sheet) return createResponse({ error: 'Sheet not found' });
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    // Note: Transaction objects from getTransactions have capitalized keys matching headers
    const targetDateStr = new Date(data.Date).toDateString();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowDateStr = new Date(row[0]).toDateString();
      
      if (rowDateStr === targetDateStr && 
          row[1] === data.Category && 
          parseFloat(row[2]) == parseFloat(data.Amount) && 
          row[3] === data.Type &&
          (row[6] || '') === (data.Notes || '')) {
        sheet.deleteRow(i + 1);
        return createResponse({ success: true });
      }
    }
    return createResponse({ error: 'Transaction not found' });
  }

  return createResponse({ error: 'Invalid action' });
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Ensure sheets exist
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss.getSheetByName('Transactions')) {
    const sheet = ss.insertSheet('Transactions');
    sheet.appendRow(['Date', 'Category', 'Amount', 'Type', 'GroupPayment', 'MyShare', 'Notes']);
  }
  if (!ss.getSheetByName('Categories')) {
    const sheet = ss.insertSheet('Categories');
    sheet.appendRow(['Income']);
    sheet.appendRow(['Food']);
    sheet.appendRow(['Rent']);
    sheet.appendRow(['Charity']);
  }
}
