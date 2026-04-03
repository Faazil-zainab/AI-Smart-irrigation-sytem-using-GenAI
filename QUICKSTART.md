# Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

✅ Backend running at: `http://localhost:8000`

### 2. Frontend Setup (New Terminal)

```bash
cd frontend
npm install
npm start
```

✅ Frontend running at: `http://localhost:3000`

### 3. Test the System

1. Open http://localhost:3000
2. Fill in sensor data:
   - Temperature: 28°C
   - Humidity: 65%
   - Soil Moisture: 45%
   - Rainfall: 5mm
   - Crop Type: wheat
3. Click "Get Recommendation"
4. See irrigation prediction with explanation!

## 📚 Key Files

- **Backend Entry**: `backend/main.py`
- **Frontend Entry**: `frontend/src/App.js`
- **API Routes**: `backend/routes/irrigation_routes.py`
- **ML Model Training**: `backend/ml_model/train_irrigation_model.py`
- **Dashboard**: `frontend/src/pages/IrrigationDashboard.jsx`

## 🔗 Quick Links

- **API Docs**: http://localhost:8000/docs
- **Dashboard**: http://localhost:3000
- **Health Check**: http://localhost:8000/healthz

## ⚠️ First Run Notes

1. **First backend start**: GenAI model downloads (~1.6GB)
2. **Model training required**: Run `python backend/ml_model/train_irrigation_model.py` to generate model artifacts
3. **Slow first request**: GenAI model initialization takes ~30 seconds

## 🆘 Troubleshooting

**Backend won't start?**
```bash
# Check if port 8000 is in use
netstat -an | grep 8000  # macOS/Linux
netstat -ano | grep 8000  # Windows

# Kill the process and retry
```

**Frontend shows "Cannot GET /api/..."?**
- Ensure backend is running on port 8000
- Check `REACT_APP_API_URL` in frontend/.env

**Model not found?**
```bash
cd backend
python ml_model/train_irrigation_model.py
```

---

See [README.md](README.md) for full documentation.
See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions.
