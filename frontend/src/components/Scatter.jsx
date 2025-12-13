import { useState } from 'react';

const colors = ['#6ba4ff', '#7cf2d4', '#f6c177', '#e05a9d'];

export default function Scatter({ points }) {
  const [hoverId, setHoverId] = useState(null);
  const width = 640;
  const height = 360;

  const scale = (v, max) => (v + 1) * (max / 2);

  return (
    <div className="scatter-wrap">
      <svg className="scatter" viewBox={`0 0 ${width} ${height}`}>
        <rect x="0" y="0" width={width} height={height} fill="#0d111d" />
        {points.map((p, index) => (
          <g
            key={p.id}
            transform={`translate(${scale(p.x || 0, width)}, ${height - scale(p.y || 0, height)})`}
            onMouseEnter={() => setHoverId(p.id)}
            onMouseLeave={() => setHoverId(null)}
          >
            <circle
              r={hoverId === p.id ? 10 : 7}
              fill={colors[index % colors.length]}
              stroke="#0d111d"
              strokeWidth="2"
            />
            {hoverId === p.id && (
              <text x={12} y={4} className="label">
                {p.shortName || `Текст ${p.id}`}
              </text>
            )}
          </g>
        ))}
      </svg>
      <p className="muted small">Наведи на точку, чтобы увидеть короткое имя текста.</p>
    </div>
  );
}
