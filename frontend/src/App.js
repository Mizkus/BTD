import { useEffect, useState } from 'react';
import Header from './components/Header.js';
import TextForm from './components/TextForm.js';
import Scatter from './components/Scatter.js';
import Articles from './components/Articles.js';
import ApiDocs from './components/ApiDocs.js';
import SpacePicker from './components/SpacePicker.js';
import SideNav from './components/SideNav.js';
import SearchPage from './components/SearchPage.js';

const API_BASE = 'http://localhost:5174/api';

const fetchJson = async (path, options) => {
  const response = await fetch(`${API_BASE}${path}`, options);
  if (!response.ok) {
    throw new Error('Request failed');
  }
  return response.json();
};

export default function App() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('demo');
  const [points, setPoints] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [activeSection, setActiveSection] = useState('about');

  const refreshPoints = async (space) => {
    if (!space) return;
    try {
      const updated = await fetchJson(`/points?space=${space}`);
      setPoints(updated);
    } catch {
      setPoints([]);
    }
  };

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const data = await fetchJson('/spaces');
        setSpaces(data);
        if (data.length && !selectedSpace) {
          setSelectedSpace(data[0].name);
        }
      } catch {
        setSpaces([]);
      }
    };
    loadSpaces();
  }, []);

  useEffect(() => {
    refreshPoints(selectedSpace);
  }, [selectedSpace]);

  const handleAddText = async (payload) => {
    await fetchJson('/texts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, space: selectedSpace || 'demo' }),
    });
    await refreshPoints(selectedSpace);
  };

  const handleSearch = async (text) => {
    try {
      const data = await fetchJson(`/search?q=${encodeURIComponent(text)}&space=${selectedSpace}`);
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddSpace = async (name) => {
    const data = await fetchJson('/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });
    setSpaces((prev) => {
      const exists = prev.find((s) => s.name === data.name);
      if (exists) return prev;
      return [data, ...prev];
    });
    setSelectedSpace(data.name);
  };

  const navItems = [
    { id: 'about', label: 'О чём сайт' },
    { id: 'demo-page', label: 'Визуализатор' },
    { id: 'search', label: 'Поиск' },
    { id: 'articles', label: 'Научные статьи' },
    { id: 'api', label: 'API' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'demo-page':
        return (
          <section className="panel" id="demo-page">
            <h2>Визуализатор</h2>
            <p className="muted small">
              Вся интерактивная часть собрана здесь: сначала выбираем пространство, затем вводим текст и наблюдаем результат
              на Plotly-графике. Можно открыть только эту страницу и сразу повторить сценарий.
            </p>
            <div className="demo-grid">
              <div className="panel-block">
                <h3>Пространства</h3>
                <p className="muted small">
                  Создавайте изолированные песочницы под разные задачи. Активное пространство: {selectedSpace || 'demo'}.
                </p>
                <SpacePicker
                  spaces={spaces}
                  selected={selectedSpace}
                  onSelect={setSelectedSpace}
                  onAdd={handleAddSpace}
                />
              </div>
              <div className="panel-block">
                <h3>Добавить текст</h3>
                <p className="muted small">Шаг 2: впишите фразу или инструкцию, визуализатор вернёт координаты (float16).</p>
                <TextForm onAdd={handleAddText} />
                <ol className="steps">
                  <li>Введите текст (на любом языке).</li>
                </ol>
              </div>
              <div className="panel-block">
                <h3>Визуализатор</h3>
                <p className="muted">
                  Plotly scatter для пространства {selectedSpace || 'demo'}. Наведите или тапните по точке, чтобы увидеть
                  короткий тег и полный текст.
                </p>
                <Scatter points={points} />
              </div>
            </div>
          </section>
        );
      case 'search':
        return <SearchPage onSearch={handleSearch} results={searchResults} />;
      case 'articles':
        return <Articles />;
      case 'api':
        return <ApiDocs />;
      case 'about':
      default:
        return (
          <section className="panel" id="about">
            <h1>О чём сайт</h1>
            <p className="muted">
              Платформа демонстрирует, как текстовые данные превращаются в двухмерные точки, чтобы их было удобнее
              исследовать. Выберите пространство, добавьте фразы и отслеживайте, как они распределяются по координатам. В
              демо уже есть несколько примерных точек, чтобы не начинать с пустого экрана.
            </p>
            <p className="muted small">
              Этот экран знакомит с продуктом и рассказывает, куда двигаться дальше. Панель слева — навигация по разделам:
              в «Визуализаторе» находится вся интерактивная часть, в «Поиске» можно мгновенно находить тексты, а остальные
              страницы содержат статьи и API. Каждый раздел открывается независимо, чтобы сразу получить нужные сведения.
            </p>
          </section>
        );
    }
  };

  return (
    <div className="app-shell">
      <Header />
      <div className="main-layout">
        <SideNav items={navItems} selected={activeSection} onSelect={setActiveSection} />
        <main className="content">{renderSection()}</main>
      </div>
    </div>
  );
}
