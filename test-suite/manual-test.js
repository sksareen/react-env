// Manual test script to test the JSXRenderer directly
// This bypasses the file loading and tests the transformation directly

import React from 'react';
import * as Babel from '@babel/standalone';
import ReactDOM from 'react-dom';
import rawJsxString from './raw-jsx-string.js';

function runManualTest() {
  // Record test results
  const results = {
    tests: [],
    addResult: function(name, success, error = null, output = null) {
      this.tests.push({ name, success, error, output });
      console.log(`Test: ${name} - ${success ? 'SUCCESS' : 'FAILED'}`);
      if (error) console.error(error);
      if (output) console.log(output);
    }
  };

  // Test 1: Basic Babel transformation
  try {
    const basicCode = `function Simple() { return <div>Hello</div>; }`;
    const transformed = Babel.transform(basicCode, {
      presets: ['react']
    }).code;
    
    results.addResult(
      'Basic Babel Transform', 
      true, 
      null, 
      transformed
    );
  } catch (error) {
    results.addResult('Basic Babel Transform', false, error);
  }
  
  // Test 2: Transform raw JSX string
  try {
    const transformed = Babel.transform(rawJsxString, {
      presets: ['react']
    }).code;
    
    results.addResult(
      'Raw JSX String Transform', 
      true, 
      null, 
      transformed
    );
  } catch (error) {
    results.addResult('Raw JSX String Transform', false, error);
  }
  
  // Test 3: Try to create a function from transformed code
  try {
    const transformed = Babel.transform(rawJsxString, {
      presets: ['react']
    }).code;
    
    // Use Function constructor to create a component
    const createComponent = new Function(
      'React', 
      `
      ${transformed}
      return RawJSXComponent;
      `
    );
    
    const Component = createComponent(React);
    results.addResult(
      'Create Component from String', 
      typeof Component === 'function',
      null,
      typeof Component
    );
  } catch (error) {
    results.addResult('Create Component from String', false, error);
  }
  
  // Test 4: TypeScript-like code
  try {
    const tsCode = `
    interface Props {
      name: string;
    }
    
    function TypedComponent({ name }: Props) {
      return <div>Hello {name}</div>;
    }`;
    
    // First try to preprocess TypeScript manually
    const preprocessed = tsCode
      .replace(/interface\s+\w+\s*\{[^}]*\}/g, '')
      .replace(/(\w+)\s*:\s*[^,)]+/g, '$1');
    
    const transformed = Babel.transform(preprocessed, {
      presets: ['react']
    }).code;
    
    results.addResult(
      'TypeScript Preprocessing', 
      true, 
      null, 
      { preprocessed, transformed }
    );
  } catch (error) {
    results.addResult('TypeScript Preprocessing', false, error);
  }
  
  // Return formatted results
  return {
    success: results.tests.every(t => t.success),
    passCount: results.tests.filter(t => t.success).length,
    failCount: results.tests.filter(t => !t.success).length,
    details: results.tests
  };
}

export default runManualTest;