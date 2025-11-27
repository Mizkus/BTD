import { useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import IntroPanel from './components/IntroPanel';
import MainPanel from './components/MainPanel';
import ConclusionPanel from './components/ConclusionPanel';
import PostsPanel from './components/PostsPanel';
import ApiPanel from './components/ApiPanel';
import StatsPanel from './components/StatsPanel';

import './App.css';

const PAGE_IDS = {
  '/intro': 1,
  '/description': 2,
  '/conclusion': 3,
  '/api': 4,
};

const KPI_VISIT_URL = 'http://127.0.0.1:8000/kpi/visit';
const KPI_TIME_URL = 'http://127.0.0.1:8000/kpi/time';

function App() {
  const location = useLocation();
  const startTimeRef = useRef(Date.now());
  const currentPageIdRef = useRef(null);

  useEffect(() => {
    const pageId = PAGE_IDS[location.pathname];
    if (!pageId) {
      currentPageIdRef.current = null;
      return undefined;
    }

    axios.post(KPI_VISIT_URL, { page_id: pageId }).catch((error) => {
      console.error('Visit tracking failed', error);
    });

    startTimeRef.current = Date.now();
    currentPageIdRef.current = pageId;

    return () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (duration > 0 && currentPageIdRef.current) {
        axios
          .post(KPI_TIME_URL, {
            page_id: currentPageIdRef.current,
            seconds: duration,
          })
          .catch((error) => console.error('Time tracking failed', error));
      }
    };
  }, [location.pathname]);

  useEffect(() => {
    const handleUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const pageId = currentPageIdRef.current;
      if (pageId && duration > 0) {
        const payload = JSON.stringify({ page_id: pageId, seconds: duration });
        const blob = new Blob([payload], { type: 'application/json' });
        navigator.sendBeacon(KPI_TIME_URL, blob);
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/description" replace />} />
          <Route path="/intro" element={<IntroPanel />} />
          <Route path="/description" element={<MainPanel />} />
          <Route path="/conclusion" element={<ConclusionPanel />} />
          <Route path="/posts" element={<PostsPanel />} />
          <Route path="/api" element={<ApiPanel />} />
          <Route path="/stats" element={<StatsPanel />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
