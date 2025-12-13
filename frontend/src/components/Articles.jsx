import { useEffect, useState } from 'react';

export default function Articles() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5174/api/articles')
      .then((res) => res.json())
      .then(setItems)
      .catch(() => setItems([]));
  }, []);

  return (
    <section className="panel" id="articles">
      <h2>Научные статьи и ссылки</h2>
      <div className="list vertical">
        {items.map((article) => (
          <a key={article.id} className="card" href={article.link} target="_blank" rel="noreferrer">
            <strong>{article.title}</strong>
            <span className="muted">{article.summary}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
