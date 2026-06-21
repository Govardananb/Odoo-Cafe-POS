# ngrok Setup — Mobile QR Ordering

## Quick Start (3 commands)

```powershell
# Terminal 1 — Next.js (already binds to 0.0.0.0)
npm run dev

# Terminal 2 — ngrok tunnel
ngrok http 3000
```

Copy the ngrok URL → paste into `.env.local`:
```env
NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
```

Restart Next.js → go to **Admin → Tables** → click 🔲 QR icon → scan from phone.

---

## Full Guide

See the detailed walkthrough in the Antigravity IDE artifact or read below.

### Install ngrok
```powershell
winget install ngrok
# or download from https://ngrok.com/download
```

### Environment Variables
Copy `.env.example` → `.env.local` and set your ngrok URL:
```env
NEXT_PUBLIC_APP_URL=https://YOUR-SUBDOMAIN.ngrok-free.app
```

### QR URL Format
```
{APP_URL}/s/{table-token}
```
Example: `https://abc123.ngrok-free.app/s/b2Rvb19jYWZlX3RhYmxlOmcx`

### Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Start on 0.0.0.0:3000 (ngrok compatible) |
| `npm run dev:local` | Start on localhost only |
| `npm run ngrok` | Start ngrok on port 3000 |

### Security
- Invalid tokens → rejected with error screen
- Disabled tables → rejected
- Deleted tables → rejected

### Troubleshooting
- **"Invalid Host" error** → already handled in `next.config.mjs` (all `.ngrok-free.app` domains allowed)
- **QR shows localhost** → restart Next.js after updating `.env.local`
- **ngrok URL changed** → free plan gives new URL each session; update `.env.local` and restart
