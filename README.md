# AI Smart Irrigation Recommendation System

## 🌾 Project Overview

An intelligent AI-powered irrigation recommendation system that predicts optimal water requirements for crops based on real-time sensor data. The system combines machine learning regression models with generative AI explanations to provide actionable irrigation insights.

### Problem Statement

Agricultural water management is critical for sustainable farming. Farmers need intelligent, data-driven recommendations to:
- Optimize water usage and reduce waste
- Predict irrigation requirements accurately
- Understand the reasoning behind recommendations
- Plan watering schedules efficiently
- Implement drip irrigation systems effectively

This system addresses these challenges using ML predictions and GenAI explanations.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: React 18
- **HTTP Client**: Axios
- **Styling**: CSS3 with custom design system
- **Build Tool**: Create React App (react-scripts)

### Backend
- **Framework**: FastAPI
- **Server**: Uvicorn + Gunicorn
- **Language**: Python 3.9+

### Machine Learning
- **ML Library**: scikit-learn
- **Data Processing**: pandas, numpy
- **Model Persistence**: joblib

### Generative AI
- **Engine**: HuggingFace Transformers (FLAN-T5)
- **Deep Learning**: PyTorch
- **Tasks**: Text generation, summarization, explanation

### Dataset
- **Source**: Kaggle Irrigation Dataset
- **Format**: CSV
- **Features**: Temperature, Humidity, Soil Moisture, Rainfall, Crop Type
- **Target**: Irrigation Amount (mm)

---

## 📁 Project Structure

```
ai-irrigation-system/
├── dataset/
│   └── irrigation_data.csv              # Raw training dataset
├── models/
│   ├── irrigation_model.pkl             # Trained regression model
│   ├── scaler.pkl                       # Feature scaler
│   └── crop_encoder.pkl                 # Categorical encoder
├── backend/
│   ├── main.py                          # FastAPI entry point
│   ├── requirements.txt                 # Python dependencies
│   ├── .env                             # Environment variables
│   ├── routes/
│   │   └── irrigation_routes.py         # API endpoints
│   ├── services/
│   │   ├── irrigation_service.py        # Prediction logic
│   │   ├── alert_service.py             # Alert generation
│   │   └── optimization_service.py      # Water-saving strategies
│   ├── ml_model/
│   │   ├── data_preprocessing.py        # Data cleaning & scaling
│   │   └── train_irrigation_model.py    # Model training
│   ├── genai_engine/
│   │   └── genai_irrigation_engine.py   # HuggingFace integration
│   ├── schemas/
│   │   └── irrigation_schema.py         # Request/response models
│   └── utils/
│       ├── logger.py                    # Logging configuration
│       └── config.py                    # Config management
├── frontend/
│   ├── package.json                     # Node.js dependencies
│   ├── public/
│   │   └── index.html                   # HTML entry point
│   └── src/
│       ├── App.js                       # Root component
│       ├── App.css                      # Global styles
│       ├── index.js                     # React root
│       ├── components/
│       │   ├── InputForm.jsx            # Sensor input form
│       │   ├── InputForm.css
│       │   ├── RecommendationCard.jsx   # Prediction card
│       │   ├── RecommendationCard.css
│       │   ├── AlertCard.jsx            # Alert display
│       │   ├── AlertCard.css
│       │   ├── StrategyCard.jsx         # Optimization strategies
│       │   ├── StrategyCard.css
│       │   ├── ScheduleCard.jsx         # Watering schedule
│       │   └── ScheduleCard.css
│       ├── pages/
│       │   ├── IrrigationDashboard.jsx  # Main dashboard page
│       │   └── IrrigationDashboard.css
│       ├── services/
│       │   └── irrigationService.js     # API integration
│       └── styles/
│           └── dashboard.css            # Design system
├── README.md                            # This file
├── .gitignore                           # Git ignore rules
└── DEPLOYMENT.md                        # Deployment guide
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9 or higher
- Node.js 16 or higher
- pip and npm package managers

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create Python virtual environment**:
   ```bash
   python -m venv venv
   source venv/Scripts/activate  # Windows
   # or
   source venv/bin/activate      # macOS/Linux
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment**:
   - Edit `.env` file with your settings
   - Default model paths: `models/irrigation_model.pkl`, etc.

5. **Train the ML model** (optional, one-time setup):
   ```bash
   python ml_model/train_irrigation_model.py
   ```
   This creates model artifacts in the `models/` directory.

6. **Start FastAPI server**:
   ```bash
   uvicorn main:app --reload
   ```
   API will be available at: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm start
   ```
   Dashboard will open at: `http://localhost:3000`

---

