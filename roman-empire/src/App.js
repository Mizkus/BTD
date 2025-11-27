import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import IntroPanel from './components/IntroPanel';
import MainPanel from './components/MainPanel';
import ConclusionPanel from './components/ConclusionPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/description" replace />} />
          <Route path="/intro" element={<IntroPanel />} />
          <Route path="/description" element={<MainPanel />} />
          <Route path="/conclusion" element={<ConclusionPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
