const endpoints = [
  { method: 'GET', path: '/api/points?space=demo', summary: 'Точки текущего пространства' },
  { method: 'GET', path: '/api/spaces', summary: 'Список пространств' },
  { method: 'POST', path: '/api/spaces', summary: 'Создать пространство' },
  { method: 'POST', path: '/api/texts', summary: 'Добавить текст и получить эмбеддинг (float16)' },
  { method: 'GET', path: '/api/articles', summary: 'Ссылки на Embedder и смежные материалы' },
  { method: 'GET', path: '/api/search?q=term&space=demo', summary: 'Поиск по текстам в пространстве' },
];

export default function ApiDocs() {
  return (
    <section className="panel" id="api">
      <h2>Техническая документация (API)</h2>
      <p className="muted small">
        Минимальный REST-слой: JSON схемы совпадают с блоками выше, поэтому любой раздел можно открыть изолированно и
        сразу повторить шаги.
      </p>
      <table className="table">
        <thead>
          <tr>
            <th>Метод</th>
            <th>Путь</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          {endpoints.map((e) => (
            <tr key={e.path}>
              <td className="mono">{e.method}</td>
              <td className="mono">{e.path}</td>
              <td className="muted">{e.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
