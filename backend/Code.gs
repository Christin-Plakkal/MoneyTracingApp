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
    
    const targetDateStr = new Date(data.Date).toDateString();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowDateStr = new Date(row[0]).toDateString();
      
      if (rowDateStr === targetDateStr && 
          row[1] === data.Category && 
          Math.abs(parseFloat(row[2]) - parseFloat(data.Amount)) < 0.01 && 
          row[3] === data.Type &&
          (row[4] || 'N') === (data.GroupPayment || 'N') &&
          Math.abs(parseFloat(row[5] || 0) - parseFloat(data.MyShare || 0)) < 0.01 &&
          (row[6] || '').trim() === (data.Notes || '').trim()) {
        sheet.deleteRow(i + 1);
        return createResponse({ success: true });
      }
    }
    return createResponse({ error: 'Transaction not found' });
  }

  if (action === 'updateTransaction') {
    const sheet = ss.getSheetByName('Transactions');
    if (!sheet) return createResponse({ error: 'Sheet not found' });
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    
    const oldData = data.oldData;
    const newData = data.newData;
    const targetDateStr = new Date(oldData.Date).toDateString();
    
    for (let i = 1; i < values.length; i++) {
      const row = values[i];
      const rowDateStr = new Date(row[0]).toDateString();
      
      if (rowDateStr === targetDateStr && 
          row[1] === oldData.Category && 
          Math.abs(parseFloat(row[2]) - parseFloat(oldData.Amount)) < 0.01 && 
          row[3] === oldData.Type &&
          (row[4] || 'N') === (oldData.GroupPayment || 'N') &&
          Math.abs(parseFloat(row[5] || 0) - parseFloat(oldData.MyShare || 0)) < 0.01 &&
          (row[6] || '').trim() === (oldData.Notes || '').trim()) {
        
        sheet.getRange(i + 1, 1, 1, 7).setValues([[
          newData.date,
          newData.category,
          newData.amount,
          newData.type,
          newData.groupPayment,
          newData.myShare,
          newData.notes
        ]]);
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