## ⏱️ Real-Time Usage (How This Works in Live Farming)

This project is built for practical day-to-day irrigation decisions using current field conditions.

### Real-Time Workflow

1. **Collect field data**
   - Farmer enters live values from sensors or manual readings:
   - Temperature, humidity, soil moisture, rainfall, crop type
   - Optional: farm location (latitude/longitude) and soil erosion risk

2. **Send data to API instantly**
   - Frontend sends request to FastAPI:
   - `POST /api/predict-irrigation`

3. **Generate recommendation in backend**
   - Backend prepares and scales features
   - RandomForest model predicts water requirement in mm
   - Service computes watering frequency and best irrigation time
   - GenAI generates a farmer-friendly explanation (fallback text is used if GenAI is disabled)

4. **Show actionable output on dashboard**
   - Recommended water amount (`water_requirement_mm`)
   - Watering frequency (`watering_frequency_days`)
   - Best time to irrigate (`best_time_of_day`)
   - Alert severity and action plan
   - Water-saving optimization strategy

5. **Take immediate action in the field**
   - Farmer applies irrigation plan
   - Team can re-enter updated values and get a fresh recommendation in seconds

### Example Real-Time Scenario

- A wheat farm reports: 32°C temperature, 35% humidity, 28% soil moisture, and no recent rain.
- The system predicts higher water demand and returns a near-term watering schedule.
- Alert endpoint marks risk as high and recommends urgent irrigation.
- Optimization endpoint suggests drip configuration and conservation tips to reduce waste.

This loop supports continuous monitoring and rapid decision-making, especially during heat waves, drought windows, or changing weather patterns.

---

## 📊 Model Training

### Dataset Preparation

1. **Download Kaggle Irrigation Dataset**:
   ```bash
   # Place CSV file in dataset/irrigation_data.csv
   ```

2. **Data Structure**:
   The CSV should contain:
   - `temperature` (°C)
   - `humidity` (%)
   - `soil_moisture` (%)
   - `rainfall` (mm)
   - `crop_type` (categorical)
   - `irrigation_amount` (target, in mm)

### Training Pipeline

```bash
cd backend
python ml_model/train_irrigation_model.py
```

This script:
1. Loads and cleans data
2. Engineers features
3. Encodes categorical variables
4. Scales numerical features
5. Trains RandomForest regressor
6. Evaluates on test set
7. Saves artifacts to `models/`

### Model Artifacts
- `irrigation_model.pkl`: Trained RandomForest model
- `scaler.pkl`: StandardScaler for feature normalization
- `crop_encoder.pkl`: LabelEncoder for crop types

---

## 🔌 API Usage Examples

### 1. Get Irrigation Prediction

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28.5,
    "humidity": 65,
    "soil_moisture": 45,
    "rainfall": 5.2,
    "crop_type": "wheat"
  }'
```

**Response**:
```json
{
  "water_requirement_mm": 22.5,
  "crop_type": "wheat",
  "explanation": "Based on current conditions...",
  "confidence_score": 0.87,
  "watering_frequency_days": 3,
  "best_time_of_day": "Early morning (4-6 AM)",
  "timestamp": "2024-04-02T10:30:00"
}
```

### 2. Generate Irrigation Alert

```bash
curl -X POST "http://localhost:8000/api/generate-alert" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 35,
    "humidity": 25,
    "soil_moisture": 20,
    "rainfall": 0,
    "crop_type": "cotton"
  }'
```

**Response**:
```json
{
  "severity": "critical",
  "message": "🚨 CRITICAL: Soil moisture critically low at 20%...",
  "recommended_action": "IRRIGATE IMMEDIATELY - Apply emergency irrigation...",
  "alert_timestamp": "2024-04-02T10:35:00"
}
```

### 3. Get Optimization Strategy

```bash
curl -X POST "http://localhost:8000/api/optimization-strategy" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28,
    "humidity": 60,
    "soil_moisture": 50,
    "rainfall": 10,
    "crop_type": "rice"
  }'
