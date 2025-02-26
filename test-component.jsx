import React, { useState } from 'react';

// A very simple component with minimal syntax to test rendering
function TestComponent() {
  // Basic state with useState hook
  const [count, setCount] = useState(0);
  
  // Simple function with explicit arrow function syntax
  const increment = () => {
    setCount(count + 1);
  };
  
  // Simple function with explicit arrow function syntax
  const decrement = () => {
    setCount(count - 1);
  };
  
  // Very basic JSX with minimal nesting
  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>Simple Counter Component</h2>
      <p>Current count: {count}</p>
      <button onClick={increment} style={{ margin: '5px' }}>
        Increment
      </button>
      <button onClick={decrement} style={{ margin: '5px' }}>
        Decrement
      </button>
    </div>
  );
}

// Default export
export default TestComponent;