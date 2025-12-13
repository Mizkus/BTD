import { useEffect, useState } from 'react';
import Header from './components/Header.jsx';
import TextForm from './components/TextForm.jsx';
import Scatter from './components/Scatter.jsx';
import Articles from './components/Articles.jsx';
import ApiDocs from './components/ApiDocs.jsx';
import SearchBox from './components/SearchBox.jsx';
import UploadTxt from './components/UploadTxt.jsx';
import SpacePicker from './components/SpacePicker.jsx';

const API_BASE = 'http://localhost:5174/api';

export default function App() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('demo');
  const [points, setPoints] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/spaces`)
      .then((res) => res.json())
      .then((data) => {
        setSpaces(data);
        if (data.length && !selectedSpace) {
          setSelectedSpace(data[0].name);
        }
      })
      .catch(() => setSpaces([]));
  }, []);

  useEffect(() => {
    if (!selectedSpace) return;
    fetch(`${API_BASE}/points?space=${selectedSpace}`)
      .then((res) => res.json())
      .then(setPoints)
      .catch(() => setPoints([]));
  }, [selectedSpace]);

  const handleAddText = async (payload) => {
    await fetch(`${API_BASE}/texts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, space: selectedSpace || 'demo' }),
    });
    const refreshed = await fetch(`${API_BASE}/points?space=${selectedSpace}`).then((res) => res.json());
    setPoints(refreshed);
  };

  const handleUploadTxt = async (file) => {
    const form = new FormData();
    form.append('file', file);
    await fetch(`${API_BASE}/upload-txt?space=${selectedSpace}`, {
      method: 'POST',
      body: form,
    });
    const refreshed = await fetch(`${API_BASE}/points?space=${selectedSpace}`).then((res) => res.json());
    setPoints(refreshed);
  };

  const handleSearch = async (text) => {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(text)}&space=${selectedSpace}`);
    const data = await res.json();
    setSearchResults(data);
  };

  const handleAddSpace = async (name) => {
    const res = await fetch(`${API_BASE}/spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    const data = await res.json();
    setSpaces((prev) => {
      const exists = prev.find((s) => s.name === data.name);
      if (exists) return prev;
      return [data, ...prev];
    });
    setSelectedSpace(data.name);
  };

  return (
    <div className="app-shell">
      <Header />
      <main className="content">
        <section className="panel">
          <h1>Визуализация эмбеддингов Qwen3</h1>
          <p className="muted">
            Добавьте тексты или загрузите txt-файл — бэкенд получит эмбеддинги (float16) и вернёт (x, y) для графика.
            Пример уже содержит 10 заранее рассчитанных точек.
          </p>
          <SearchBox onSearch={handleSearch} results={searchResults} />
        </section>

        <section className="panel">
          <div className="split">
            <div>
              <h2>Пространства</h2>
              <SpacePicker
                spaces={spaces}
                selected={selectedSpace}
                onSelect={setSelectedSpace}
                onAdd={handleAddSpace}
              />
            </div>
            <div>
              <h2>Добавить текст</h2>
              <TextForm onAdd={handleAddText} />
              <p className="muted small">
                При добавлении текста бэкенд вызовет embedder.py (Qwen3-Embedding-0.6B, float16; fallback MiniLM).
              </p>
            </div>
            <div>
              <h2>Загрузить .txt</h2>
              <UploadTxt onUpload={handleUploadTxt} />
              <p className="muted small">Каждая строка файла станет отдельной точкой.</p>
            </div>
          </div>
        </section>

        <section className="panel">
          <h2>Визуализация</h2>
          <p className="muted">Пространство: {selectedSpace || 'demo'}</p>
          <Scatter points={points} />
        </section>

        <Articles />
        <ApiDocs />
      </main>
    </div>
  );
}
