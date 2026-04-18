# 💰 xk | Personal Money Tracker

A high-performance, responsive React application for tracking personal finances, featuring a serverless architecture using Google Sheets as a database and secured with Google OAuth 2.0.

Live Demo: [https://christin-plakkal.github.io/MoneyTracingApp/](https://christin-plakkal.github.io/MoneyTracingApp/)

## 🚀 Key Features
- **Google Sign-In**: Enterprise-grade security restricted to a specific authorized email.
- **Google Sheets Backend**: Real-time data storage in your personal spreadsheet—no database servers required.
- **Dynamic Dashboard**: 
  - Real-time totals for **Income**, **Expenses**, and **Charity**.
  - Specialized **Group Expense** tracking (Total vs. My Actual Share).
- **Transaction Management**: 
  - Add, View, and **Delete** transactions directly from the UI.
  - Automatic filtering by Year and Month.
- **Category Control**: Add new spending categories on the fly, synced directly to the sheet.
- **Localized**: Formatted for Indian Rupees (₹) with `en-IN` number grouping.

## 🛠 Technical Stack
- **Frontend**: 
  - **React 19** (Vite-powered)
  - **Tailwind CSS 4** (Modern, utility-first styling)
  - **Lucide-React** (Beautiful, consistent iconography)
- **Backend/Storage**: 
  - **Google Apps Script** (Web App API layer)
  - **Google Sheets** (Database layer)
- **Authentication**: 
  - **Google Identity Services** (`@react-oauth/google`)
  - **JWT Decode** (Secure profile parsing)
- **Hosting**: 
  - **GitHub Pages** (Continuous Deployment via `gh-pages`)

## 📋 Implementation & Setup

### 1. Google Sheets Configuration
1. Create a new Google Sheet.
2. Open `Extensions > Apps Script`.
3. Paste the code from `/backend/Code.gs` into the editor.
4. Deploy as a **Web App**:
   - Execute as: `Me`
   - Access: `Anyone`
5. Copy the **Web App URL**.

### 2. Authentication Setup (Google Cloud Console)
1. Create a project at [Google Cloud Console](https://console.cloud.google.com/).
2. Setup OAuth 2.0 Client ID for a **Web Application**.
3. Add Authorized JavaScript Origins:
   - `http://localhost:5173`
   - `https://christin-plakkal.github.io`
4. Copy the **Client ID**.

### 3. Application Configuration
Update `src/config.js` with your specific credentials:
```javascript
export const CONFIG = {
  APPS_SCRIPT_URL: 'YOUR_APPS_SCRIPT_WEB_APP_URL',
  ALLOWED_EMAIL: 'your-email@gmail.com',
  GOOGLE_CLIENT_ID: 'your-client-id.apps.googleusercontent.com'
};
```

## 💻 Development & Deployment

### Local Development
```bash
npm install
npm run dev
```

### Production Deployment
```bash
npm run deploy
```

## 🔒 Security & Privacy
The application employs a "Double-Lock" security model:
1. **Frontend Lock**: The React state is inaccessible until a valid Google Login is provided.
2. **Whitelist Lock**: Even with a valid Google login, the app strictly validates the user's email against the `ALLOWED_EMAIL` constant before rendering any financial data.
