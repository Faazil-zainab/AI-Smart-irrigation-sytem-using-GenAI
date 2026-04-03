# AI Smart Irrigation System - Architecture Overview

## 🏛️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER (REACT)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  IrrigationDashboard (Main Page)                        │    │
│  │  ┌──────────────┬──────────────┬──────────────────────┐ │    │
│  │  │  InputForm   │ Recommendation│ Alert Card          │ │    │
│  │  │              │    Card       │                    │ │    │
│  │  ├──────────────┼──────────────┼──────────────────────┤ │    │
│  │  │ StrategyCard │ ScheduleCard │ (More Cards)        │ │    │
│  │  └──────────────┴──────────────┴──────────────────────┘ │    │
│  │                                                           │    │
│  │  irrigationService (API Integration)                     │    │
│  └─────────────────────────────────────────────────────────┘    │
│                            │                                     │
│                            │ Axios HTTP Requests                │
│                            ▼                                     │
│                      (CORS Enabled)                             │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ REST API (JSON)
                             │
┌─────────────────────────────────────────────────────────────────┐
│                    FASTAPI BACKEND (Python)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  main.py (Entry Point)                                          │
│  │                                                               │
│  ├─ Routes Layer                                                │
│  │  └─ irrigation_routes.py                                    │
│  │     ├─ POST /api/predict-irrigation                         │
│  │     ├─ POST /api/generate-alert                             │
│  │     ├─ POST /api/optimization-strategy                      │
│  │     ├─ GET /api/model-info                                  │
│  │     └─ GET /healthz                                         │
│  │                                                               │
│  ├─ Services Layer (Business Logic)                             │
│  │  ├─ irrigation_service.py                                   │
│  │  │  ├─ predict_irrigation_requirement()                     │
│  │  │  └─ _generate_explanation() → GenAI                      │
│  │  │                                                            │
│  │  ├─ alert_service.py                                        │
│  │  │  ├─ generate_alert()                                     │
│  │  │  ├─ _determine_severity()                                │
│  │  │  └─ _recommend_action()                                  │
│  │  │                                                            │
│  │  └─ optimization_service.py                                 │
│  │     ├─ generate_optimization_strategy()                     │
│  │     ├─ _calculate_water_savings()                           │
│  │     └─ _generate_drip_setup()                               │
│  │                                                               │
│  ├─ ML Model Layer                                              │
│  │  ├─ ml_model/                                               │
│  │  │  ├─ data_preprocessing.py                                │
│  │  │  │  ├─ load_and_preprocess()                             │
│  │  │  │  ├─ _clean_data()                                     │
│  │  │  │  ├─ _engineer_features()                              │
│  │  │  │  └─ _encode_features()                                │
│  │  │  │                                                        │
│  │  │  └─ train_irrigation_model.py                            │
│  │  │     ├─ IrrigationModelTrainer                            │
│  │  │     ├─ train()                                           │
│  │  │     ├─ _evaluate_model()                                 │
│  │  │     └─ _save_artifacts()                                 │
│  │  │                                                            │
│  │  └─ Model Artifacts (models/)                               │
│  │     ├─ irrigation_model.pkl (RandomForest)                  │
│  │     ├─ scaler.pkl (StandardScaler)                          │
│  │     └─ crop_encoder.pkl (LabelEncoder)                      │
│  │                                                               │
│  ├─ GenAI Engine Layer                                          │
│  │  └─ genai_engine/                                           │
│  │     └─ genai_irrigation_engine.py                           │
│  │        ├─ generate_explanation()                            │
│  │        ├─ suggest_watering_frequency()                      │
│  │        └─ suggest_drip_optimization()                       │
│  │        (HuggingFace Transformers: BART/FLAN-T5)             │
│  │                                                               │
│  ├─ Schemas (Validation)                                        │
│  │  └─ schemas/                                                │
│  │     └─ irrigation_schema.py (Pydantic Models)              │
│  │        ├─ IrrigationPredictionRequest                       │
│  │        ├─ IrrigationPredictionResponse                      │
│  │        ├─ AlertResponse                                     │
│  │        └─ OptimizationStrategyResponse                      │
│  │                                                               │
│  └─ Utils                                                       │
│     ├─ logger.py (Logging Setup)                               │
│     └─ config.py (Environment Config)                          │
│                                                                   │
│  External Services:                                             │
│  ├─ HuggingFace Transformers (Cloud)                           │
│  │  └─ facebook/bart-large-cnn or google/flan-t5-base          │
│  │                                                               │
│  └─ scikit-learn (Local)                                        │
│     └─ RandomForest Model (Local execution)                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ Local File I/O
                             ▼
        ┌─────────────────────────────────────┐
        │     File System / Dataset Storage    │
        ├─────────────────────────────────────┤
        │ dataset/                            │
        │ └─ irrigation_data.csv              │
        │                                     │
        │ models/                             │
        │ ├─ irrigation_model.pkl             │
        │ ├─ scaler.pkl                       │
        │ └─ crop_encoder.pkl                 │
        │                                     │
        │ logs/                               │
        │ └─ irrigation_api.log               │
        └─────────────────────────────────────┘
```

---

## 📊 Data Flow Diagram

```
Sensor Input (React Form)
    ↓
┌─────────────────────────────────┐
│ IrrigationPredictionRequest      │
│ - temperature: 28.5°C            │
│ - humidity: 65%                  │
│ - soil_moisture: 45%             │
│ - rainfall: 5mm                  │
│ - crop_type: "wheat"             │
└─────────────────────────────────┘
    ↓ (HTTP POST)
