import React from 'react';
import './AlertCard.css';

/**
 * AlertCard Component
 * Displays irrigation alerts and recommended actions
 */
const AlertCard = ({ alert, loading }) => {
  if (loading) {
    return (
      <div className="alert-card loading">
        <div className="spinner"></div>
        <p>Generating alerts...</p>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="alert-card empty">
        <p>Field alerts will appear here once the model has run.</p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '#ff8f7a';
      case 'high':
        return '#f2b36b';
      case 'medium':
        return '#f2e6c9';
      case 'low':
        return '#8fd6b4';
      default:
        return '#8b909b';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return '!!';
      case 'high':
        return '▲';
      case 'medium':
        return '◆';
      case 'low':
        return '●';
      default:
        return 'i';
    }
  };

  return (
    <div className="alert-card">
      <div
        className={`alert-header ${alert.severity.toLowerCase()}`}
        style={{ borderLeftColor: getSeverityColor(alert.severity) }}
      >
        <span className="severity-icon">{getSeverityIcon(alert.severity)}</span>
        <h2>Field alert</h2>
      </div>

      <div className="alert-content">
        <div className="severity-badge" style={{ backgroundColor: getSeverityColor(alert.severity) }}>
          {alert.severity.toUpperCase()}
        </div>

        <div className="alert-message">
          <p>{alert.message}</p>
        </div>

        <div className="recommended-action">
          <h3>Recommended action</h3>
          <p>{alert.recommended_action}</p>
        </div>
      </div>

      <div className="alert-footer">
        <span className="timestamp">
          Last updated: {new Date(alert.alert_timestamp).toLocaleString()}
        </span>
      </div>
    </div>
  );
};

export default AlertCard;