```

### 4. Health Check

```bash
curl "http://localhost:8000/healthz"
```

### 5. Model Information

```bash
curl "http://localhost:8000/api/model-info"
```

---

## 🎨 Frontend Features

### Dashboard Components

1. **InputForm**: Collects sensor data
   - Temperature, Humidity, Soil Moisture, Rainfall
   - Crop type selector
   - Real-time value display

2. **RecommendationCard**: ML prediction results
   - Water requirement gauge
   - Confidence score
   - Watering frequency
   - GenAI explanation
   - Best irrigation time

3. **AlertCard**: Irrigation alerts
   - Severity levels (low, medium, high, critical)
   - Alert messages with real-time conditions
   - Recommended actions
   - Timestamp tracking

4. **StrategyCard**: Water-saving strategies
   - Potential water savings percentage
   - Drip irrigation setup recommendations
   - Emitter spacing and flow rates
   - Water conservation tips
   - ROI calculations

5. **ScheduleCard**: Watering schedule
   - Next 2 weeks calendar view
   - Scheduled watering dates
   - Time recommendations
   - Schedule management tips

---

## 🔐 Environment Configuration

Backend `.env` file:

```env
# Model Paths
MODEL_PATH=models/irrigation_model.pkl
SCALER_PATH=models/scaler.pkl
ENCODER_PATH=models/crop_encoder.pkl

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# GenAI Configuration
GENAI_MODEL=facebook/bart-large-cnn
USE_GPU=false

# Logging
LOG_LEVEL=INFO

# Environment
ENVIRONMENT=development
DEBUG=true
```

Frontend `.env`:

```env
REACT_APP_API_URL=http://localhost:8000/api
```

---

## 📈 Performance Metrics

### ML Model Evaluation

- **Algorithm**: RandomForest Regressor (100 trees, max_depth=15)
- **Typical Metrics**:
  - RMSE: ~2.5mm
  - MAE: ~1.8mm
  - R² Score: ~0.89

### GenAI Engine

- **Model**: BART (facebook/bart-large-cnn)
- **Alternative**: FLAN-T5 (google/flan-t5-base)
- **Latency**: ~500ms per explanation
- **Max Length**: 150 tokens

### API Response Times

- Prediction: ~50ms (model) + ~500ms (GenAI) = ~550ms
- Alert: ~10ms
- Optimization: ~15ms

---

## 🔄 Data Flow

```
Sensor Data (User Input)
    ↓
[InputForm Component]
    ↓
[Axios API Call]
    ↓
[FastAPI Server]
    ↓
[Feature Scaling] → [scaler.pkl]
    ↓
[ML Prediction] → [irrigation_model.pkl]
    ↓
[GenAI Explanation] → [transformers]
    ↓
[Response JSON]
    ↓
[React Components Update]
    ↓
[Dashboard Display]
```

---

## 🐛 Troubleshooting

### Backend Issues

1. **Model loading fails**:
   - Ensure `models/` directory exists
   - Run training script: `python ml_model/train_irrigation_model.py`
   - Check MODEL_PATH in `.env`

2. **GenAI model download fails**:
   - First run downloads HuggingFace model (~1.6GB)
   - Check internet connection
   - System falls back to rule-based explanations

3. **Port already in use**:
   - Change `API_PORT` in `.env`
   - Or kill existing process: `lsof -ti:8000 | xargs kill -9`

### Frontend Issues

1. **API connection fails**:
   - Ensure backend is running on port 8000
   - Check `REACT_APP_API_URL` in `.env`
   - Check browser console for CORS errors

2. **Slow performance**:
   - Clear browser cache
   - Check network tab in DevTools
   - Reduce CSS animations for older devices

---

## 📚 API Documentation

Full interactive API documentation available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 🚀 Deployment

### Backend (Render/Railway/Heroku)

```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 main:app
```

**Environment Variables**:
```
MODEL_PATH=models/irrigation_model.pkl
SCALER_PATH=models/scaler.pkl
ENCODER_PATH=models/crop_encoder.pkl
ENVIRONMENT=production
DEBUG=false
```

### Frontend (Firebase/Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy build/ folder to hosting service
```

**Frontend environment for production**:
```
REACT_APP_API_URL=https://your-api.com/api
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment steps.

---

## 📝 Model Retraining

To retrain the model with new data:

1. **Update dataset**:
   ```bash
   # Replace dataset/irrigation_data.csv with newer data
   ```

2. **Run training**:
   ```bash
   python backend/ml_model/train_irrigation_model.py
   ```

3. **Restart server**:
   ```bash
   # Stop and restart FastAPI server to load new model
   ```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/irrigation-enhancement`
3. Commit changes: `git commit -am 'Add irrigation feature'`
4. Push branch: `git push origin feature/irrigation-enhancement`
5. Submit pull request

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🔗 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [scikit-learn ML](https://scikit-learn.org/)
- [HuggingFace Transformers](https://huggingface.co/transformers/)
- [Kaggle Datasets](https://www.kaggle.com/datasets)

---

## 📧 Support

For issues, questions, or suggestions:
- Create GitHub issue
- Documentation: See DEPLOYMENT.md and API docs

---

**Version**: 1.0.0  
**Last Updated**: April 3, 2026  
**Status**: Active Development
