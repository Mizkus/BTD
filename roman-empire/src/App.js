import { useCallback, useEffect, useMemo, useRef, useState, useContext } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import IntroPanel from './components/IntroPanel';
import MainPanel from './components/MainPanel';
import ConclusionPanel from './components/ConclusionPanel';
import PostsPanel from './components/PostsPanel';
import ApiPanel from './components/ApiPanel';
import StatsPanel from './components/StatsPanel';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AuthContext from './context/AuthContext';

import './App.css';

const PAGE_IDS = {
  '/intro': 1,
  '/description': 2,
  '/conclusion': 3,
  '/api': 4,
};

const API_BASE = 'http://127.0.0.1:8000';
const KPI_VISIT_URL = `${API_BASE}/kpi/visit`;
const KPI_TIME_URL = `${API_BASE}/kpi/time`;

const RequireAuth = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!auth.user) {
    return <p>Загрузка...</p>;
  }

  return children;
};

const RequireAdmin = ({ children }) => {
  const { auth } = useContext(AuthContext);
  const location = useLocation();

  if (!auth.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!auth.user) {
    return <p>Загрузка...</p>;
  }

  if (auth.user.role !== 'admin') {
    return <Navigate to="/intro" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    user: null,
  });
  const startTimeRef = useRef(Date.now());
  const currentPageIdRef = useRef(null);

  useEffect(() => {
    if (!auth.token) {
      delete axios.defaults.headers.common.Authorization;
      return;
    }

    axios.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
    if (!auth.user) {
      axios
        .get(`${API_BASE}/auth/me`)
        .then((res) => setAuth((prev) => ({ ...prev, user: res.data })))
        .catch(() => {
          localStorage.removeItem('token');
          setAuth({ token: null, user: null });
        });
    }
  }, [auth.token]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setAuth({ token: null, user: null });
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    if (!auth.token) {
      currentPageIdRef.current = null;
      return undefined;
    }
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
  }, [location.pathname, auth.token]);

  useEffect(() => {
    if (!auth.token) {
      return undefined;
    }

    const handleUnload = () => {
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const pageId = currentPageIdRef.current;
      if (pageId && duration > 0) {
        fetch(KPI_TIME_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
          body: JSON.stringify({ page_id: pageId, seconds: duration }),
          keepalive: true,
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, [auth.token]);

  const authValue = useMemo(
    () => ({ auth, setAuth, logout }),
    [auth, logout]
  );

  const showSidebar = auth.token && auth.user;

  return (
    <AuthContext.Provider value={authValue}>
      <div className="app">
        {showSidebar && <Sidebar />}
        <main className="content">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/intro"
              element={
                <RequireAuth>
                  <IntroPanel />
                </RequireAuth>
              }
            />
            <Route
              path="/description"
              element={
                <RequireAuth>
                  <MainPanel />
                </RequireAuth>
              }
            />
            <Route
              path="/conclusion"
              element={
                <RequireAuth>
                  <ConclusionPanel />
                </RequireAuth>
              }
            />
            <Route
              path="/posts"
              element={
                <RequireAuth>
                  <PostsPanel />
                </RequireAuth>
              }
            />
            <Route
              path="/api"
              element={
                <RequireAuth>
                  <ApiPanel />
                </RequireAuth>
              }
            />
            <Route
              path="/stats"
              element={
                <RequireAdmin>
                  <StatsPanel />
                </RequireAdmin>
              }
            />
            <Route
              path="/"
              element={<Navigate to="/description" replace />}
            />
            <Route path="*" element={<Navigate to="/description" replace />} />
          </Routes>
        </main>
      </div>
    </AuthContext.Provider>
  );
}

export default App;
