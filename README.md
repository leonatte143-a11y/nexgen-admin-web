# KAIRO Admin Web

Central Admin Control Panel for KAIRO — React + Vite + TypeScript + MUI.

## Prerequisites

- Node.js 18+
- KAIRO backend running on port 4000 with seeded admin user

## Setup

```bash
cd KAIRO/admin-web
cp .env.example .env.local
npm install
```

Default API URL: `http://localhost:4000` (client appends `/api/v1` automatically)

## Run

```bash
# Terminal 1 — backend
cd ../backend
npm run dev

# Terminal 2 — admin web
npm run dev
```

Open http://localhost:5173

## Admin login (from backend seed)

- Email: `admin@kairo.local` (or `ADMIN_SEED_EMAIL` in backend `.env`)
- Password: `ChangeMe123!` (or `ADMIN_SEED_PASSWORD`)

## Modules

| Route | Feature |
|-------|---------|
| `/` | Dashboard / Command Center |
| `/kyc` | Partner Verification Hub |
| `/pricing` | Service & Pricing Manager |
| `/bookings` | Booking Management |
| `/live` | Live Bookings Monitor |
| `/support` | Dispute & Support Desk |
| `/payouts` | Payout & Settlement |
| `/geo` | Geo & Heatmaps (maps placeholder) |
| `/marketing` | Coupons & Marketing |
| `/users` | User Management |
| `/partners` | Partner Management |
| `/notifications` | Push / Broadcast |
| `/settings` | Commission, GST, OTP, surge |

All data is loaded from real backend APIs under `/api/v1/admin/*`.

## Production build

```bash
npm run build
npm run preview
```

Set `VITE_API_BASE_URL` to your production API origin (without `/api/v1`).
