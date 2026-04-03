import React from 'react';
import './RecommendationCard.css';

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
        <p>📈 Fill the form and submit to see irrigation recommendations</p>
      </div>
    );
  }

  const getWaterRequirementColor = (value) => {
    if (value < 10) return '#4CAF50';      // Green - Low
    if (value < 20) return '#8BC34A';      // Light Green - Moderate
    if (value < 30) return '#FFC107';      // Orange - High
    return '#F44336';                      // Red - Critical
  };

  return (
    <div className="recommendation-card">
      <h2>💧 Irrigation Recommendation</h2>
      
      <div className="recommendation-header">
        <div className="crop-info">
          <span className="crop-badge">{prediction.crop_type.toUpperCase()}</span>
        </div>
      </div>

      <div className="water-requirement-display">
        <div className="water-gauge">
          <svg viewBox="0 0 200 200">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="8"
            />
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke={getWaterRequirementColor(prediction.water_requirement_mm)}
              strokeWidth="8"
              strokeDasharray={`${(prediction.water_requirement_mm / 50) * 565} 565`}
              transform="rotate(-90 100 100)"
            />
            <text
              x="100"
              y="100"
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="32"
              fontWeight="bold"
              fill={getWaterRequirementColor(prediction.water_requirement_mm)}
            >
              {prediction.water_requirement_mm.toFixed(1)}
            </text>
            <text
              x="100"
              y="130"
              textAnchor="middle"
              fontSize="14"
              fill="#666"
            >
              millimeters
            </text>
          </svg>
        </div>

        <div className="recommendation-details">
          <div className="detail-item">
            <span className="label">💧 Water Requirement:</span>
            <span className="value">{prediction.water_requirement_mm.toFixed(2)} mm</span>
          </div>

          <div className="detail-item">
            <span className="label">🕐 Frequency:</span>
            <span className="value">Every {prediction.watering_frequency_days} days</span>
          </div>

          <div className="detail-item">
            <span className="label">⏰ Best Time:</span>
            <span className="value">{prediction.best_time_of_day}</span>
          </div>

          <div className="detail-item">
            <span className="label">✅ Confidence:</span>
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
        <h3>📋 Explanation</h3>
        <p>{prediction.explanation}</p>
      </div>
    </div>
  );
};

export default RecommendationCard;
