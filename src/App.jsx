// src/App.jsx
import { Map } from './components/Map';
import { SOSEmergency } from './components/SOSEmergency';
import './App.css';

function App() {
  return (
    <div className="w-full h-screen bg-gray-900 dark">
      <Map />
      <SOSEmergency />
    </div>
  );
}

export default App;
