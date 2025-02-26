// Test 2: React Hooks
// Tests basic React hooks without complex JSX

import React, { useState } from 'react';

function HooksJSX() {
  const [message, setMessage] = useState("Initial message");
  
  return (
    <div>
      <h2>Hooks JSX Test</h2>
      <p>{message}</p>
      <button onClick={() => setMessage("Updated message")}>
        Update Message
      </button>
    </div>
  );
}

export default HooksJSX;