┌─────────────────────────────────┐
│ FastAPI Route Handler            │
│ POST /api/predict-irrigation     │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ IrrigationService                │
│ 1. Prepare Features              │
│ 2. Scale with scaler.pkl         │
│ 3. Predict with model.pkl        │
│ 4. Generate GenAI explanation    │
└─────────────────────────────────┘
    ├─→ Feature Preparation
    │   ├─ Encode crop_type
    │   └─ Extract numeric features
    │
    ├─→ Feature Scaling
    │   └─ standardscaler.pkl
    │
    ├─→ ML Prediction
    │   ├─ RandomForest Model
    │   ├─ 100 decision trees
    │   └─ Output: water_requirement_mm
    │
    └─→ GenAI Explanation
        ├─ HuggingFace Transformers
        ├─ BART Model
        └─ Generate explanation text
    ↓
┌─────────────────────────────────┐
│ IrrigationPredictionResponse     │
│ - water_requirement_mm: 22.5     │
│ - explanation: "Based on..."     │
│ - confidence_score: 0.87         │
│ - watering_frequency_days: 3     │
│ - best_time_of_day: "4-6 AM"     │
└─────────────────────────────────┘
    ↓ (HTTP Response, JSON)
┌─────────────────────────────────┐
│ React Component State Update     │
│ RecommendationCard renders       │
└─────────────────────────────────┘
    ↓
┌─────────────────────────────────┐
│ Dashboard Display                │
│ - Water gauge visualization      │
│ - Explanation text               │
│ - Frequency and timing info      │
└─────────────────────────────────┘
```

---

## 🔄 Service Layer Interactions

```
                    Request
                       ↓
        ┌──────────────────────────┐
        │  IrrigationService       │
        └──────────────────────────┘
              ↙            ↖
    ┌─────────────┐   ┌────────────────┐
    │ ML Pipeline │   │  GenAI Engine  │
    └─────────────┘   └────────────────┘
         ↓                    ↓
    RandomForest          HuggingFace
    (sklearn)          Transformers
    
    (+)
    
Combine Results
    ↓
Response ← AlertService ← check conditions
    ↓
Response ← OptimizationService ← calculate savings
```

---

## 🏗️ Component Hierarchy

```
App
└── IrrigationDashboard (Page)
    ├── Sidebar
    │   └── InputForm (Component)
    │       └── Form inputs: temp, humidity, moisture, rainfall, crop
    │
    └── MainContent
        ├── ResultsRow 1
        │   ├── RecommendationCard
        │   │   ├── Water gauge visualization
        │   │   ├── Prediction details
        │   │   └── GenAI explanation
        │   │
        │   └── AlertCard
        │       ├── Severity indicator
        │       ├── Alert message
        │       └── Recommended action
        │
        └── ResultsRow 2
            ├── StrategyCard
            │   ├── Water savings metrics
            │   ├── Drip irrigation setup
            │   └── Conservation tips
            │
            └── ScheduleCard
                ├── 2-week schedule calendar
                ├── Watering times
                └── Management tips
```

---

## 🔌 API Endpoints

### Prediction Endpoint
```
POST /api/predict-irrigation
Request:  IrrigationPredictionRequest
Response: IrrigationPredictionResponse
Tasks:    Feature scaling → ML inference → GenAI explanation
Latency:  ~550ms (50ms model + 500ms GenAI)
```

### Alert Endpoint
```
POST /api/generate-alert
Request:  IrrigationPredictionRequest
Response: AlertResponse
Tasks:    Severity determination → Action recommendation
Latency:  ~10ms
```

### Optimization Endpoint
```
POST /api/optimization-strategy
Request:  IrrigationPredictionRequest
Response: OptimizationStrategyResponse
Tasks:    Water savings calculation → Drip setup generation
Latency:  ~15ms
```

---

## 🚀 Deployment Architecture

```
Development
    ├─ React (npm start)
    └─ FastAPI (uvicorn --reload)

Staging/Production
    ├─ Frontend
    │  ├─ Firebase Hosting / Vercel / Netlify
    │  └─ CDN for static assets
    │
    └─ Backend
       ├─ Render / Railway / Heroku
       ├─ Gunicorn (multiple workers)
       └─ HuggingFace models cached
```

---

## 📦 Dependency Tree

### Backend (Python)
```
fastapi → uvicorn → pydantic
scikit-learn → numpy → pandas
transformers → torch
joblib → pickle
```

### Frontend (Node)
```
react → react-dom
axios (HTTP client)
```

---

## 🔐 Data Isolation

```
User Input (React)
    → Validation (Pydantic schema)
    → Processing (Python services)
    → ML Inference (scikit-learn)
    → GenAI Processing (HuggingFace)
    → Formatted Response (JSON)
    → Display (React components)
```

No persistent database - stateless API design for easy scaling.

---

## ⚡ Performance Considerations

1. **Feature Preprocessing**: Vectorized with NumPy/Pandas
2. **ML Inference**: Fast with scikit-learn (no GPUs)
3. **GenAI Latency**: ~500ms per request (bottleneck)
4. **Frontend**: React optimized with component memoization
5. **Caching**: Can be added with Redis for frequent requests

---

## 🔧 Extension Points

1. **Add Database**:
   - Store predictions, alerts, user data
   - SQLAlchemy ORM integration

2. **Add Authentication**:
   - JWT tokens
   - User management

3. **Add More ML Models**:
   - Ensemble methods
   - Time-series forecasting

4. **Add Monitoring**:
   - Prometheus metrics
   - ELK stack logs

5. **Add Real-time Updates**:
   - WebSocket connections
   - Live sensor integration

---

Last Updated: April 2, 2024
