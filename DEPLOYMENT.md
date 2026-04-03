# Deployment Guide - AI Smart Irrigation System

## 🚀 Production Deployment

This guide covers deploying the AI Smart Irrigation Recommendation System to production environments.

---

## Backend Deployment

### Option 1: Render.com (Recommended)

1. **Push code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Irrigation System"
   git branch -M main
   git remote add origin https://github.com/your-username/ai-irrigation-system
   git push -u origin main
   ```

2. **Create Render account**: https://render.com

3. **Deploy Backend**:
   - New → Web Service
   - Connect GitHub repository
   - Build Command: `pip install -r backend/requirements.txt`
   - Start Command: `cd backend && gunicorn -w 4 -b 0.0.0.0:8000 main:app`
   - Set environment variables:
     ```
     MODEL_PATH=models/irrigation_model.pkl
     SCALER_PATH=models/scaler.pkl
     ENCODER_PATH=models/crop_encoder.pkl
     ENVIRONMENT=production
     DEBUG=false
     ```

4. **Deploy**:
   - Click "Deploy"
   - API will be available at: `https://your-app.onrender.com`

### Option 2: Railway.app

1. **Install Railway CLI**:
   ```bash
   npm i -g @railway/cli
   ```

2. **Deploy**:
   ```bash
   railway login
   railway init
   railway add --name ai-irrigation-backend
   railway up
   ```

3. **Set Environment Variables**:
   ```bash
   railway variables set MODEL_PATH=models/irrigation_model.pkl
   railway variables set SCALER_PATH=models/scaler.pkl
   railway variables set ENCODER_PATH=models/crop_encoder.pkl
   ```

### Option 3: Heroku (Requires Credit Card)

1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   
   # Windows
   # Download from https://devcenter.heroku.com/articles/heroku-cli
   ```

2. **Deploy**:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

3. **Add Procfile** (root directory):
   ```procfile
   web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT main:app
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set MODEL_PATH=models/irrigation_model.pkl
   heroku config:set SCALER_PATH=models/scaler.pkl
   heroku config:set ENCODER_PATH=models/crop_encoder.pkl
   heroku config:set ENVIRONMENT=production
   ```

---

## Frontend Deployment

### Option 1: Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Configure Firebase**:
   ```bash
   firebase login
   firebase init
   # Select Hosting
   # Build folder: frontend/build
   ```

3. **Build frontend**:
   ```bash
   cd frontend
   npm run build
   ```

4. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

5. **Update API URL**:
   - Edit `frontend/.env.production`:
     ```
     REACT_APP_API_URL=https://your-backend-api.com/api
     ```

### Option 2: Vercel

1. **Push code to GitHub** (if not already done)

2. **Import project to Vercel**:
   ```bash
   npm i -g vercel
   vercel
   ```

3. **Configure**:
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

5. **Deploy**:
   ```bash
   vercel --prod
   ```

### Option 3: Netlify

1. **Connect GitHub**:
   - Drag and drop `frontend/build` folder, OR
   - Connect GitHub repository

2. **Configure**:
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

3. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://your-backend-api.com/api
   ```

4. **Deploy**: Netlify automatically deploys on push

---

## Full Stack Deployment (Docker)

### Create Docker Configuration

**Dockerfile.backend**:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]
```

**Dockerfile.frontend**:
```dockerfile
FROM node:16-alpine as build

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - MODEL_PATH=models/irrigation_model.pkl
      - SCALER_PATH=models/scaler.pkl
      - ENCODER_PATH=models/crop_encoder.pkl
      - ENVIRONMENT=production
    volumes:
      - ./models:/app/models
      - ./dataset:/app/dataset

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - REACT_APP_API_URL=http://localhost:8000/api
    depends_on:
      - backend
```

### Deploy with Docker:

```bash
docker-compose up -d
```

Access at:
- Frontend: `http://localhost`
- Backend: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

---

## Pre-Deployment Checklist

- [ ] Update `.env` for production settings
- [ ] Set `DEBUG=false` in backend
- [ ] Set `ENVIRONMENT=production`
- [ ] Verify `REACT_APP_API_URL` points to production backend
- [ ] Test all API endpoints with production data
- [ ] Verify model artifacts are included in deployment
- [ ] Set up CORS properly for production domain
- [ ] Configure SSL/HTTPS
- [ ] Test frontend with production API
- [ ] Set up logging and monitoring
- [ ] Configure database backups (if using database)
- [ ] Test error handling and fallbacks
- [ ] Verify GenAI model downloads on first run
- [ ] Set up health check monitoring

---

## Monitoring & Maintenance

### Backend Monitoring

1. **Enable logging**:
   ```python
   # In backend/utils/logger.py
   LOG_LEVEL=INFO  # or DEBUG for development
   ```

2. **Monitor endpoints**:
   ```bash
   # Health check
   curl https://your-api.com/healthz
   
   # Model info
   curl https://your-api.com/api/model-info
   ```

3. **Track errors**:
   - Check `logs/irrigation_api.log`
   - Monitor CloudWatch/Render logs

### Frontend Monitoring

1. **Enable error tracking** (add to React):
   ```javascript
   // Consider services like Sentry
   import * as Sentry from "@sentry/react";
   
   Sentry.init({ dsn: "YOUR_DSN" });
   ```

2. **Monitor performance**:
   - Use Lighthouse CI
   - Monitor Core Web Vitals
   - Track API response times

---

## Scaling Considerations

### Backend
- Add load balancer for multiple instances
- Use PostgreSQL/MongoDB for data persistence
- Cache predictions with Redis
- Use job queues for long-running tasks

### Frontend
- Enable CDN for static assets
- Implement Progressive Web App (PWA)
- Use code splitting for large bundles

---

## Troubleshooting Deployment

### Model artifacts not found
```bash
# Download/copy models before deployment
python backend/ml_model/train_irrigation_model.py
```

### GenAI model too large
```bash
# Use smaller model or download separately
GENAI_MODEL=google/flan-t5-small
```

### CORS errors
```python
# In backend/main.py, update allowed origins
allow_origins=["https://your-frontend.com"]
```

### Timeout issues
- Increase timeout for GenAI operations
- Use async tasks for long operations
- Implement caching

---

## Cost Estimates

| Service | Tier | Monthly Cost |
|---------|------|--------------|
| Render | Free (512MB) | $0 |
| Railway | Pay-as-you-go | $5-50 |
| Firebase | Free tier | $0 |
| Vercel | Hobby (free) | $0 |
| Netlify | Free tier | $0 |

---

## Rollback Strategy

1. **Keep previous version running**
2. **Version your API**: `/api/v1/predict`, `/api/v2/predict`
3. **Use feature flags** for gradual rollout
4. **Test in staging** before production
5. **Keep model artifacts versioned**

---

## Security Considerations

- [ ] Use HTTPS only
- [ ] Implement API authentication (optional)
- [ ] Add rate limiting
- [ ] Validate all inputs
- [ ] Sanitize error messages
- [ ] Keep dependencies updated
- [ ] Monitor for vulnerabilities
- [ ] Use environment variables for secrets

---

For issues or questions, create a GitHub issue or contact the development team.

**Last Updated**: April 2, 2024
