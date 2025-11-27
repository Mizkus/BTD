import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

const ApiPanel = () => (
  <article>
    <h1>API документация</h1>
    <p>Ниже тянется OpenAPI спецификация вашего FastAPI сервера.</p>
    <SwaggerUI url="http://127.0.0.1:8000/openapi.json" />
  </article>
);

export default ApiPanel;
