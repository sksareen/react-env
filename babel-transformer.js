// Custom Babel transformer for TypeScript and JSX
// This completely bypasses TypeScript type checking
// and focuses on stripping types for runtime

const babel = require('@babel/standalone');

// Custom TypeScript transformer
function transformTypeScript(code) {
  // Step 1: Handle TypeScript interfaces, types, and annotations
  const removeTypeScript = (code) => {
    // Remove entire interface blocks
    code = code.replace(/interface\s+\w+(\s+extends\s+[\w<>,\s]+)?\s*\{[^{]*?(\{[^{}]*\}[^{]*?)*?\}/gs, '');
    
    // Remove type declarations
    code = code.replace(/type\s+\w+(\s*<[^>]*>)?\s*=\s*[^;]+;/g, '');
    
    // Remove import type statements
    code = code.replace(/import\s+type\s+.*?from\s+['"].*?['"]/g, '');
    
    // Replace TypeScript type annotations in function parameters
    code = code.replace(/(\w+)\s*:\s*[A-Za-z0-9_<>[\]|&.]+/g, '$1');
    
    // Remove return type annotations
    code = code.replace(/\)\s*:\s*[A-Za-z0-9_<>[\]|&.]+(\s*=>|\s*\{)/g, ')$1');
    
    // Remove generic type parameters
    code = code.replace(/<[^<>]*>/g, '');
    
    // Remove type assertions
    code = code.replace(/\s+as\s+[A-Za-z0-9_<>[\]|&.]+/g, '');
    
    return code;
  };
  
  // Step 2: Fix common syntax problems
  const fixSyntax = (code) => {
    // Fix function declarations
    code = code.replace(/(?<!\w)const\s+(\w+)\s*=\s*\(\s*\)\s*\{/g, 'const $1 = () => {');
    code = code.replace(/(?<!\w)const\s+(\w+)\s*=\s*\(([^()]*)\)\s*\{/g, 'const $1 = ($2) => {');
    
    // Fix missing parentheses in function calls
    code = code.replace(/useState\(([^)]+)\s*\}/g, 'useState($1)');
    code = code.replace(/set\w+\(([^)]+)\s*\}/g, 'set$1)');
    
    // Fix incomplete JSX
    code = code.replace(/<([A-Z]\w+)[^>]*>\s*([^<]*)</g, (match, tag, content) => {
      return match.includes(`</${tag}`) ? match : match.replace(/>([^<]*)$/, `>$1</${tag}>`);
    });
    
    // Fix braces/parentheses confusion in object literals
    code = code.replace(/\{\s*(\w+)\),\s*(\w+)\)/g, '{ $1, $2 }');
    
    // Fix useState syntax errors
    code = code.replace(/(\w+)\s*=\s*useState\(([^)]*)\)(?!\s*;)/g, '$1 = useState($2);');
    
    // Fix attribute values in JSX
    code = code.replace(/(\w+)=\{([^{}]*)\)/g, '$1={$2}');
    
    return code;
  };
  
  // Step 3: Normalize and cleanup
  const cleanup = (code) => {
    // Remove empty objects
    code = code.replace(/\{\s*\}/g, '{}');
    
    // Fix trailing commas
    code = code.replace(/,\s*\}/g, ' }');
    code = code.replace(/,\s*\]/g, ' ]');
    
    // Fix double semicolons
    code = code.replace(/;;/g, ';');
    
    return code;
  };
  
  // Apply all transformations
  return cleanup(fixSyntax(removeTypeScript(code)));
}

// Wrap Babel transformation
function transformWithBabel(code, options = {}) {
  // First pre-process TypeScript
  const processedCode = transformTypeScript(code);
  
  // Then use Babel to transform JSX
  try {
    const result = babel.transform(processedCode, {
      presets: ['react', 'env'],
      plugins: [],
      ...options
    });
    
    return {
      code: result.code,
      success: true,
      error: null
    };
  } catch (error) {
    return {
      code: processedCode,
      success: false,
      error: error.message
    };
  }
}

// Export the transformer
module.exports = {
  transformTypeScript,
  transformWithBabel
};