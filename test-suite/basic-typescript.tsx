// Test 3: Basic TypeScript
// Tests basic TypeScript interfaces and type annotations

import React from 'react';

interface ButtonProps {
  label: string;
  onClick: () => void;
}

function Button({ label, onClick }: ButtonProps) {
  return (
    <button onClick={onClick}>{label}</button>
  );
}

function BasicTypeScript() {
  const handleClick = (): void => {
    alert('Button clicked!');
  };
  
  return (
    <div>
      <h2>Basic TypeScript Test</h2>
      <Button label="Click Me" onClick={handleClick} />
    </div>
  );
}

export default BasicTypeScript;