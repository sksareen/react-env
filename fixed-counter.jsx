// Fixed version of the TypeScript counter - ready to run

import React, { useState } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

function Component({ initialValue = 0, step = 1 }) {
  const [count, setCount] = useState(initialValue);
  
  const increment = () => {
    setCount(prevCount => prevCount + step);
  };
  
  const decrement = () => {
    setCount(prevCount => prevCount - step);
  };
  
  return (
    <Box sx={{ textAlign: 'center', p: 3 }}>
      <Typography variant="h4" gutterBottom>Counter: {count}</Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<Add />}
        onClick={increment}
        sx={{ mr: 2 }}
      >
        Increment
      </Button>
      
      <Button 
        variant="outlined" 
        color="secondary" 
        startIcon={<Remove />}
        onClick={decrement}
      >
        Decrement
      </Button>
    </Box>
  );
}

export default Component;