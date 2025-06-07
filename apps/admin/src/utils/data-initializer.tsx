'use client';

import { useEffect } from 'react';

export function DataInitializer() {
  useEffect(() => {
    // Call the API to initialize data when the app starts
    const initializeData = async () => {
      try {
        console.log('AdminApp: Initializing data from server...');
        const response = await fetch('/api/initialize');
        
        if (!response.ok) {
          throw new Error(`Failed to initialize data: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('AdminApp: Data initialization result:', result);
      } catch (error) {
        console.error('AdminApp: Failed to initialize data:', error);
      }
    };

    initializeData();
  }, []);

  return null; // This component doesn't render anything
}
