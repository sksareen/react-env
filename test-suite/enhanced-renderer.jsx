// Enhanced renderer that combines our custom parser with the original
// This is a drop-in replacement for JSXRenderer that should be more robust

import React, { useState, useEffect, useCallback } from 'react';
import * as Babel from '@babel/standalone';
import { ErrorBoundary } from 'react-error-boundary';
import { Typography, Box, Alert, Button } from '@mui/material';
import { processJSX } from './custom-jsx-parser';

// Error display component
const ErrorFallback = ({ error }) => {
  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <Typography variant="h6">Something went wrong:</Typography>
      <pre style={{ overflow: 'auto', maxHeight: '200px' }}>{error.message}</pre>
    </Alert>
  );
};

const EnhancedRenderer = ({ code, availableModules = {}, onError = null }) => {
  const [renderedComponent, setRenderedComponent] = useState(null);
  const [error, setError] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    originalCode: '',
    processedCode: '',
    transformedCode: '',
    phase: ''
  });
  
  const compileAndRender = useCallback(() => {
    if (!code) return;
    
    setIsProcessing(true);
    setDebugInfo({ ...debugInfo, originalCode: code, phase: 'Processing TypeScript' });
    
    try {
      // Step 1: Process TypeScript and syntax fixes with our enhanced parser
      const processedCode = processJSX(code);
      setDebugInfo(prev => ({ ...prev, processedCode, phase: 'Babel Transform' }));
      
      // Step 2: Transform with Babel
      const transformedCode = Babel.transform(processedCode, {
        presets: [
          ['react'], 
          ['env', { modules: false, loose: true }]
        ],
        plugins: [
          ['transform-modules-umd']
        ],
      }).code;
      
      setDebugInfo(prev => ({ ...prev, transformedCode, phase: 'Creating Component' }));
      
      // Step 3: Create function with the transformed code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      
      // Create a scope with all required modules
      const scopeModules = {
        React,
        // Add all React hooks explicitly
        ...React,
        ...availableModules
      };
      
      const modulesArgs = Object.keys(scopeModules);
      const moduleValues = Object.values(scopeModules);
      
      const createComponent = new AsyncFunction(
        ...modulesArgs,
        `
        try {
          // Create a module environment
          let exports = {};
          let module = { exports };
          
          // Execute the transformed code
          ${transformedCode}
          
          // Function to extract the component
          const extractComponent = () => {
            // Try different ways to find the component
            
            // Option 1: Component defined in global scope
            if (typeof Component !== 'undefined') {
              return Component;
            }
            
            // Option 2: Default export
            if (typeof exports.default !== 'undefined') {
              return exports.default;
            }
            
            // Option 3: Named export called Component
            if (typeof exports.Component !== 'undefined') {
              return exports.Component;
            }
            
            // Option 4: module.exports is the component
            if (typeof module.exports === 'function') {
              return module.exports;
            }
            
            // Option 5: Named export with capital first letter
            for (const key in exports) {
              if (key[0] === key[0].toUpperCase() && typeof exports[key] === 'function') {
                return exports[key];
              }
            }
            
            // Option 6: Any capital-named function in scope
            for (const key in this) {
              if (key[0] === key[0].toUpperCase() && 
                  typeof this[key] === 'function' && 
                  key !== 'React' && 
                  key !== 'Component') {
                return this[key];
              }
            }
            
            throw new Error("No React component found. Make sure your component is named 'Component' or exported as default.");
          };
          
          // Extract and render the component
          const ComponentToRender = extractComponent();
          return React.createElement(ComponentToRender);
        } catch (err) {
          console.error("Error in component rendering:", err);
          throw new Error("Error rendering component: " + err.message);
        }
        `
      );
      
      // Execute the function with all modules
      createComponent(...moduleValues)
        .then(component => {
          setRenderedComponent(component);
          setError(null);
          setIsProcessing(false);
          setDebugInfo(prev => ({ ...prev, phase: 'Rendered Successfully' }));
        })
        .catch(err => {
          console.error("Runtime error:", err);
          setError(err);
          setRenderedComponent(null);
          setIsProcessing(false);
          setDebugInfo(prev => ({ ...prev, phase: 'Runtime Error' }));
          
          if (onError) onError(err);
        });
    } catch (err) {
      console.error("Compilation error:", err);
      setError(err);
      setRenderedComponent(null);
      setIsProcessing(false);
      setDebugInfo(prev => ({ ...prev, phase: 'Compilation Error' }));
      
      if (onError) onError(err);
    }
  }, [code, availableModules, onError, debugInfo]);
  
  // Initial render
  useEffect(() => {
    if (code) {
      compileAndRender();
    }
  }, [code, compileAndRender]);
  
  const handleRetry = () => {
    compileAndRender();
  };
  
  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {error ? (
          <Box>
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="h6">Compilation Error:</Typography>
              <pre style={{ overflow: 'auto', maxHeight: '200px' }}>{error.toString()}</pre>
            </Alert>
            <Button variant="contained" color="primary" onClick={handleRetry} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Try Again'}
            </Button>
          </Box>
        ) : isProcessing ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography>Processing Component... ({debugInfo.phase})</Typography>
          </Box>
        ) : renderedComponent ? (
          <Box sx={{ p: 2 }}>{renderedComponent}</Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">No component rendered yet</Typography>
          </Box>
        )}
      </ErrorBoundary>
      
      {/* Debugging information (hidden in production) */}
      {process.env.NODE_ENV !== 'production' && (
        <Box sx={{ mt: 3, display: 'none' }}>
          <Typography variant="h6">Debug Information:</Typography>
          <Typography variant="body2">Phase: {debugInfo.phase}</Typography>
          <Typography variant="subtitle2">Processed Code:</Typography>
          <pre style={{ fontSize: '12px', maxHeight: '200px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '8px' }}>
            {debugInfo.processedCode}
          </pre>
        </Box>
      )}
    </Box>
  );
};

export default EnhancedRenderer;