// Simple test script to run our custom TypeScript parser
// This can be executed with node to validate the parser works

const fs = require('fs');
const path = require('path');

// Simple implementation of our TypeScript parser
function parseTypeScript(code) {
  let processed = code;
  
  // Remove TypeScript interfaces
  processed = processed.replace(/interface\s+\w+\s*\{[^}]*\}/g, '');
  
  // Remove type declarations
  processed = processed.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
  
  // Remove parameter type annotations
  processed = processed.replace(/(\w+)\s*:\s*[^,)]+/g, '$1');
  
  // Remove return type annotations
  processed = processed.replace(/\)\s*:\s*[^{]+/g, ') ');
  
  // Remove generic type parameters
  processed = processed.replace(/<([^<>]*)>/g, '');
  
  return processed;
}

// Fix common function syntax errors
function fixSyntaxErrors(code) {
  let processed = code;
  
  // Fix missing arrow function syntax
  processed = processed.replace(/const\s+(\w+)\s*=\s*\(\s*\)\s*\{/g, 'const $1 = () => {');
  
  // Fix object braces/parens confusion
  processed = processed.replace(/\{\s*(\w+)\),\s*(\w+)\)/g, '{ $1, $2 }');
  
  return processed;
}

// Main test function
function testParser(inputFile) {
  try {
    // Read the input file
    const code = fs.readFileSync(inputFile, 'utf8');
    console.log('Original code length:', code.length);
    
    // Apply the TypeScript parser
    const tsProcessed = parseTypeScript(code);
    console.log('After TypeScript processing:', tsProcessed.length);
    
    // Apply syntax fixes
    const finalProcessed = fixSyntaxErrors(tsProcessed);
    console.log('After syntax fixes:', finalProcessed.length);
    
    // Write the processed code to a new file
    const outputFile = inputFile.replace(/\.\w+$/, '.processed.js');
    fs.writeFileSync(outputFile, finalProcessed);
    console.log('Processed code written to:', outputFile);
    
    return {
      success: true,
      inputLength: code.length,
      outputLength: finalProcessed.length,
      outputFile
    };
  } catch (error) {
    console.error('Error processing file:', error);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// If this script is run directly, process the file specified as argument
if (require.main === module) {
  const inputFile = process.argv[2];
  
  if (!inputFile) {
    console.error('Usage: node test.js <input-file>');
    process.exit(1);
  }
  
  const result = testParser(inputFile);
  
  if (result.success) {
    console.log('Success! Processed TypeScript code.');
    process.exit(0);
  } else {
    console.error('Failed to process TypeScript code:', result.error);
    process.exit(1);
  }
}

module.exports = {
  parseTypeScript,
  fixSyntaxErrors,
  testParser
};