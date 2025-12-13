import { useState } from 'react';

export default function SpacePicker({ spaces, selected, onSelect, onAdd }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim());
    setName('');
  };

  return (
    <div className="space-picker">
      <label className="muted">Выбор пространства</label>
      <div className="list">
        {spaces.map((space) => (
          <button
            key={space.name}
            className={space.name === selected ? 'pill active' : 'pill'}
            onClick={() => onSelect(space.name)}
          >
            {space.name}
          </button>
        ))}
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <input
          placeholder="Новое пространство"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit">Создать</button>
      </form>
    </div>
  );
}
