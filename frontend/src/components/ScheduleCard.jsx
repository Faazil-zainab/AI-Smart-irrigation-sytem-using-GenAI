import React from 'react';
import './ScheduleCard.css';

/**
 * ScheduleCard Component
 * Displays watering schedule recommendations
 */
const ScheduleCard = ({ prediction, alert }) => {
  if (!prediction) {
    return (
      <div className="schedule-card empty d-flex align-items-center justify-content-center">
        <div className="text-center schedule-empty-wrap">
          <div className="display-6 mb-2">📅</div>
          <h5 className="mb-1">No Schedule Yet</h5>
          <p className="mb-0">Watering schedule will appear here after prediction.</p>
        </div>
      </div>
    );
  }

  // Calculate schedule based on prediction
  const getSchedule = () => {
    const frequency = prediction.watering_frequency_days;
    const days = [];
    const today = new Date();

    for (let i = 0; i < 14; i += frequency) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return days;
  };

  const getAlertColor = () => {
    if (!alert) return '#4CAF50';
    switch (alert.severity.toLowerCase()) {
      case 'critical':
        return '#D32F2F';
      case 'high':
        return '#F57C00';
      case 'medium':
        return '#FBC02D';
      case 'low':
        return '#4CAF50';
      default:
        return '#666';
    }
  };

  const schedule = getSchedule();

  return (
    <div className="schedule-card">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <h2 className="mb-0">📅 Watering Schedule</h2>
        <span className="badge rounded-pill schedule-status-badge">Next 14 Days Plan</span>
      </div>

      <div className="schedule-summary row g-2">
        <div className="summary-item col-12 col-md-4">
          <span className="label">Frequency:</span>
          <span className="value">Every {prediction.watering_frequency_days} days</span>
        </div>
        <div className="summary-item col-12 col-md-4">
          <span className="label">Water per cycle:</span>
          <span className="value">{prediction.water_requirement_mm.toFixed(2)} mm</span>
        </div>
        <div className="summary-item col-12 col-md-4">
          <span className="label">Recommended time:</span>
          <span className="value">{prediction.best_time_of_day}</span>
        </div>
      </div>

      <div className="schedule-calendar">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h3 className="mb-0">Next 2 Weeks</h3>
          <small className="text-muted">Tap a day to inspect slot</small>
        </div>
        <div className="calendar-grid">
          {schedule.map((date, index) => (
            <div key={index} className="calendar-day card shadow-sm border-0">
              <div className="date text-uppercase small">
                {date.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div
                className="irrigate-indicator"
                style={{
                  backgroundColor: getAlertColor(),
                  opacity: 0.8
                }}
              >
                💧
              </div>
              <div className="time">{prediction.best_time_of_day.split(' ')[0]} AM</div>
            </div>
          ))}
        </div>
      </div>

      <div className="schedule-tips">
        <h3>⚡ Schedule Management Tips</h3>
        <ul className="list-group list-group-flush">
          <li className="list-group-item">Set phone reminders for scheduled watering time</li>
          <li className="list-group-item">Monitor soil moisture daily to adjust schedule if needed</li>
          <li className="list-group-item">Check weather forecast before watering day</li>
          <li className="list-group-item">Skip watering if recent rainfall is above {(prediction.water_requirement_mm / 2).toFixed(2)}mm</li>
          <li className="list-group-item">Inspect drip lines weekly for clogs or breaks</li>
        </ul>
      </div>
    </div>
  );
};

export default ScheduleCard;
