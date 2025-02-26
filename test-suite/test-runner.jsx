// Test Runner - Central file to orchestrate tests

import React, { useState, useEffect } from 'react';
import runManualTest from './manual-test.js';

function TestRunner() {
  const [results, setResults] = useState({
    fileLoading: null,
    basicJsx: null,
    hooksJsx: null,
    typescript: null,
    babelTransform: null
  });
  
  const [manualResults, setManualResults] = useState(null);
  const [diagnosis, setDiagnosis] = useState('Running tests...');
  
  useEffect(() => {
    // Run manual tests immediately
    try {
      const manualTestResults = runManualTest();
      setManualResults(manualTestResults);
      
      // Update the babel transform result based on manual tests
      setResults(prev => ({
        ...prev,
        babelTransform: manualTestResults.success
      }));
    } catch (error) {
      console.error('Error running manual tests:', error);
      setManualResults({ 
        success: false, 
        error: error.toString(),
        details: [{ 
          name: 'Manual Test Suite', 
          success: false, 
          error: error.toString() 
        }]
      });
      
      setResults(prev => ({
        ...prev,
        babelTransform: false
      }));
    }
    
    // Set up listener for debug messages
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'debug-info') {
        console.log('Received debug info:', event.data.info);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Generate diagnosis when all results are in
  useEffect(() => {
    const allResultsIn = Object.values(results).every(r => r !== null);
    
    if (allResultsIn) {
      let issues = [];
      
      if (!results.fileLoading) {
        issues.push('File loading');
      }
      
      if (!results.basicJsx) {
        issues.push('Basic JSX parsing');
      }
      
      if (!results.hooksJsx && results.basicJsx) {
        issues.push('React hooks usage');
      }
      
      if (!results.typescript) {
        issues.push('TypeScript transformation');
      }
      
      if (!results.babelTransform) {
        issues.push('Babel transformation');
      }
      
      let diagnosisText = '';
      
      if (issues.length === 0) {
        diagnosisText = 'All tests passed! The issue might be with a specific syntax in your components.';
      } else {
        diagnosisText = `Issues detected in: ${issues.join(', ')}. `;
        
        // Specific recommendations
        if (issues.includes('TypeScript transformation')) {
          diagnosisText += 'The JSXRenderer\'s TypeScript preprocessing is likely insufficient. ';
        }
        
        if (issues.includes('Babel transformation')) {
          diagnosisText += 'There might be issues with the Babel standalone library or its configuration. ';
        }
        
        diagnosisText += 'See detailed test results for more information.';
      }
      
      setDiagnosis(diagnosisText);
    }
  }, [results]);
  
  // Simulate user testing each component manually
  const markTestResult = (test, success) => {
    setResults(prev => ({
      ...prev,
      [test]: success
    }));
  };
  
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>JSX Renderer Test Suite</h1>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <h2>Test Status</h2>
        <ul>
          <li>
            File Loading: 
            {results.fileLoading === null ? ' Waiting...' : 
             results.fileLoading ? ' ✅ Success' : ' ❌ Failed'}
            <button 
              onClick={() => markTestResult('fileLoading', true)} 
              style={{ marginLeft: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Success
            </button>
            <button 
              onClick={() => markTestResult('fileLoading', false)}
              style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Failed
            </button>
          </li>
          <li>
            Basic JSX: 
            {results.basicJsx === null ? ' Waiting...' : 
             results.basicJsx ? ' ✅ Success' : ' ❌ Failed'}
            <button 
              onClick={() => markTestResult('basicJsx', true)} 
              style={{ marginLeft: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Success
            </button>
            <button 
              onClick={() => markTestResult('basicJsx', false)}
              style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Failed
            </button>
          </li>
          <li>
            Hooks JSX: 
            {results.hooksJsx === null ? ' Waiting...' : 
             results.hooksJsx ? ' ✅ Success' : ' ❌ Failed'}
            <button 
              onClick={() => markTestResult('hooksJsx', true)} 
              style={{ marginLeft: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Success
            </button>
            <button 
              onClick={() => markTestResult('hooksJsx', false)}
              style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Failed
            </button>
          </li>
          <li>
            TypeScript: 
            {results.typescript === null ? ' Waiting...' : 
             results.typescript ? ' ✅ Success' : ' ❌ Failed'}
            <button 
              onClick={() => markTestResult('typescript', true)} 
              style={{ marginLeft: '10px', background: 'green', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Success
            </button>
            <button 
              onClick={() => markTestResult('typescript', false)}
              style={{ marginLeft: '5px', background: 'red', color: 'white', border: 'none', borderRadius: '3px', padding: '3px 8px' }}
            >
              Mark Failed
            </button>
          </li>
          <li>
            Babel Transform: 
            {results.babelTransform === null ? ' Waiting...' : 
             results.babelTransform ? ' ✅ Success' : ' ❌ Failed'}
          </li>
        </ul>
      </div>
      
      {manualResults && (
        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f8ff', borderRadius: '4px' }}>
          <h2>Babel Manual Test Results</h2>
          <p>
            <strong>Status:</strong> {manualResults.success ? '✅ All Passed' : '❌ Some Failed'}
          </p>
          <p>
            <strong>Pass:</strong> {manualResults.passCount} tests
          </p>
          <p>
            <strong>Fail:</strong> {manualResults.failCount} tests
          </p>
          
          <h3>Test Details:</h3>
          <ul>
            {manualResults.details.map((test, index) => (
              <li key={index}>
                <strong>{test.name}:</strong> {test.success ? '✅ Pass' : '❌ Fail'}
                {test.error && (
                  <pre style={{ margin: '5px 0', padding: '5px', backgroundColor: '#ffeeee', borderRadius: '3px', overflow: 'auto' }}>
                    {test.error.toString()}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
        <h2>Diagnosis</h2>
        <p>{diagnosis}</p>
      </div>
      
      <div>
        <h2>Next Steps</h2>
        <p>Based on the test results, try these solutions:</p>
        <ol>
          <li>
            <strong>If all tests pass except TypeScript:</strong> The JSXRenderer needs to be modified to handle TypeScript syntax better. Check lines 54-66 in JSXRenderer.js.
          </li>
          <li>
            <strong>If Babel transformation is failing:</strong> Ensure @babel/standalone is properly loaded and configured. There might be version compatibility issues.
          </li>
          <li>
            <strong>If basic JSX is failing:</strong> There might be a fundamental issue with the JSX parsing pipeline or browser compatibility.
          </li>
          <li>
            <strong>If file loading is failing:</strong> Check the file loading logic in the Sandbox component's handleDrop function.
          </li>
        </ol>
      </div>
      
      <div style={{ marginTop: '30px' }}>
        <h2>Test Components</h2>
        <p>Drag and drop these files to test individually:</p>
        <ul>
          <li><code>test-suite/basic-jsx.jsx</code> - Basic JSX with no hooks</li>
          <li><code>test-suite/hooks-jsx.jsx</code> - Component with useState hook</li>
          <li><code>test-suite/basic-typescript.tsx</code> - TypeScript component with interfaces</li>
          <li><code>test-suite/debug-console.jsx</code> - Logs debug info to console</li>
        </ul>
      </div>
    </div>
  );
}

export default TestRunner;