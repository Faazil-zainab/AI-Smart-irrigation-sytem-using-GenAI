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
        <p>💡 Optimization strategies will appear here</p>
      </div>
    );
  }

  return (
    <div className="strategy-card">
      <h2>🌱 Optimization Strategies</h2>

      {/* Water Savings Section */}
      <div className="savings-section">
        <h3>💰 Water & Cost Savings</h3>
        <div className="savings-metrics">
          <div className="metric">
            <div className="metric-value" style={{ color: '#4CAF50' }}>
              {strategy.potential_water_saving_percent.toFixed(1)}%
            </div>
            <div className="metric-label">Water Saved</div>
          </div>
          <div className="metric">
            <div className="metric-value" style={{ color: '#2196F3' }}>
              {strategy.expected_cost_savings_percent.toFixed(1)}%
            </div>
            <div className="metric-label">Cost Reduction</div>
          </div>
        </div>
      </div>

      {/* Drip Irrigation Setup */}
      <div className="drip-setup-section">
        <h3>🚰 Recommended Drip Irrigation Setup</h3>
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
        <h3>💧 Water Conservation Tips</h3>
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
