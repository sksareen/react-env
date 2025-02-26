// Simplified JSX renderer to replace the existing one
// This version focuses on robust TypeScript handling and error reporting

import React, { useState, useCallback } from 'react';
import * as Babel from '@babel/standalone';
import { ErrorBoundary } from 'react-error-boundary';
import { processJSX } from './custom-jsx-parser';

// Simple error display component
const ErrorDisplay = ({ error }) => (
  <div style={{ color: 'red', padding: '15px', border: '1px solid red', borderRadius: '4px', margin: '10px 0' }}>
    <h3>Error Rendering Component:</h3>
    <pre style={{ overflow: 'auto', maxHeight: '300px' }}>{error.message || error.toString()}</pre>
  </div>
);

function SimplifiedJSXRenderer({ code, availableModules = {} }) {
  const [component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  
  const renderCode = useCallback(() => {
    if (!code) {
      setError(new Error('No code provided'));
      return;
    }
    
    try {
      // Step 1: Process TypeScript and fix common issues
      console.log('Original code:', code);
      const processedCode = processJSX(code);
      console.log('Processed code:', processedCode);
      
      // Step 2: Transform with Babel
      const transformedCode = Babel.transform(processedCode, {
        presets: ['react', 'env'],
        filename: 'virtual.js'
      }).code;
      console.log('Transformed code:', transformedCode);
      
      // Step 3: Create a scope with all required dependencies
      const scopeWithReact = {
        React,
        ...React, // Spread React hooks and utilities
        ...availableModules
      };
      
      // Step 4: Create a function from the transformed code
      const moduleKeys = Object.keys(scopeWithReact);
      const moduleValues = Object.values(scopeWithReact);
      
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const createComponentFn = new AsyncFunction(
        ...moduleKeys,
        `
        try {
          // Setup module environment
          const module = { exports: {} };
          const exports = {};
          
          // Execute the transformed code
          ${transformedCode}
          
          // Extract the component
          let ComponentToRender = null;
          
          // Try to find the component in various ways
          if (typeof Component !== 'undefined') {
            ComponentToRender = Component;
          } else if (typeof module.exports === 'function') {
            ComponentToRender = module.exports;
          } else if (module.exports.default) {
            ComponentToRender = module.exports.default;
          } else {
            // Look for any exported component (capital letters)
            for (const key in module.exports) {
              if (key[0] === key[0].toUpperCase()) {
                ComponentToRender = module.exports[key];
                break;
              }
            }
            
            // As a last resort, look for any capital-named function in this scope
            if (!ComponentToRender) {
              for (const key in this) {
                if (key[0] === key[0].toUpperCase() && 
                    typeof this[key] === 'function' &&
                    key !== 'React' && 
                    key !== 'Component') {
                  ComponentToRender = this[key];
                  break;
                }
              }
            }
          }
          
          if (!ComponentToRender) {
            throw new Error('No React component found. Make sure your code exports a component or defines a component named "Component".');
          }
          
          return React.createElement(ComponentToRender);
        } catch (err) {
          throw new Error('Error creating component: ' + err.message);
        }
        `
      );
      
      // Step 5: Execute the function with all dependencies
      createComponentFn(...moduleValues)
        .then(renderedComponent => {
          setComponent(renderedComponent);
          setError(null);
        })
        .catch(err => {
          console.error('Component execution error:', err);
          setError(err);
        });
    } catch (err) {
      console.error('JSX processing error:', err);
      setError(err);
    }
  }, [code, availableModules]);
  
  // Render the code on first load
  React.useEffect(() => {
    renderCode();
  }, [renderCode]);
  
  if (error) {
    return <ErrorDisplay error={error} />;
  }
  
  if (!component) {
    return <div>Loading component...</div>;
  }
  
  return (
    <ErrorBoundary FallbackComponent={ErrorDisplay}>
      <div style={{ padding: '10px' }}>
        {component}
      </div>
    </ErrorBoundary>
  );
}

export default SimplifiedJSXRenderer;