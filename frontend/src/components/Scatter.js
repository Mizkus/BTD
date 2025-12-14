import { useEffect, useRef } from 'react';

const colors = ['#6ba4ff', '#7cf2d4', '#f6c177', '#e05a9d'];
const PLOTLY_SRC = 'https://cdn.plot.ly/plotly-2.35.2.min.js';

function ensurePlotly() {
  if (window.Plotly) {
    return Promise.resolve(window.Plotly);
  }
  if (window.__plotlyLoader) {
    return window.__plotlyLoader;
  }
  window.__plotlyLoader = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = PLOTLY_SRC;
    script.async = true;
    script.onload = () => resolve(window.Plotly);
    script.onerror = () => reject(new Error('Plotly failed to load'));
    document.body.appendChild(script);
  });
  return window.__plotlyLoader;
}

export default function Scatter({ points }) {
  const plotRef = useRef(null);

  const shortLabel = (point) => {
    const existing = (point.shortName || '').trim();
    if (existing) return existing;
    const words = (point.content || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 3);
    return words.length ? words.join(' ') : `Текст ${point.id}`;
  };

  useEffect(() => {
    let isMounted = true;

    const renderPlot = async () => {
      try {
        await ensurePlotly();
        if (!isMounted || !plotRef.current) return;

        const plotPoints = Array.isArray(points) ? points : [];
        const data = [
          {
            type: 'scatter',
            mode: 'markers+text',
            x: plotPoints.map((p) => p.x ?? 0),
            y: plotPoints.map((p) => p.y ?? 0),
            text: plotPoints.map((p) => shortLabel(p)),
            customdata: plotPoints.map((p) => p.content || ''),
            textposition: 'top center',
            marker: {
              size: 12,
              color: plotPoints.map((_, idx) => colors[idx % colors.length]),
              line: { color: '#0c1020', width: 1.5 },
            },
            hovertemplate: '<b>%{text}</b><br>%{customdata}<extra></extra>',
          },
        ];

        const layout = {
          template: 'plotly_dark',
          paper_bgcolor: '#0c1020',
          plot_bgcolor: '#0c1020',
          margin: { t: 20, r: 20, b: 40, l: 40 },
          xaxis: { title: 'x', range: [-1.1, 1.1], zerolinecolor: '#1f2942' },
          yaxis: { title: 'y', range: [-1.1, 1.1], zerolinecolor: '#1f2942' },
          font: { family: 'Inter, system-ui, sans-serif', color: '#e8ecf7' },
          showlegend: false,
        };

        window.Plotly.react(plotRef.current, data, layout, {
          responsive: true,
          displaylogo: false,
          modeBarButtonsToRemove: ['select2d', 'lasso2d'],
        });
      } catch (err) {
        console.error(err);
      }
    };

    renderPlot();

    return () => {
      isMounted = false;
      if (window.Plotly && plotRef.current) {
        window.Plotly.purge(plotRef.current);
      }
    };
  }, [points]);

  return (
    <div className="scatter-wrap">
      <div ref={plotRef} className="plotly-box" />
      <p className="muted small">Plotly scatter: подписи отображаются прямо на точках.</p>
    </div>
  );
}
