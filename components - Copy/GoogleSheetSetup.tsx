import React, { useState } from 'react';
import IconSave from './icons/IconSave';
import IconAlert from './icons/IconAlert';

interface GoogleSheetSetupProps {
  onSave: (url: string) => void;
  isLoading: boolean;
}

const appsScriptCode = `
// --- COPY THE CODE BELOW INTO THE APPS SCRIPT EDITOR ---

const SHEET_NAME = "Orders"; // Make sure this matches the name of your sheet tab
const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

// --- COLUMN MAPPING ---
// This must match the order of columns in your Google Sheet
const COLUMN_MAP = {
    id: 1,
    issueDate: 2,
    productDescription: 3,
    pieces: 4,
    fileNumber: 5,
    karigarName: 6,
    status: 7,
    billNumber: 8,
    imageUrl: 9,
};
const HEADER_ROW = ['Order ID', 'Date of Issue', 'Product', 'Pieces', 'File Number', 'Karigar Name', 'Status', 'Number in Bill', 'Image URL'];


// Main function to handle GET requests (fetching data)
function doGet(e) {
  try {
    const data = sheet.getDataRange().getValues();
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: data }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Main function to handle POST requests (add, update, delete)
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    
    if (!request.action) {
      throw new Error("No action specified in the request.");
    }

    let result;
    switch(request.action) {
      case 'add':
        result = addOrder(request.payload);
        break;
      case 'update':
        result = updateOrder(request.payload);
        break;
      case 'delete':
        result = deleteOrder(request.payload);
        break;
      default:
        throw new Error("Invalid action specified.");
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', data: result }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: error.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// --- HELPER FUNCTIONS ---

function findRowById(id) {
    const data = sheet.getDataRange().getValues();
    // Start from row 1 to skip the header
    for (let i = 1; i < data.length; i++) {
        if (data[i][COLUMN_MAP.id - 1] == id) {
            return i + 1; // Return the actual row number (1-indexed)
        }
    }
    return -1; // Not found
}

function addOrder(payload) {
    // Ensure the sheet has a header row
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(HEADER_ROW);
    }
    const newId = \`ORD-\${new Date().getTime()}\`;
    const newDate = new Date().toISOString();
    
    const newRowData = [
        newId,
        newDate,
        payload.productDescription,
        payload.pieces,
        payload.fileNumber,
        payload.karigarName,
        'Received', // Default status
        payload.billNumber,
        payload.imageUrl
    ];
    sheet.appendRow(newRowData);
    return newRowData;
}

function updateOrder(payload) {
    const rowNumber = findRowById(payload.id);
    if (rowNumber === -1) {
      throw new Error(\`Order with ID \${payload.id} not found.\`);
    }
    
    const rowData = [
        payload.id,
        new Date(payload.issueDate).toISOString(),
        payload.productDescription,
        payload.pieces,
        payload.fileNumber,
        payload.karigarName,
        payload.status,
        payload.billNumber,
        payload.imageUrl
    ];
    
    // Set the values for the entire row
    sheet.getRange(rowNumber, 1, 1, rowData.length).setValues([rowData]);
    return rowData;
}

function deleteOrder(payload) {
    const rowNumber = findRowById(payload.id);
    if (rowNumber === -1) {
      throw new Error(\`Order with ID \${payload.id} not found.\`);
    }
    sheet.deleteRow(rowNumber);
    return { id: payload.id }; // Confirmation
}
`;

