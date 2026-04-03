# API Testing & Examples Guide

## 🧪 Testing the Irrigation System

### Prerequisites

1. **Backend running**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

2. **Using cURL, Postman, or Python requests**

---

## 📋 Example Test Cases

### Test Case 1: Normal Conditions (wheat crop)

**Input**: Moderate temperature, adequate humidity, reasonable soil moisture

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 26,
    "humidity": 70,
    "soil_moisture": 55,
    "rainfall": 8,
    "crop_type": "wheat"
  }'
```

**Expected Response**:
```json
{
  "water_requirement_mm": 18.5,
  "crop_type": "wheat",
  "explanation": "Based on moderate conditions...",
  "confidence_score": 0.89,
  "watering_frequency_days": 4,
  "best_time_of_day": "Early morning (4-6 AM)",
  "timestamp": "2024-04-02T10:00:00"
}
```

**Alert Expected**: LOW
**Strategy**: Normal drip irrigation

---

### Test Case 2: Drought Conditions (cotton crop)

**Input**: High temperature, low humidity, critical soil moisture

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 38,
    "humidity": 25,
    "soil_moisture": 18,
    "rainfall": 0,
    "crop_type": "cotton"
  }'
```

**Expected Response**:
```json
{
  "water_requirement_mm": 45.2,
  "crop_type": "cotton",
  "explanation": "Critical drought conditions detected...",
  "confidence_score": 0.82,
  "watering_frequency_days": 1,
  "best_time_of_day": "Early morning (4-6 AM)",
  "timestamp": "2024-04-02T10:05:00"
}
```

**Alert Expected**: CRITICAL
**Strategy**: Emergency irrigation, maximum water savings

---

### Test Case 3: Wet Conditions (rice crop)

**Input**: Moderate temperature, high humidity, high rainfall, high soil moisture

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28,
    "humidity": 85,
    "soil_moisture": 80,
    "rainfall": 45,
    "crop_type": "rice"
  }'
```

**Expected Response**:
```json
{
  "water_requirement_mm": 5.2,
  "crop_type": "rice",
  "explanation": "Wet conditions with recent rainfall...",
  "confidence_score": 0.91,
  "watering_frequency_days": 7,
  "best_time_of_day": "Early morning (4-6 AM)",
  "timestamp": "2024-04-02T10:10:00"
}
```

**Alert Expected**: LOW
**Strategy**: Reduce watering, monitor soil drainage

---

## 🔧 API Testing with Python Requests

### Setup

```bash
pip install requests
```

### Test Script

```python
import requests
import json

BASE_URL = "http://localhost:8000/api"

# Test Cases
test_cases = [
    {
        "name": "Normal Conditions",
        "data": {
            "temperature": 26,
            "humidity": 70,
            "soil_moisture": 55,
            "rainfall": 8,
            "crop_type": "wheat"
        }
    },
    {
        "name": "Drought Conditions",
        "data": {
            "temperature": 38,
            "humidity": 25,
            "soil_moisture": 18,
            "rainfall": 0,
            "crop_type": "cotton"
        }
    },
    {
        "name": "Wet Conditions",
        "data": {
            "temperature": 28,
            "humidity": 85,
            "soil_moisture": 80,
            "rainfall": 45,
            "crop_type": "rice"
        }
    }
]

def test_prediction(test_data):
    """Test prediction endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/predict-irrigation",
            json=test_data,
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def test_alert(test_data):
    """Test alert endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/generate-alert",
            json=test_data,
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def test_strategy(test_data):
    """Test optimization strategy endpoint"""
    try:
        response = requests.post(
            f"{BASE_URL}/optimization-strategy",
            json=test_data,
            timeout=5
        )
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return {"error": str(e)}

# Run tests
for test_case in test_cases:
    print(f"\n{'='*60}")
    print(f"Test: {test_case['name']}")
    print(f"{'='*60}")
    
    print("\n📊 PREDICTION:")
    prediction = test_prediction(test_case['data'])
    print(json.dumps(prediction, indent=2))
    
    print("\n⚠️  ALERT:")
    alert = test_alert(test_case['data'])
    print(json.dumps(alert, indent=2))
    
    print("\n💡 OPTIMIZATION STRATEGY:")
    strategy = test_strategy(test_case['data'])
    print(json.dumps(strategy, indent=2))
