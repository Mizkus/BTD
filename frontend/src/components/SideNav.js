export default function SideNav({ items, selected, onSelect }) {
  return (
    <nav className="side-nav" aria-label="Разделы документации">
      <h3>Документация</h3>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={item.id === selected ? 'side-link active' : 'side-link'}
              onClick={() => onSelect(item.id)}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
