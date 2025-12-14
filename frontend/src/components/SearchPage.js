import SearchBox from './SearchBox.js';

export default function SearchPage({ onSearch, results }) {
  return (
    <section className="panel" id="search">
      <h2>Поиск по сайту</h2>
      <p className="muted small">
        Отдельная страница с полнотекстовым поиском. Введите запрос — бэкенд вернёт совпадающие тексты и пространства, а
        результаты появятся ниже без перезагрузки.
      </p>
      <SearchBox onSearch={onSearch} results={results} />
      <p className="muted small">Чтобы продолжить работу с найденным текстом, откройте раздел «Визуализатор».</p>
    </section>
  );
}
