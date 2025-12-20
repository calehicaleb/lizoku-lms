
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("FATAL: Could not find root element to mount to. Ensure index.html has a <div id='root'></div>");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("Lizoku LMS initialized successfully.");
  } catch (error) {
    console.error("LIZOKU_INIT_ERROR: Failed to mount the React application:", error);
    rootElement.innerHTML = `
      <div style="padding: 40px; font-family: sans-serif; text-align: center; background: #fff; min-h-screen;">
        <h1 style="color: #d9534f; font-size: 2rem; margin-bottom: 1rem;">Failed to load the app</h1>
        <p style="color: #666; max-width: 500px; margin: 0 auto 2rem;">A runtime error occurred during initialization. This is usually caused by a dependency resolution issue in the browser preview.</p>
        <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; font-family: monospace; margin-bottom: 2rem; border: 1px solid #ddd; display: inline-block; text-align: left;">
          ${(error as Error).message}
        </div>
        <br/>
        <button onclick="window.location.reload()" style="padding: 12px 24px; cursor: pointer; background: #FFD700; border: none; border-radius: 8px; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">Reload Application</button>
      </div>
    `;
  }
}
