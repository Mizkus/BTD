const endpoints = [
  { method: 'GET', path: '/api/points?space=demo', summary: 'Точки текущего пространства' },
  { method: 'GET', path: '/api/spaces', summary: 'Список пространств' },
  { method: 'POST', path: '/api/spaces', summary: 'Создать пространство' },
  { method: 'POST', path: '/api/texts', summary: 'Добавить текст и получить эмбеддинг (float16)' },
  { method: 'POST', path: '/api/upload-txt?space=demo', summary: 'Загрузить .txt, каждая строка — отдельная точка' },
  { method: 'GET', path: '/api/articles', summary: 'Ссылки на Qwen3 и др.' },
  { method: 'GET', path: '/api/search?q=term&space=demo', summary: 'Поиск по текстам в пространстве' },
];

export default function ApiDocs() {
  return (
    <section className="panel" id="api">
      <h2>API (простое)</h2>
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
