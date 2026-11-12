import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import InputForm from '../components/InputForm';
import RecommendationCard from '../components/RecommendationCard';
import AlertCard from '../components/AlertCard';
import StrategyCard from '../components/StrategyCard';
import ScheduleCard from '../components/ScheduleCard';
import LocationPicker from '../components/LocationPicker';
import { FarmScene } from '../components/FarmScene';
import SiteHeader, { Crescent } from '../components/SiteHeader';
import EarthriseHero from '../components/EarthriseHero';
import { useReveals } from '../hooks/useReveals';
import irrigationService from '../services/irrigationService';
import { fetchWeatherData } from '../services/weatherService';
import './IrrigationDashboard.css';

const DEFAULT_COORDS = {
  latitude: 20.5937,
  longitude: 78.9629,
  label: 'India',
};

const DEFAULT_FORM_DATA = {
  temperature: 28,
  humidity: 65,
  soil_moisture: 45,
  rainfall: 5,
  crop_type: 'wheat',
};

const estimateSoilErosionRisk = (temperature, humidity) => {
  if (temperature === null || humidity === null || temperature === undefined || humidity === undefined) {
    return null;
  }

  if (temperature > 35 && humidity < 40) {
    return 'HIGH';
  }

  if (humidity > 80) {
    return 'LOW';
  }

  return 'MODERATE';
};

