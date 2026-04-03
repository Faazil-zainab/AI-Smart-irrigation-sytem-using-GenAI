import React from 'react';
import IrrigationDashboard from './pages/IrrigationDashboard';
import './App.css';

/**
 * Root React Application Component
 * Initializes the AI Irrigation Dashboard
 */
function App() {
  return (
    <div className="app">
      <IrrigationDashboard />
    </div>
  );
}

export default App;
