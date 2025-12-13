export default function Header() {
  return (
    <header className="header">
      <div>
        <div className="logo">Qwen3 Lab</div>
        <div className="subtitle">Простая документация + демо</div>
      </div>
      <nav className="nav">
        <a href="#docs">Документация</a>
        <a href="#articles">Статьи</a>
        <a href="#api">API</a>
      </nav>
    </header>
  );
}
