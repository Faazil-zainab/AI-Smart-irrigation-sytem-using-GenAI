import React from 'react';
import './RecommendationCard.css';
import { WaterDropVisual } from './FarmScene';

/**
 * RecommendationCard Component
 * Displays irrigation recommendation with water requirement and explanation
 */
const RecommendationCard = ({ prediction, loading }) => {
  if (loading) {
    return (
      <div className="recommendation-card loading">
        <div className="spinner"></div>
        <p>Analyzing irrigation requirements...</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="recommendation-card empty">
        <p>Run the model to see the recommended irrigation volume.</p>
      </div>
    );
  }

  const getWaterRequirementColor = (value) => {
    if (value < 10) return '#8fd6b4';      // Mint — low
    if (value < 20) return '#6fb6ff';      // Earth blue — moderate
    if (value < 30) return '#f2b36b';      // Amber — high
    return '#ff8f7a';                      // Coral — critical
  };

  return (
    <div className="recommendation-card">
      <div className="section-kicker">02 / Decision support</div>
      <h2>Recommended irrigation</h2>
      
      <div className="recommendation-header">
        <div className="crop-info">
          <span className="crop-badge">{prediction.crop_type.toUpperCase()}</span>
        </div>
      </div>

      <div className="water-requirement-display">
        <WaterDropVisual level={Math.min(1, prediction.water_requirement_mm / 40)} />
        <div className="water-gauge">
          <svg viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="rgba(201, 204, 211, 0.12)"
              strokeWidth="6"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={getWaterRequirementColor(prediction.water_requirement_mm)}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(prediction.water_requirement_mm / 50) * 565} 565`}
              transform="rotate(-90 100 100)"
            />
            <text
              x="100"
              y="102"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="30"
              fontWeight="500"
              fill={getWaterRequirementColor(prediction.water_requirement_mm)}
            >
              {prediction.water_requirement_mm.toFixed(1)}
            </text>
            <text
              x="100"
              y="128"
              textAnchor="middle"
              fontFamily="IBM Plex Mono, monospace"
              fontSize="10"
              letterSpacing="2"
              fill="#8b909b"
            >
              MM
            </text>
          </svg>
        </div>

        <div className="recommendation-details">
          <div className="detail-item">
            <span className="label">Water requirement</span>
            <span className="value">{prediction.water_requirement_mm.toFixed(2)} mm/cycle</span>
          </div>

          <div className="detail-item">
            <span className="label">Frequency</span>
            <span className="value">Every {prediction.watering_frequency_days} days</span>
          </div>

          <div className="detail-item">
            <span className="label">Best time</span>
            <span className="value">{prediction.best_time_of_day}</span>
          </div>

          <div className="detail-item detail-item-confidence">
            <span className="label">Confidence</span>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${prediction.confidence_score * 100}%` }}
              ></div>
            </div>
            <span className="value">{(prediction.confidence_score * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      <div className="explanation-box">
        <h3>Why this works</h3>
        <p>{prediction.explanation}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;
