import { useState } from 'react';

export default function SearchBox({ onSearch, results }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <div className="search">
      <form onSubmit={handleSubmit}>
        <input
          placeholder="Поиск по текстам"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Искать</button>
      </form>
      <div className="search-results">
        {results.map((r) => (
          <div key={r.id} className="card">
            <strong>{r.title}</strong>
            <span className="muted">{r.summary}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
