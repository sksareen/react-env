// Test 4: Debug Console Output
// This file will log debug information to help diagnose issues

import React, { useEffect } from 'react';

function DebugConsole() {
  useEffect(() => {
    // Log browser and environment information
    console.log('--- Debug Information ---');
    console.log('Browser:', navigator.userAgent);
    console.log('Available Babel:', typeof Babel !== 'undefined' ? 'Yes' : 'No');
    
    // Test simple code transformation
    if (typeof Babel !== 'undefined') {
      try {
        const testCode = 'const x = () => { return 42; };';
        const result = Babel.transform(testCode, {
          presets: ['react', 'env']
        });
        console.log('Babel transform result:', result.code);
      } catch (error) {
        console.error('Babel transform error:', error);
      }
    }
    
    // Display available React features
    console.log('React version:', React.version);
    console.log('useState available:', typeof React.useState === 'function');
    console.log('Available hooks:', 
      Object.keys(React).filter(key => key.startsWith('use')));
    
    // Log this information to the parent window
    if (window.parent) {
      try {
        window.parent.postMessage({ 
          type: 'debug-info',
          info: {
            browser: navigator.userAgent,
            reactVersion: React.version,
            babelAvailable: typeof Babel !== 'undefined'
          }
        }, '*');
      } catch (e) {
        console.log('Could not post to parent window');
      }
    }
  }, []);
  
  return (
    <div>
      <h2>Debug Console Test</h2>
      <p>Check the browser console for diagnostic information.</p>
    </div>
  );
}

export default DebugConsole;