```

### Run Tests

```bash
python api_test.py
```

---

## ✅ Health Check & Model Info

### Health Check

```bash
curl "http://localhost:8000/healthz"
```

**Response**:
```json
{
  "status": "healthy",
  "service": "AI Irrigation System API",
  "version": "1.0.0"
}
```

### Model Information

```bash
curl "http://localhost:8000/api/model-info"
```

**Response**:
```json
{
  "ml_model": "scikit-learn RandomForest Regressor",
  "genai_engine": "HuggingFace Transformers (flan-t5-base)",
  "model_status": "loaded",
  "genai_status": "loaded"
}
```

---

## 🧪 Edge Cases to Test

### Edge Case 1: Extreme Temperature

```json
{
  "temperature": 50,
  "humidity": 10,
  "soil_moisture": 10,
  "rainfall": 0,
  "crop_type": "wheat"
}
```

Expected: Maximum water requirement

### Edge Case 2: Negative Rainfall (data error)

```json
{
  "temperature": 25,
  "humidity": 50,
  "soil_moisture": 50,
  "rainfall": -5,
  "crop_type": "rice"
}
```

Expected: Validation error (should be ≥ 0)

### Edge Case 3: Invalid Crop Type

```json
{
  "temperature": 25,
  "humidity": 50,
  "soil_moisture": 50,
  "rainfall": 5,
  "crop_type": "unknown_crop"
}
```

Expected: Encoder handles fallback

### Edge Case 4: Extreme Humidity

```json
{
  "temperature": 20,
  "humidity": 100,
  "soil_moisture": 90,
  "rainfall": 50,
  "crop_type": "corn"
}
```

Expected: Very low water requirement

---

## 📈 Performance Testing

### Response Time Test

```python
import requests
import time

url = "http://localhost:8000/api/predict-irrigation"
data = {
    "temperature": 28,
    "humidity": 65,
    "soil_moisture": 45,
    "rainfall": 5,
    "crop_type": "wheat"
}

times = []
for i in range(10):
    start = time.time()
    response = requests.post(url, json=data)
    elapsed = (time.time() - start) * 1000
    times.append(elapsed)
    print(f"Request {i+1}: {elapsed:.2f}ms")

print(f"\nAverage: {sum(times)/len(times):.2f}ms")
print(f"Min: {min(times):.2f}ms")
print(f"Max: {max(times):.2f}ms")
```

### Expected Metrics
- First prediction: ~500-600ms (GenAI model loading)
- Subsequent predictions: ~500ms (GenAI latency)
- Without GenAI: ~50ms

---

## 🐛 Error Scenarios to Test

### Test Invalid Input

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": "invalid",
    "humidity": 65,
    "soil_moisture": 45,
    "rainfall": 5,
    "crop_type": "wheat"
  }'
```

Expected Response (422 Validation Error):
```json
{
  "detail": [
    {
      "loc": ["body", "temperature"],
      "msg": "value is not a valid float",
      "type": "type_error.float"
    }
  ]
}
```

### Test Missing Field

```bash
curl -X POST "http://localhost:8000/api/predict-irrigation" \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 28,
    "humidity": 65
  }'
```

Expected: 422 Validation Error (missing crop_type, etc.)

---

## 📊 Test Coverage

| Component | Test Type | Command |
|-----------|-----------|---------|
| Health Check | Basic | `curl /healthz` |
| Prediction | Normal | POST /api/predict-irrigation |
| Alert | Edge Cases | POST /api/generate-alert |
| Strategy | Performance | POST /api/optimization-strategy |
| Model Info | Status | GET /api/model-info |
| Validation | Error Handling | Invalid JSON payloads |

---

## 🔍 Frontend Testing

### Manual Testing Checklist

- [ ] Input form accepts all sensor values
- [ ] Form validation prevents invalid inputs
- [ ] Submit button initiates API request
- [ ] Loading spinner appears during request
- [ ] Recommendation card displays prediction
- [ ] Alert card shows severity and action
- [ ] Strategy card shows savings metrics
- [ ] Schedule card displays 2-week calendar
- [ ] Charts and visualizations render correctly
- [ ] Error handling shows proper messages
- [ ] Mobile responsiveness works

### Browser DevTools Testing

1. **Network Tab**:
   - Check API request/response times
   - Monitor payload sizes
   - Verify CORS headers

2. **Console Tab**:
   - Check for JavaScript errors
   - Verify async/await handling

3. **Performance Tab**:
   - Measure component render times
   - Check for memory leaks

---

## 🚀 Load Testing

### Using Apache Bench

```bash
# 100 requests, 10 concurrent
ab -n 100 -c 10 \
  -p payload.json \
  -T application/json \
  http://localhost:8000/api/predict-irrigation
```

### Using Locust

```python
from locust import HttpUser, task

class IrrigationUser(HttpUser):
    @task
    def predict(self):
        self.client.post(
            "/api/predict-irrigation",
            json={
                "temperature": 28,
                "humidity": 65,
                "soil_moisture": 45,
                "rainfall": 5,
                "crop_type": "wheat"
            }
        )
```

---

## 📝 documentation Testing

- [ ] README clarity and completeness
- [ ] Code comments accuracy
- [ ] API documentation truthfulness
- [ ] DEPLOYMENT.md step-by-step verification
- [ ] QUICKSTART.md walktrough execution

---

## ✨ Continuous Integration Suggestions

```yaml
# GitHub Actions workflow example
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Install dependencies
        run: pip install -r backend/requirements.txt
      - name: Run tests
        run: pytest backend/tests/

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Install dependencies
        run: npm install
        working-directory: ./frontend
      - name: Run tests
        run: npm test
        working-directory: ./frontend
```

---

## 📞 Support

For issues during testing:
1. Check backend logs: `logs/irrigation_api.log`
2. Check browser console for frontend errors
3. Verify model artifacts exist in `models/`
4. Ensure all environment variables are set
5. Restart both services and retry

---

Last Updated: April 2, 2024
