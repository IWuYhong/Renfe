import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const trains = [
    { id: 1, departure: '12:14', arrival: '13:03', status: 'Puntual', type: 'puntual', line: 'R2 Sud' },
    { id: 2, departure: '12:44', arrival: '13:33', status: 'Puntual', type: 'puntual', line: 'R2 Sud' },
    { id: 3, departure: '13:14', arrival: '14:05', status: 'Retraso 5m', type: 'retraso', line: 'R2 Sud' },
    { id: 4, departure: '13:44', arrival: '14:33', status: 'Puntual', type: 'puntual', line: 'R2 Sud' },
  ];

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 600);
  };

  return (
    <div className="app-container">

      {/* Cabecera */}
      <header className="app-header">
        <div>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.5px' }}>RODALIES DIRECTO</span>
          <h1>Barcelona ➔ Cunit</h1>
        </div>
        <button
          onClick={handleRefresh}
          className={`refresh-btn ${loading ? 'spinning' : ''}`}
          title="Actualizar horarios"
        >
          {/* SVG de recarga / refresh */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.73-5.73" />
          </svg>
        </button>
      </header>

      {/* Info Bar */}
      <div className="info-bar">
        <div>
          <span style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Hora local</span>
          <code>{currentTime.toLocaleTimeString()}</code>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Tramo Clave</span>
          <p style={{ fontWeight: 500, color: 'var(--text-h)', fontSize: '13px' }}>Cunit ➔ Segur ➔ Castelldefels</p>
        </div>
      </div>

      {/* Próximo Tren (Destacado) */}
      <section className="next-train-card">
        <div className="badge-next">SIGUIENTE</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>🟢</span>
          <code>{trains[0].line}</code>
        </div>

        <div className="train-times-grid">
          <div className="time-box">
            <span>Salida Sants</span>
            <strong>{trains[0].departure}</strong>
          </div>
          <div className="time-box">
            <span>Llegada Cunit</span>
            <strong style={{ color: 'var(--accent)' }}>{trains[0].arrival}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--accent-border)', paddingTop: '12px' }}>
          <span style={{ color: 'var(--text)' }}>Estado: <strong style={{ color: 'var(--accent)' }}>Puntual</strong></span>
          <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>Aprox. 49 min</span>
        </div>
      </section>

      {/* Siguientes Salidas */}
      <section className="trains-list-section">
        <h2>Próximas Salidas</h2>
        <p style={{ fontSize: '13px', marginBottom: '4px' }}>Horarios programados desde Barcelona</p>

        <div>
          {trains.slice(1).map((train) => (
            <div key={train.id} className="train-item">
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <code>{train.departure}</code>
                <span style={{ fontSize: '13px', color: 'var(--text)' }}>Llegada: <strong style={{ color: 'var(--text-h)' }}>{train.arrival}</strong></span>
              </div>
              <span className={`status-badge status-${train.type}`}>
                {train.status}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="app-footer">
        Hecho con ❤️ por Richard
      </footer>

    </div>
  );
}