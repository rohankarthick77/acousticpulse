# AcousticPulse 🌐🔊
### Urban Noise Pollution Spatial Mapping & Acoustic Profile Analytics Platform

> *"Listen to the City. Understand the Noise. Improve the Future."*

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://github.com/codespaces/new?repo=rohankarthick77/acousticpulse)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/rohankarthick77/acousticpulse)

AcousticPulse is a smart-city environmental command-center web application that monitors, analyzes, and mitigates urban noise pollution. It combines real-time simulated telemetry, GIS spatial heat mapping, automated citizen grievance lifecycle workflows, predictive policy mitigation sandboxes, and diurnal acoustic pattern intelligence.

---

## ⚡ 1-Click Instant Cloud Run (No Local Installation Needed)

You can run and test the complete platform directly in your browser without installing anything locally:

1. **[Launch via GitHub Codespaces](https://github.com/codespaces/new?repo=rohankarthick77/acousticpulse)**
   - Click the link above and click **"Create codespace"**.
   - It will automatically build the environment, seed the smart city database, and launch the web app with a live preview.

2. **[Launch via Gitpod](https://gitpod.io/#https://github.com/rohankarthick77/acousticpulse)**
   - Click the link above to spin up a live cloud workspace with one click.

---

## 🌟 Key Features

### 📡 1. Real-Time Spatial GIS Noise Mapping
- **Interactive Leaflet Cartography**: Live GIS monitoring with dark/light map tiles and custom pulsing SVG beacons.
- **Severity Classification**:
  - 🟢 **Safe**: `< 55 dBA` (Silent / Eco zones)
  - 🟡 **Moderate**: `55 – 65 dBA` (Residential / Commercial ambient)
  - 🟠 **High**: `65 – 75 dBA` (Heavy transit / Commercial hubs)
  - 🔴 **Critical**: `> 75 dBA` (Industrial zones / Threshold violations)
- **Acoustic Dispersion Contours**: Dynamic spatial radius circles indicating noise spread and violation boundaries.
- **Live Waveform Spectrum**: Visualizing streaming audio decibels in real time.

### 📊 2. Deep Acoustic Analytics & Urban Health Score
- **Urban Noise Health Score (0–100)**: Multi-factor composite index based on overall exposure, night compliance, violation frequency, and citizen sentiment.
- **24-Hour Diurnal Curves**: Hourly decibel trends comparing actual levels against morning/evening rush hours and statutory day/night limits.
- **Source Attribution & Comparative Analytics**: Decibel breakdown by source (Traffic, Construction, Industrial, Public Address, Commercial) and cross-station rankings.

### 📋 3. Citizen Grievance & Authority Resolution Workflow
- **Public Intake Portal**: Citizen complaint registration with location, severity rating, and auto-generated tracking ID (e.g. `AP-2026-XXXXXX`).
- **Real-Time Lifecycle Stepper**: `Submitted` ➔ `Under Review` ➔ `Verified` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`.
- **Authority Investigation Console**: Kanban & Table views with officer assignment, investigation timeline audit logs, and on-site before/after dBA verification.

### 🧪 4. Noise Mitigation Policy Simulator
- **Interactive Policy Sliders**:
  - Traffic Speed Reduction (%)
  - Heavy Vehicle Night Curfew (%)
  - Construction Acoustic Barriers (%)
  - Industrial Machining Throttling (%)
  - Public Event Decibel Caps (%)
- **Predictive Recalculation Engine**: Real-time projected dBA reduction, health score delta, violation decrease, and population protected from sleep disruption.

### 📑 5. Smart Recommendations & Audit Reporting
- **AI Quiet Hours Recommendation**: Empirically detects optimal quiet windows (e.g., `11:00 PM – 05:30 AM`) with statistical confidence.
- **Multi-Format Export**: One-click **CSV Data Export** and **Printable PDF Summary Reports**.
- **Anomaly Detection Feed**: Proactive alerts for critical spikes, sustained night exposure, and sensor anomalies.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Fast fuzzy searching across all stations, complaints, alerts, and navigation routes.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, React Router v6, Chart.js, react-chartjs-2, Leaflet, React-Leaflet, Lucide Icons, CSS Variables & Glassmorphism |
| **Backend** | Node.js, Express, REST APIs, JSON Web Tokens (JWT), BcryptJS |
| **Database & ORM** | SQLite, Prisma ORM v6 |
| **Tooling & Dev** | Concurrently, Nodemon, DevContainers |

---

## 👥 Demo User Credentials

The platform features role-based access control (RBAC). The landing page also contains **1-Click Demo Buttons** to instantly log in as any role:

| Role | Email | Password | Access Privileges |
| :--- | :--- | :--- | :--- |
| **Municipal Admin** | `admin@acousticpulse.gov` | `Admin@12345` | Complete platform administration, station CRUD, user management, telemetry settings |
| **Environmental Officer** | `officer.chennai@acousticpulse.gov` | `Officer@12345` | Complaint Kanban board, officer assignment, verification audits, alert resolution |
| **Urban Citizen** | `citizen@acousticpulse.gov` | `Citizen@12345` | Public GIS noise map, grievance submission, live tracking portal |

---

## 🚀 Local Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (v9 or higher)

### 1. Clone the Repository
```bash
git clone https://github.com/rohankarthick77/acousticpulse.git
cd acousticpulse
```

### 2. Automated Setup
```bash
# Installs dependencies, sets up Prisma SQLite DB, and seeds smart city data
npm run setup
```

### 3. Run Development Server
```bash
# Runs backend on port 5001 and frontend on port 3000 concurrently
npm run dev
```

Open **`http://localhost:3000`** in your browser.

---

## 📁 Project Architecture

```
├── .devcontainer/              # GitHub Codespaces 1-click cloud configuration
├── client/                     # React 19 Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI, Layout, & Map components
│   │   │   ├── layout/         # Sidebar, TopNav, AppLayout, CommandPalette
│   │   │   ├── map/            # Leaflet NoiseMap with pulsing beacons
│   │   │   └── ui/             # StatCard, HealthGauge, NoiseBadge, Modals, Waveforms
│   │   ├── context/            # AuthContext, ThemeContext, ToastContext
│   │   ├── pages/              # 14 Application Pages (Dashboard, GIS Map, Analytics, etc.)
│   │   ├── services/           # Axios / Fetch API client
│   │   ├── index.css           # Global Theme & Glassmorphic Design System
│   │   └── App.jsx             # React Router routing configuration
│   └── vite.config.js          # Vite config with API proxy
│
├── server/                     # Express & Prisma Backend
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema (Stations, Readings, Complaints, Alerts)
│   │   └── seed.js             # Rich seed script with Chennai smart city dataset
│   ├── src/
│   │   ├── controllers/        # REST API controllers
│   │   ├── middleware/         # JWT Auth & Role Authorization
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Diurnal simulation engine & Health score algorithm
│   │   ├── config.js           # Server configuration & decibel thresholds
│   │   └── index.js            # Express application entrypoint
│   └── test-api.js             # Automated API test suite
│
├── package.json                # Monorepo scripts (concurrently dev runner)
└── README.md                   # Project documentation
```

---

## 🧪 Automated Testing

Run the automated backend test suite:

```bash
cd server
node test-api.js
```

---

## 📜 License
This project is licensed under the MIT License.
