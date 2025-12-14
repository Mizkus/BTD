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
      <p className="muted small">
        Подборка материалов для углубления: от официальной модели Embedder до методик по редукции размерности.
      </p>
      <div className="article-grid">
        {items.map((article) => (
          <a key={article.id} className="card article-card" href={article.link} target="_blank" rel="noreferrer">
            <strong>{article.title}</strong>
            <span className="muted">{article.summary}</span>
          </a>
        ))}
      </div>
    </section>
  );
}