export const GoogleSheetSetup: React.FC<GoogleSheetSetupProps> = ({ onSave, isLoading }) => {
  const [url, setUrl] = useState('');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(appsScriptCode.trim());
    alert('Apps Script code copied to clipboard!');
  };

  const handleSave = () => {
    if (url.trim()) {
      onSave(url.trim());
    } else {
      alert('Please enter a valid Web App URL.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-brand-dark-light border border-brand-gray/50 rounded-2xl shadow-2xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-white text-center">Connect to Google Sheets</h1>
        <p className="text-center text-gray-300">
          Follow these one-time setup steps to link this dashboard to your Google Sheet in real-time.
        </p>
        
        <div className="space-y-4 text-gray-300">
          <details className="bg-brand-dark p-4 rounded-lg border border-brand-gray">
            <summary className="font-semibold text-lg cursor-pointer text-brand-gold-light">Step 1: Set Up Your Google Sheet</summary>
            <div className="mt-4 space-y-2">
              <p>1. Create a new Google Sheet at <a href="https://sheets.new" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">sheets.new</a>.</p>
              <p>2. Name the first tab (at the bottom) exactly: <strong className="text-white">Orders</strong></p>
              <p>3. Create the following headers in the first row, in this exact order:</p>
              <code className="block bg-black/50 p-3 rounded-md text-sm whitespace-pre-wrap">Order ID, Date of Issue, Product, Pieces, File Number, Karigar Name, Status, Number in Bill, Image URL</code>
            </div>
          </details>

          <details className="bg-brand-dark p-4 rounded-lg border border-brand-gray">
            <summary className="font-semibold text-lg cursor-pointer text-brand-gold-light">Step 2: Create the Google Apps Script</summary>
            <div className="mt-4 space-y-4">
              <p>1. In your Google Sheet, go to <strong className="text-white">Extensions &gt; Apps Script</strong>.</p>
              <p>2. Delete any boilerplate code in the editor and paste in the complete code provided below.</p>
              <div className="relative">
                <textarea readOnly value={appsScriptCode.trim()} rows={10} className="w-full bg-black/50 p-3 rounded-md text-sm text-gray-400 font-mono focus:outline-none"></textarea>
                <button onClick={handleCopyCode} className="absolute top-2 right-2 bg-brand-gray hover:bg-brand-gray/80 text-white font-semibold py-1 px-3 text-xs rounded-md">Copy Code</button>
              </div>
              <p>3. Save the script project (click the floppy disk icon).</p>
            </div>
          </details>

          <details className="bg-brand-dark p-4 rounded-lg border border-brand-gray">
            <summary className="font-semibold text-lg cursor-pointer text-brand-gold-light">Step 3: Deploy as a Web App</summary>
            <div className="mt-4 space-y-2">
              <p>1. Click the blue <strong className="text-white">"Deploy"</strong> button, then select <strong className="text-white">"New deployment"</strong>.</p>
              <p>2. Click the gear icon next to "Select type" and choose <strong className="text-white">"Web app"</strong>.</p>
              <p>3. For "Who has access", select <strong className="text-white">"Anyone"</strong>. <span className="text-yellow-400 text-sm">(This allows the dashboard to access it. Your sheet is still private.)</span></p>
              <p>4. Click <strong className="text-white">"Deploy"</strong>. You will be asked to <strong className="text-white">Authorize access</strong>. Follow the prompts, choosing your Google account, and clicking "Allow" on the warning screen.</p>
              <p>5. After deployment, copy the <strong className="text-white">Web app URL</strong>. This is what connects the dashboard to your sheet.</p>
            </div>
          </details>
        </div>

        <div className="pt-4 space-y-2">
            <label htmlFor="webAppUrl" className="block text-sm font-medium text-gray-300">Paste your Web App URL here:</label>
             <div className="flex items-center space-x-2">
                 <input
                    type="url"
                    id="webAppUrl"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/..."
                    className="flex-grow bg-brand-dark border border-brand-gray rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-brand-gold focus:border-brand-gold"
                />
                <button 
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center justify-center bg-brand-gold hover:bg-brand-gold-light text-brand-dark font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isLoading ? (
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <IconSave className="w-5 h-5 mr-2" />
                    )}
                    Connect
                </button>
            </div>
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm rounded-lg p-3 flex items-start space-x-3">
              <IconAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>This URL is sensitive. It will be saved securely in your browser's local storage and will not be shared.</p>
            </div>
        </div>

      </div>
    </div>
  );
};