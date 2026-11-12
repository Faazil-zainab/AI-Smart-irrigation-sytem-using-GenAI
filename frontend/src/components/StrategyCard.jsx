import React from 'react';
import './StrategyCard.css';

/**
 * StrategyCard Component
 * Displays water-saving optimization strategies
 */
const StrategyCard = ({ strategy, loading }) => {
  if (loading) {
    return (
      <div className="strategy-card loading">
        <div className="spinner"></div>
        <p>Generating optimization strategies...</p>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="strategy-card empty">
        <p>The efficiency plan will appear here after a recommendation.</p>
      </div>
    );
  }

  return (
    <div className="strategy-card">
      <div className="section-kicker">03 / Efficiency plan</div>
      <h2>Use less. Grow well.</h2>

      {/* Water Savings Section */}
      <div className="savings-section">
        <h3>Water use & savings</h3>
        <div className="savings-metrics">
          <div className="metric">
            <div className="metric-value" style={{ color: 'var(--mint)' }}>
              {strategy.potential_water_saving_percent.toFixed(1)}%
            </div>
            <div className="metric-label">Efficiency gain</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: 'var(--earth)' }}>
              {strategy.water_saved_mm.toFixed(2)} mm
            </div>
            <div className="metric-label">Saved per cycle</div>
          </div>
        </div>
        <div className="water-volume-grid">
          <div>
            <span className="metric-label">Drip applied</span>
            <strong>{strategy.recommended_water_mm.toFixed(2)} mm</strong>
            <small>{strategy.recommended_water_m3_per_hectare.toFixed(2)} m³/ha</small>
          </div>
          <div>
            <span className="metric-label">Conventional applied</span>
            <strong>{strategy.conventional_water_mm.toFixed(2)} mm</strong>
            <small>{(strategy.conventional_water_mm * 10).toFixed(2)} m³/ha</small>
          </div>
          <div>
            <span className="metric-label">Saved at field scale</span>
            <strong>{strategy.water_saved_l_per_m2.toFixed(2)} L/m²</strong>
            <small>{strategy.water_saved_m3_per_hectare.toFixed(2)} m³/ha</small>
          </div>
        </div>
        <p className="calculation-basis">{strategy.calculation_basis} Cost savings are not estimated without a local water and energy tariff.</p>
      </div>

      {/* Drip Irrigation Setup */}
      <div className="drip-setup-section">
        <h3>Recommended drip setup</h3>
        <div className="drip-details">
          <div className="detail-row">
            <span className="label">System Type:</span>
            <span className="value">{strategy.drip_irrigation_setup.system_type}</span>
          </div>
          <div className="detail-row">
            <span className="label">Emitter Spacing:</span>
            <span className="value">{strategy.drip_irrigation_setup.emitter_spacing_cm} cm</span>
          </div>
          <div className="detail-row">
            <span className="label">Dripper Flow Rate:</span>
            <span className="value">{strategy.drip_irrigation_setup.dripper_flow_rate_lph} LPH</span>
          </div>
          <div className="detail-row">
            <span className="label">Setup Cost:</span>
            <span className="value">{strategy.drip_irrigation_setup.setup_cost_estimation}</span>
          </div>
          <div className="detail-row">
            <span className="label">ROI Period:</span>
            <span className="value">{strategy.drip_irrigation_setup.roi_months} months</span>
          </div>
          <div className="detail-row">
            <span className="label">Maintenance:</span>
            <span className="value">{strategy.drip_irrigation_setup.maintenance_schedule}</span>
          </div>
        </div>
      </div>

      {/* Conservation Tips */}
      <div className="tips-section">
        <h3>Water conservation tips</h3>
        <ul className="tips-list">
          {strategy.water_conservation_tips.map((tip, index) => (
            <li key={index} className="tip-item">
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrategyCard;