const IrrigationDashboard = () => {
  const [prediction, setPrediction] = useState(null);
  const [alert, setAlert] = useState(null);
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [backendStatus, setBackendStatus] = useState('checking');
  const [modelInfo, setModelInfo] = useState(null);

  const [dashboardTime, setDashboardTime] = useState(new Date());
  const [latitude, setLatitude] = useState(DEFAULT_COORDS.latitude);
  const [longitude, setLongitude] = useState(DEFAULT_COORDS.longitude);
  const [coordinatesLabel, setCoordinatesLabel] = useState(DEFAULT_COORDS.label);

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);
  const [soilErosionRisk, setSoilErosionRisk] = useState(null);
  const [weatherStatus, setWeatherStatus] = useState('loading');
  const [weatherError, setWeatherError] = useState(null);
  const [liveWeatherMeta, setLiveWeatherMeta] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_FORM_DATA);
  const autoRequestLock = useRef(false);
  const formDataRef = useRef(DEFAULT_FORM_DATA);
  const revealRef = useReveals();

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    const timer = setInterval(() => setDashboardTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadSystemInfo = async () => {
      try {
        const [health, info] = await Promise.all([
          irrigationService.healthCheck(),
          irrigationService.getModelInfo(),
        ]);

        setBackendStatus(health.status === 'healthy' ? 'online' : 'degraded');
        setModelInfo(info);
      } catch {
        setBackendStatus('offline');
        setModelInfo(null);
      }
    };

    loadSystemInfo();
  }, []);

  const runAutoRecommendation = useCallback(async (sensorData, weatherTemperature, weatherHumidity, erosionRisk) => {
    if (autoRequestLock.current) {
      return;
    }

    autoRequestLock.current = true;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...sensorData,
        latitude,
        longitude,
        temperature: weatherTemperature,
        humidity: weatherHumidity,
        soil_erosion_risk: erosionRisk,
      };

      const predictionData = await irrigationService.predictIrrigation(payload);
      const [alertData, strategyData] = await Promise.all([
        irrigationService.generateAlert(payload),
        irrigationService.getOptimizationStrategy({
          ...payload,
          predicted_water_requirement_mm: predictionData.water_requirement_mm,
        }),
      ]);

      setPrediction(predictionData);
      setAlert(alertData);
      setStrategy(strategyData);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations. Please try again.');
    } finally {
      setLoading(false);
      autoRequestLock.current = false;
    }
  }, [latitude, longitude]);

  useEffect(() => {
    const loadWeather = async () => {
      if (latitude === null || longitude === null || latitude === undefined || longitude === undefined) {
        return;
      }

      setWeatherStatus('loading');
      setWeatherError(null);

      try {
        const weather = await fetchWeatherData(latitude, longitude);
        const nextRisk = estimateSoilErosionRisk(weather.temperature, weather.humidity);

        setTemperature(weather.temperature);
        setHumidity(weather.humidity);
        setSoilErosionRisk(nextRisk);
        setWeatherStatus('online');
        setLiveWeatherMeta({ updatedAt: new Date().toISOString() });

        const syncedFormData = {
          ...formDataRef.current,
          temperature: weather.temperature ?? formDataRef.current.temperature,
          humidity: weather.humidity ?? formDataRef.current.humidity,
        };
        setFormData(syncedFormData);

        await runAutoRecommendation(
          syncedFormData,
          weather.temperature ?? syncedFormData.temperature,
          weather.humidity ?? syncedFormData.humidity,
          nextRisk
        );
      } catch (err) {
        setWeatherStatus('offline');
        setWeatherError(err.message || 'Unable to fetch live weather for the selected field.');
      }
    };

    loadWeather();
  }, [latitude, longitude, runAutoRecommendation]);

  const handleFormSubmit = async (formData) => {
    setFormData(formData);

    const effectiveTemperature = temperature ?? formData.temperature;
    const effectiveHumidity = humidity ?? formData.humidity;
    const erosionRisk = estimateSoilErosionRisk(effectiveTemperature, effectiveHumidity);

    setSoilErosionRisk(erosionRisk);
    await runAutoRecommendation(formData, effectiveTemperature, effectiveHumidity, erosionRisk);
  };

  const formatClock = (value) =>
    value.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

  const dashboardStats = useMemo(
    () => [
      {
        label: 'Selected Latitude',
        value: latitude !== null ? latitude.toFixed(4) : '--',
      },
      {
        label: 'Selected Longitude',
        value: longitude !== null ? longitude.toFixed(4) : '--',
      },
      {
        label: 'Detected Temperature',
        value: temperature !== null ? `${Math.round(temperature)}°C` : '--',
      },
      {
        label: 'Detected Humidity',
        value: humidity !== null ? `${Math.round(humidity)}%` : '--',
      },
      {
        label: 'Soil Erosion Risk',
        value: soilErosionRisk || '--',
      },
      {
        label: 'Weather Sync',
        value: weatherStatus.toUpperCase(),
      },
    ],
    [latitude, longitude, temperature, humidity, soilErosionRisk, weatherStatus]
  );

  return (
    <div className="dashboard">
      <a className="skip-link" href="#overview">Skip to dashboard</a>

      <SiteHeader backendStatus={backendStatus} dashboardTime={dashboardTime} />

      <EarthriseHero
        dashboardTime={dashboardTime}
        backendStatus={backendStatus}
        weatherStatus={weatherStatus}
        temperature={temperature}
        humidity={humidity}
        latitude={latitude}
        longitude={longitude}
        coordinatesLabel={coordinatesLabel}
        modelInfo={modelInfo}
      />

      <main ref={revealRef} className="dashboard-content">
        <section className="kpi-section" id="overview" aria-labelledby="overview-title">
          <div className="shell">
            <div className="section-head" data-reveal>
              <div>
                <p className="section-kicker">01 / Live state</p>
                <h2 id="overview-title">Field summary</h2>
                <p>
                  The six readings that matter right now — coordinates, the weather sync, and
                  the derived erosion risk that travels with every API request.
                </p>
              </div>
              <p className="section-note">Auto-refresh · {formatClock(dashboardTime)}</p>
            </div>

            <div className="kpi-grid">
              {dashboardStats.map((item, index) => (
                <article key={item.label} className="kpi-card">
                  <div className="kpi-card-top">
                    <span className="kpi-index mono">{String(index + 1).padStart(2, '0')}</span>
                    <span className={`kpi-state ${item.value === 'ONLINE' ? 'is-live' : item.value === 'OFFLINE' ? 'is-off' : ''}`} />
                  </div>
                  <span className="kpi-label">{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="telemetry-section" aria-labelledby="telemetry-title">
          <div className="shell">
            <div className="section-head" data-reveal>
              <div>
                <p className="section-kicker">02 / Telemetry</p>
                <h2 id="telemetry-title">Field telemetry</h2>
                <p>
                  Weather is fetched for the map-selected field and folded into the irrigation
                  payload automatically. Tap the map to move the field.
                </p>
              </div>
              <p className="section-note">OpenStreetMap · live weather</p>
            </div>

            <div className="overview-grid">
              <article className="overview-panel live-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-label">Live weather telemetry</div>
                    <h2>{coordinatesLabel}</h2>
                    <p>Weather refreshes automatically for the selected field location.</p>
                  </div>
                  <div className="panel-chip mono">{formatClock(dashboardTime)}</div>
                </div>

                <LocationPicker
                  setLatitude={(lat) => {
                    setLatitude(lat);
                    setCoordinatesLabel('Selected field');
                  }}
                  setLongitude={(lng) => {
                    setLongitude(lng);
                    setCoordinatesLabel('Selected field');
                  }}
                />

                <div className="weather-main">
                  <div className="weather-temperature">
                    {temperature !== null ? `${Math.round(temperature)}°C` : '--'}
                  </div>
                  <div className="weather-details">
                    <div className="weather-condition">
                      {weatherStatus === 'loading' ? 'Loading live weather' : 'Live field conditions'}
                    </div>
                    <div className="weather-meta">
                      Humidity {humidity !== null ? `${Math.round(humidity)}%` : '--'}
                    </div>
                    <div className="weather-meta muted">
                      Latitude {latitude !== null ? latitude.toFixed(4) : '--'} | Longitude{' '}
                      {longitude !== null ? longitude.toFixed(4) : '--'}
                    </div>
                  </div>
                </div>

                <div className="field-data-grid">
                  <div className="field-data-card">
                    <span>Latitude</span>
                    <strong>{latitude !== null ? latitude.toFixed(4) : '--'}</strong>
                  </div>
                  <div className="field-data-card">
                    <span>Longitude</span>
                    <strong>{longitude !== null ? longitude.toFixed(4) : '--'}</strong>
                  </div>
                  <div className="field-data-card">
                    <span>Temperature</span>
                    <strong>{temperature !== null ? `${Math.round(temperature)}°C` : '--'}</strong>
                  </div>
                  <div className="field-data-card">
                    <span>Humidity</span>
                    <strong>{humidity !== null ? `${Math.round(humidity)}%` : '--'}</strong>
                  </div>
                  <div className="field-data-card">
                    <span>Soil Risk</span>
                    <strong>{soilErosionRisk || '--'}</strong>
                  </div>
                  <div className="field-data-card">
                    <span>Weather Sync</span>
                    <strong>{weatherStatus.toUpperCase()}</strong>
                  </div>
                </div>

                {weatherError && <div className="panel-note">{weatherError}</div>}
                {liveWeatherMeta?.updatedAt && (
                  <div className="panel-note">
                    Live weather updated at {new Date(liveWeatherMeta.updatedAt).toLocaleString()}
                  </div>
                )}
              </article>

              <article className="overview-panel system-panel">
                <div className="panel-header">
                  <div>
                    <div className="panel-label">Platform health</div>
                    <h2>System snapshot</h2>
                    <p>Service health, model state, and automated weather sync.</p>
                  </div>
                </div>

                <div className="system-grid">
                  <div className="system-card">
                    <span>Backend</span>
                    <strong>{backendStatus.toUpperCase()}</strong>
                  </div>
                  <div className="system-card">
                    <span>ML model</span>
                    <strong>{modelInfo?.ml_model || 'Loading'}</strong>
                  </div>
                  <div className="system-card">
                    <span>GenAI engine</span>
                    <strong>{modelInfo?.genai_engine || 'Loading'}</strong>
                  </div>
                  <div className="system-card">
                    <span>Weather sync</span>
                    <strong>{weatherStatus.toUpperCase()}</strong>
                  </div>
                </div>

                <div className="panel-note">
                  Soil erosion risk is derived from weather and automatically included in the
                  irrigation API payload.
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="field-model-section" id="field-model" aria-labelledby="model-title">
          <div className="shell">
            <div className="section-head" data-reveal>
              <div>
                <p className="section-kicker">03 / Digital twin</p>
                <h2 id="model-title">The field, in three dimensions.</h2>
                <p>
                  A live model of the crop rows and irrigation lines. Drag to orbit the field;
                  tap a zone to read its moisture and recommended water.
                </p>
              </div>
              <p className="section-note">Interactive · WebGL</p>
            </div>

            <div className="field-model-frame" data-reveal>
              <div className="field-model-brackets brackets" aria-hidden="true" />
              <FarmScene />
              <div className="field-model-footer mono">
                <span>Zones · north / central / south</span>
                <span>Auto-orbit enabled</span>
              </div>
            </div>
          </div>
        </section>

        <section className="workspace-section" id="recommendation" aria-labelledby="recommendation-title">
          <div className="shell">
            <div className="section-head" data-reveal>
              <div>
                <p className="section-kicker">04 / Decision support</p>
                <h2 id="recommendation-title">Set the field context.</h2>
                <p>
                  Adjust the sensor readings, then run the model. The recommendation, field
                  alert, efficiency plan and watering schedule all return together.
                </p>
              </div>
              <p className="section-note">ML prediction + GenAI explanation</p>
            </div>

            {error && (
              <div className="error-banner" role="alert">
                <span className="error-icon">!</span>
                <div className="error-message">
                  <h3>Error</h3>
                  <p>{error}</p>
                </div>
                <button className="error-close" onClick={() => setError(null)} aria-label="Dismiss error">
                  ✕
                </button>
              </div>
            )}

            <div className="workspace-grid">
              <aside className="sidebar">
                <InputForm
                  onSubmit={handleFormSubmit}
                  loading={loading}
                  formData={formData}
                  onFormDataChange={setFormData}
                />
              </aside>

              <section className="main-content" aria-label="Recommendation results">
                <div className="results-row">
                  <div className="result-card">
                    <RecommendationCard prediction={prediction} loading={loading} />
                  </div>
                  <div className="result-card">
                    <AlertCard alert={alert} loading={loading} />
                  </div>
                </div>

                <div className="results-row">
                  <div className="result-card">
                    <StrategyCard strategy={strategy} loading={loading} />
                  </div>
                  <div className="result-card" id="schedule">
                    <ScheduleCard prediction={prediction} alert={alert} />
                  </div>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>

      <footer className="dashboard-footer">
        <div className="shell footer-content">
          <div className="footer-brand">
            <Crescent className="footer-crescent" />
            <span className="footer-word">FIELDWISE</span>
            <span className="footer-tag mono">Precision irrigation, orchestrated.</span>
          </div>
          <p className="mono">Lunar plates generated for this concept · interface v1.2.0</p>
          <a className="footer-top mono" href="#top">Back to the surface ↑</a>
        </div>
      </footer>
    </div>
  );
};

export default IrrigationDashboard;
