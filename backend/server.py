"""
Smart Cloud Autoscaling & Cost Optimizer - Reference Backend Server
Provides standard REST API endpoints with real-time psutil hardware telemetry
and simulated cluster autoscaling logic.
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import datetime
import random

try:
    import psutil
    PSUTIL_AVAILABLE = True
except ImportError:
    PSUTIL_AVAILABLE = False
    print("[WARNING] psutil not installed. Running in realistic simulation mode.")

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Requests for frontend SPA

# In-Memory Cluster State
CLUSTER_STATE = {
    "system": {
        "minServers": 1,
        "maxServers": 5,
        "activeServers": 3,
        "autoscalingActive": True,
        "scaleUpThreshold": 80,
        "scaleDownThreshold": 30,
        "cooldownSeconds": 300,
        "cloudStatus": "Connected",
        "provider": "AWS (us-east-1)",
        "monthlyCost": 128.40,
        "prevMonthlyCost": 163.10,
        "estimatedMonthlyCost": 142.00,
        "estimatedSavings": 34.70,
        "costEfficiency": 84
    },
    "servers": [
        {"id": "srv-01", "name": "app-prod-worker-01", "ip": "10.0.1.14", "status": "running", "cpu": 71, "memory": 58, "region": "us-east-1a", "uptime": "14d 6h"},
        {"id": "srv-02", "name": "app-prod-worker-02", "ip": "10.0.1.28", "status": "running", "cpu": 64, "memory": 52, "region": "us-east-1b", "uptime": "14d 6h"},
        {"id": "srv-03", "name": "app-prod-worker-03", "ip": "10.0.1.42", "status": "running", "cpu": 69, "memory": 53, "region": "us-east-1c", "uptime": "2d 11h"},
        {"id": "srv-04", "name": "app-prod-worker-04", "ip": "10.0.1.55", "status": "scaled-down", "cpu": 0, "memory": 0, "region": "us-east-1a", "uptime": "Standby"},
        {"id": "srv-05", "name": "app-prod-worker-05", "ip": "10.0.1.69", "status": "scaled-down", "cpu": 0, "memory": 0, "region": "us-east-1b", "uptime": "Standby"}
    ],
    "alerts": [
        {"id": "alt-101", "severity": "critical", "title": "High CPU Surge on Server Cluster", "desc": "Average CPU utilization crossed 85% for more than 3 consecutive sampling cycles.", "time": "12 mins ago", "status": "active"},
        {"id": "alt-102", "severity": "warning", "title": "Memory Threshold Warning", "desc": "Worker instance app-prod-worker-01 memory reached 88% cache threshold.", "time": "42 mins ago", "status": "active"},
        {"id": "alt-103", "severity": "info", "title": "Autoscaling Policy Triggered", "desc": "Workload increase detected. Provisioned 1 additional EC2 t3.large instance.", "time": "2 hours ago", "status": "resolved"},
        {"id": "alt-104", "severity": "warning", "title": "Unexpected Egress Cost Spike", "desc": "Outbound network transfer in us-east-1 exceeded daily budget threshold by 14%.", "time": "5 hours ago", "status": "active"}
    ],
    "recommendations": [
        {"id": "rec-1", "title": "Remove 1 Idle Server in us-east-1b", "desc": "Server app-prod-worker-04 had < 5% CPU utilization over the last 72 hours.", "savings": 24.50, "applied": False},
        {"id": "rec-2", "title": "Right-size Over-provisioned Memory", "desc": "Downgrade memory allocation from 16GB to 8GB on analytics staging nodes.", "savings": 18.20, "applied": False},
        {"id": "rec-3", "title": "Schedule Automated Night/Weekend Shutdown", "desc": "Power off non-production environments between 8:00 PM and 7:00 AM EST.", "savings": 31.00, "applied": False},
        {"id": "rec-4", "title": "Switch to 1-Year Compute Savings Plan", "desc": "Commit to baseline compute usage for predictable workload discount.", "savings": 45.00, "applied": False}
    ],
    "settings": {
        "provider": "AWS",
        "region": "us-east-1",
        "connected": True,
        "emailAlerts": True,
        "highCpuAlerts": True,
        "highCostAlerts": True,
        "autoscalingAlerts": True
    }
}

# 1. GET /api/metrics
@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    if PSUTIL_AVAILABLE:
        cpu = int(psutil.cpu_percent(interval=None))
        memory = int(psutil.virtual_memory().percent)
    else:
        cpu = random.randint(62, 75)
        memory = random.randint(50, 58)

    # Autoscaling verification logic
    sys = CLUSTER_STATE["system"]
    if sys["autoscalingActive"]:
        if cpu >= sys["scaleUpThreshold"] and sys["activeServers"] < sys["maxServers"]:
            sys["activeServers"] += 1
            CLUSTER_STATE["servers"][sys["activeServers"] - 1]["status"] = "running"
        elif cpu <= sys["scaleDownThreshold"] and sys["activeServers"] > sys["minServers"]:
            CLUSTER_STATE["servers"][sys["activeServers"] - 1]["status"] = "scaled-down"
            sys["activeServers"] -= 1

    return jsonify({
        "success": True,
        "data": {
            **sys,
            "cpuUsage": cpu,
            "memoryUsage": memory,
            "timestamp": datetime.datetime.now().isoformat()
        }
    })

# 2. GET /api/servers
@app.route('/api/servers', methods=['GET'])
def get_servers():
    return jsonify({
        "success": True,
        "data": CLUSTER_STATE["servers"]
    })

# 3. GET /api/autoscaling
@app.route('/api/autoscaling', methods=['GET'])
def get_autoscaling():
    return jsonify({
        "success": True,
        "data": CLUSTER_STATE["system"]
    })

# 4. POST /api/autoscaling
@app.route('/api/autoscaling', methods=['POST'])
def update_autoscaling():
    payload = request.get_json() or {}
    CLUSTER_STATE["system"].update(payload)
    return jsonify({
        "success": True,
        "message": "Autoscaling policy updated",
        "data": CLUSTER_STATE["system"]
    })

# 5. GET /api/cost
@app.route('/api/cost', methods=['GET'])
def get_cost():
    sys = CLUSTER_STATE["system"]
    return jsonify({
        "success": True,
        "data": {
            "monthlyCost": sys["monthlyCost"],
            "prevMonthlyCost": sys["prevMonthlyCost"],
            "estimatedMonthlyCost": sys["estimatedMonthlyCost"],
            "potentialSavings": sys["estimatedSavings"],
            "costEfficiency": sys["costEfficiency"],
            "breakdown": {
                "compute": 78.60,
                "storage": 24.30,
                "network": 15.50,
                "other": 10.00
            },
            "recommendations": CLUSTER_STATE["recommendations"]
        }
    })

# 6. GET /api/alerts
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    return jsonify({
        "success": True,
        "data": CLUSTER_STATE["alerts"]
    })

# 7. POST /api/alerts/resolve
@app.route('/api/alerts/resolve', methods=['POST'])
def resolve_alert():
    data = request.get_json() or {}
    alert_id = data.get("alertId")
    for alert in CLUSTER_STATE["alerts"]:
        if alert["id"] == alert_id:
            alert["status"] = "resolved"
            return jsonify({"success": True, "message": f"Alert {alert_id} resolved"})
    return jsonify({"success": False, "message": "Alert not found"}), 404

# 8. POST /api/assistant
@app.route('/api/assistant', methods=['POST'])
def ask_assistant():
    data = request.get_json() or {}
    query = (data.get("message") or "").lower()
    sys = CLUSTER_STATE["system"]

    if "scale" in query:
        reply = f"Cluster is currently running **{sys['activeServers']} active nodes**. Autoscaling trigger is set to scale out at **{sys['scaleUpThreshold']}% CPU**."
    elif "cost" in query or "saving" in query:
        reply = f"Current monthly cost is **${sys['monthlyCost']}**. You have **${sys['estimatedSavings']} in immediate potential savings**."
    else:
        reply = f"Infrastructure operational. Monitoring **AWS us-east-1** cluster with **{sys['activeServers']} nodes** online."

    return jsonify({
        "success": True,
        "data": {
            "reply": reply,
            "timestamp": datetime.datetime.now().isoformat()
        }
    })

# 9. GET /api/settings
@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify({
        "success": True,
        "data": CLUSTER_STATE["settings"]
    })

# 10. POST /api/settings
@app.route('/api/settings', methods=['POST'])
def update_settings():
    data = request.get_json() or {}
    CLUSTER_STATE["settings"].update(data)
    return jsonify({"success": True, "message": "Settings updated"})

if __name__ == '__main__':
    print("[INFO] Starting Smart Cloud Autoscaling & Cost Optimizer API server on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
