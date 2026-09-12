# Smart Cloud Dashboard

Web dashboard for my [Smart Cloud Autoscaling & Cost Optimizer](https://github.com/SoyabKhan560/smart-cloud-autoscaling-cost-optimizer) project.

**Live demo:** https://smart-cloud-autoscaling-cost-optimi.vercel.app

> The live demo runs on simulated data in the browser (`USE_MOCK_API: true` in `js/config.js`). Set it to `false` to use the Flask API in `backend/`.

## Pages

- **Dashboard:** CPU and memory usage with live charts and warning or critical status
- **Autoscaling:** adjustable scale-up and scale-down thresholds, plus manual scale up and down
- **Cost:** cost charts and estimated monthly savings
- **Alerts:** warning and critical alerts that can be marked as resolved
- **Settings:** cloud, autoscaling and notification settings

## Tech

- HTML, CSS and JavaScript (ES modules, no framework)
- Flask API in `backend/server.py`
- Deployed on Vercel

## Run locally

```bash
node serve.cjs                                   # frontend on http://localhost:3000
cd backend && pip install -r requirements.txt
python server.py                                 # API on http://localhost:5000
```
