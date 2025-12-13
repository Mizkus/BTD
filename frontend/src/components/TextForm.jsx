import { useState } from 'react';

export default function TextForm({ onAdd }) {
  const [shortName, setShortName] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd({ shortName, content });
    setShortName('');
    setContent('');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        placeholder="Короткое имя (опционально)"
        value={shortName}
        onChange={(e) => setShortName(e.target.value)}
      />
      <textarea
        placeholder="Текст"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Отправить в эмбеддер</button>
    </form>
  );
}
