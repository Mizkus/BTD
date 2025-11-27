import { useEffect, useState } from 'react';
import axios from 'axios';

const KPI_URL = 'http://127.0.0.1:8000/kpi';

const formatDuration = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins} мин ${secs} сек`;
};

const StatsPanel = () => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    axios
      .get(KPI_URL)
      .then((res) => setStats(res.data))
      .catch((error) => console.error('Failed to load KPI', error));
  }, []);

  return (
    <article>
      <h1>Статистика посещений</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Страница</th>
            <th>Посещений</th>
            <th>Время</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((item) => (
            <tr key={item.page_id}>
              <td>{item.page_name}</td>
              <td>{item.visits}</td>
              <td>{formatDuration(item.total_time_seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
};

export default StatsPanel;
