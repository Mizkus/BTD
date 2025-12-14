import { useState } from 'react';

export default function TextForm({ onAdd }) {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    onAdd({ content });
    setContent('');
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <textarea
        placeholder="Текст"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <button type="submit">Отправить в эмбеддер</button>
    </form>
  );
}
