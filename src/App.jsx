import React, { useState, useEffect } from 'react';
import './App.css';

// Diccionario de estaciones clave (Tramo Francia -> Tarragona)
// Diccionario de estaciones clave (Orden geográfico real: Norte a Sur)
const STATIONS = [
  { id: '79300', name: 'Barcelona - Estació de França' },
  { id: '79404', name: 'Barcelona - Passeig de Gràcia' },
  { id: '79400', name: 'Barcelona - Sants' },
  { id: '71801', name: 'Castelldefels' },
  { id: '71700', name: 'Sitges' },
  { id: '71701', name: 'Vilanova i la Geltrú' },
  { id: '71705', name: 'Cunit' },
  { id: '71706', name: 'Segur de Calafell' },
  { id: '71708', name: 'Sant Vicenç de Calders' },
  { id: '71400', name: 'Tarragona' }
];

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [trains, setTrains] = useState([]);

  // Estado para la estación de origen y destino (Por defecto: Sants -> Cunit)
  const [origin, setOrigin] = useState('79400');
  const [destination, setDestination] = useState('71705');

  // Reloj en tiempo real
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Volver a buscar trenes cada vez que cambia el origen o el destino
  useEffect(() => {
    fetchTrains();
  }, [origin, destination]);

  const fetchTrains = async () => {
    // Evitar búsqueda si el origen y destino son el mismo
    if (origin === destination) {
      setTrains([]);
      return;
    }

    setLoading(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const currentHour = now.getHours();

      const travelDate = `${year}-${month}-${day}`;

      // Inyectamos las variables dinámicas de origin y destination en la URL
      const targetUrl = `https://serveisgrs.rodalies.gencat.cat/api/timetables?lang=ca&fullResponse=true&originStationId=${origin}&destinationStationId=${destination}&travelingOn=${travelDate}&fromTime=${currentHour}`;
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;

      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error('Error al conectar con la API');

      const data = await response.json();

      if (data.result && data.result.items) {
        const formattedTrains = data.result.items.map((item, index) => {
          const departure = item.departsAtOrigin.substring(0, 5);
          const arrival = item.arrivesAtDestination.substring(0, 5);
          const durationStr = item.duration.substring(3, 5);
          const lineName = item.steps[0]?.line?.name || 'R2/Reg';

          return {
            id: index,
            departure: departure,
            arrival: arrival,
            duration: `${parseInt(durationStr, 10)} min`,
            status: 'Programado',
            type: 'puntual',
            line: lineName
          };
        });

        setTrains(formattedTrains.slice(0, 5));
      } else {
        setTrains([]); // Si no hay trenes para esa ruta
      }

    } catch (error) {
      console.warn("Fallo en la petición:", error);
      setTrains([{ id: 1, departure: '--:--', arrival: '--:--', duration: '--', status: 'Error', type: 'retraso', line: '---' }]);
    } finally {
      setLoading(false);
    }
  };

  // Obtener nombres para la interfaz
  const originName = STATIONS.find(s => s.id === origin)?.name.split(' - ').pop();
  const destName = STATIONS.find(s => s.id === destination)?.name.split(' - ').pop();

  return (
    <div className="app-container">

      <header className="app-header">
        <div>
          <span style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.5px' }}>RODALIES DIRECTO</span>
          <h1 style={{ fontSize: '28px', marginTop: '4px', marginBottom: '0' }}>Ruta Dinámica</h1>
        </div>
        <button
          onClick={fetchTrains}
          className={`refresh-btn ${loading ? 'spinning' : ''}`}
          title="Actualizar horarios"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.73-5.73" />
          </svg>
        </button>
      </header>

      {/* Selectores de Ruta */}
      <div className="route-selector">
        <div className="select-group">
          <span>DESDE</span>
          <select
            className="station-select"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          >
            {STATIONS.map(station => (
              <option key={`orig-${station.id}`} value={station.id}>{station.name}</option>
            ))}
          </select>
        </div>
        <div className="select-group">
          <span>HACIA</span>
          <select
            className="station-select"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          >
            {STATIONS.map(station => (
              <option key={`dest-${station.id}`} value={station.id}>{station.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="info-bar">
        <div>
          <span style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Hora local</span>
          <code>{currentTime.toLocaleTimeString()}</code>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '11px', display: 'block', marginBottom: '2px' }}>Trayecto</span>
          <p style={{ fontWeight: 500, color: 'var(--text-h)', fontSize: '13px' }}>{originName} ➔ {destName}</p>
        </div>
      </div>

      {trains.length === 0 && !loading && (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text)', background: 'var(--code-bg)', borderRadius: '12px' }}>
          No hay trenes directos programados para esta ruta.
        </div>
      )}

      {trains.length > 0 && (
        <section className="next-train-card">
          <div className="badge-next">SIGUIENTE</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>🔴</span>
            <code>{trains[0].line}</code>
          </div>

          <div className="train-times-grid">
            <div className="time-box">
              <span>Salida {originName}</span>
              <strong>{trains[0].departure}</strong>
            </div>
            <div className="time-box">
              <span>Llegada {destName}</span>
              <strong style={{ color: 'var(--accent)' }}>{trains[0].arrival}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderTop: '1px solid var(--accent-border)', paddingTop: '12px' }}>
            <span style={{ color: 'var(--text)' }}>Estado: <strong style={{ color: trains[0].type === 'puntual' ? 'var(--accent)' : '#e0a86d' }}>{trains[0].status}</strong></span>
            <span style={{ color: 'var(--text-h)', fontWeight: 500 }}>Aprox. {trains[0].duration}</span>
          </div>
        </section>
      )}

      {trains.length > 1 && (
        <section className="trains-list-section">
          <h2>Siguientes Salidas</h2>
          <p style={{ fontSize: '13px', marginBottom: '4px' }}>Horarios extraídos de la API</p>

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
      )}

    </div>
  );
}