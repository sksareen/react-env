// A simplified TypeScript-to-JavaScript transformer
// This is an alternative to JSXRenderer's existing TypeScript handling

function parseTypeScript(code) {
  let processed = code;
  
  // Step 1: Track string literals to avoid modifying code inside them
  const stringLiterals = [];
  processed = processed.replace(/'([^'\\]|\\.)*'|"([^"\\]|\\.)*"|`([^`\\]|\\.)*`/g, match => {
    stringLiterals.push(match);
    return `__STRING_LITERAL_${stringLiterals.length - 1}__`;
  });
  
  // Step 2: Remove TypeScript interface, type, and enum declarations
  processed = processed
    // Remove entire interface blocks
    .replace(/interface\s+\w+\s*(\extends\s+\w+)?\s*\{[^{]*?(?:\{[^{]*?\}[^{]*?)*?\}/gs, '')
    // Remove type declarations
    .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
    // Remove enum declarations
    .replace(/enum\s+\w+\s*\{[^}]*\}/g, '');
  
  // Step 3: Remove parameter type annotations
  processed = processed
    // Remove function parameter types
    .replace(/(\w+)\s*:\s*([A-Za-z0-9_<>[\]|&.]+)/g, '$1')
    // Remove generic type parameters in function declarations
    .replace(/<[^<>()]*>/g, '');
  
  // Step 4: Remove return type annotations
  processed = processed
    .replace(/\)\s*:\s*([A-Za-z0-9_<>[\]|&.]+)(\s*=>|\s*\{)/g, ')$2');
  
  // Step 5: Remove 'as' type assertions
  processed = processed
    .replace(/\s+as\s+[A-Za-z0-9_<>[\]|&.]+/g, '');
  
  // Step 6: Restore string literals
  processed = processed.replace(/__STRING_LITERAL_(\d+)__/g, (_, index) => {
    return stringLiterals[parseInt(index, 10)];
  });
  
  return processed;
}

// Function to fix common syntax errors in JSX/React code
function fixCommonSyntaxErrors(code) {
  let processed = code;
  
  // Fix missing arrow function syntax
  processed = processed.replace(/(\w+)\s*=\s*\(\s*\)\s*\{/g, '$1 = () => {');
  
  // Fix object braces/parens confusion
  processed = processed.replace(/\{\s*(\w+)\),\s*(\w+)\)/g, '{ $1, $2 }');
  
  // Fix useState syntax errors
  processed = processed.replace(/useState\(([^)]*)\s*\}/g, 'useState($1)');
  
  // Fix JSX attribute issues
  processed = processed.replace(/=\s*\{([^{}]*)\)/g, '={$1}');
  
  // Fix unclosed JSX tags
  const jsxTagsRegex = /<(\w+)([^<>]*)>([^<>]*)</g;
  let match;
  while ((match = jsxTagsRegex.exec(processed)) !== null) {
    const [fullMatch, tagName, attrs, content] = match;
    if (!fullMatch.includes(`</${tagName}`)) {
      // This is an unclosed tag
      const fixedTag = fullMatch.replace(/<(\w+)([^<>]*)>([^<>]*)</, '<$1$2>$3</$1><');
      processed = processed.replace(fullMatch, fixedTag);
    }
  }
  
  return processed;
}

// A complete JSX processing pipeline
function processJSX(code) {
  // Step 1: Determine if this is TypeScript
  const isTypeScript = 
    code.includes('interface ') || 
    code.includes('type ') || 
    code.includes(': ') ||
    code.includes('as ') ||
    code.includes('<T>');
  
  // Step 2: Apply the appropriate transformations
  let processed = code;
  
  if (isTypeScript) {
    processed = parseTypeScript(processed);
  }
  
  // Step 3: Fix common syntax errors
  processed = fixCommonSyntaxErrors(processed);
  
  // Step 4: Balance braces, brackets, and parentheses
  const pairs = { '{': '}', '[': ']', '(': ')' };
  const stack = [];
  
  for (let i = 0; i < processed.length; i++) {
    const char = processed[i];
    
    if ('{[('.includes(char)) {
      stack.push(char);
    } else if ('}])'.includes(char)) {
      const expected = pairs[stack.pop()];
      if (char !== expected) {
        // Mismatched closing bracket
        console.warn(`Mismatched brackets at position ${i}: expected ${expected}, got ${char}`);
      }
    }
  }
  
  // Add missing closing brackets at the end
  if (stack.length > 0) {
    const missing = stack.map(bracket => pairs[bracket]).reverse().join('');
    processed += ` ${missing} // Added missing closing brackets`;
  }
  
  return processed;
}

export { parseTypeScript, fixCommonSyntaxErrors, processJSX };