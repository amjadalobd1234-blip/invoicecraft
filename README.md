# InvoiceCraft — Professional Invoice Generator

Create beautiful, professional invoices in seconds — in **English or Arabic (full RTL)**.
No sign-up, no server, no tracking. Everything runs in the browser and your data never leaves it.

> This is the **paid, full version**. See `LICENSE.txt` for the terms and `INSTRUCTIONS.txt` for a friendly, step-by-step guide for non-technical users.

## Quick start
- **Easiest:** double-click `index.html`. It works in any modern browser, even with no internet.
- **Full offline mode + installable app (recommended):** host the folder on any static host
  (Netlify, Vercel, GitHub Pages, cPanel) or run `python3 -m http.server` locally.
  After the first visit it works offline and can be installed on Android, iPhone and desktop.

## Features

### Invoicing
- 3 templates (Minimal, Classic, Modern) + 7 accent colors + a custom color picker
- English / Arabic with one click — full right-to-left layout
- Live A4 preview · one-click PDF download (multi-page aware) · print
- Automatic numbering (`INV-001`, `INV-002` …) · tax · % or fixed discount · 25 currencies
- Logo upload (drag & drop) · status stamp (Paid / Unpaid / Overdue)
- Save, load and delete drafts · auto-saves every 30 s
- Shortcuts: Ctrl/⌘+S saves a draft · Ctrl/⌘+P prints · Enter adds a new item row

### 📤 Share buttons (below *Download PDF*)
| Button | What it does |
| --- | --- |
| **WhatsApp** | Opens `wa.me` with a ready bilingual message (Arabic + English): invoice number, sender and total. |
| **Gmail / Email** | Opens a `mailto:` to the client's email with subject and a polite body (invoice no., dates, total). If the client has no email, the text is copied instead. |
| **Copy image** | Renders the invoice with html2canvas and copies it as a **PNG** to the clipboard (`ClipboardItem`). If the browser can't write images to the clipboard, the PNG is downloaded instead. |

On phones the three buttons sit in the bottom bar above *Edit / Preview / PDF*.
Copying images needs a secure context (`https://`, `localhost`, or `file://`); otherwise the PNG is downloaded.

### 👥 Saved clients
- New **Saved Clients** section (collapsible) above *Bill To*, with live search by name / company / email
- **Use** fills *Bill To* (name, company, email, phone, address) and keeps your line items
- **Edit** and **Delete** (with confirmation) · **+ Add new client**
- After **Download PDF** for a new client a dialog asks *"Save this client for future use?"* — *Yes / No / Don't ask again*
  (the question can be re-enabled with a checkbox in the section)
- Tracks `invoiceCount` and `totalBilled` per client (re-downloading the same invoice number is never double-counted)
- Stored in `localStorage` under `invoicecraft.clients`

### 💾 Export / Import clients
- **Export clients** → `invoicecraft-clients-YYYY-MM-DD.json`
- **Import clients** → pick a JSON file; merges with existing clients and **skips duplicates by email**
  (clients without email are matched by name + company). Shows a summary, e.g. *"Imported 3 client(s) · 1 duplicate(s) skipped"*.
  Invalid files are rejected safely.

### ⭐ Service templates
- **Saved services** button in *Line Items* opens a list — click a service to add it as a line item (name, rate, quantity)
- **+ Add new service**, edit, delete, search; most-used services first
- A small **star** appears next to any item description — click it to save that item as a reusable service
  (filled star = already saved; click again to update its price)
- Stored in `localStorage` under `invoicecraft.services`

### Works everywhere
- Mobile-first responsive layout, RTL and LTR
- Installable PWA with offline support (service worker)
- No dependencies to install — jsPDF and html2canvas are bundled in `lib/`

## Customize
Edit the CONFIG block at the top of `app.js`: `NUMBER_PREFIX`, `ACCENTS`, `CURRENCIES`, `AUTOSAVE_MS`.
All text lives in the `I18N` object (English + Arabic). Colors and fonts are CSS variables at the top of `style.css`.
**When you change any file, bump `CACHE` in `sw.js`** (e.g. `invoicecraft-v2` → `invoicecraft-v3`) so returning users get the update.

## Files
```
index.html            app markup
style.css             design system + templates + responsive + print
app.js                all logic (config, i18n, invoice, share, clients, services)
sw.js                 offline service worker (bump CACHE on every change)
manifest.webmanifest  installable-app manifest
icon.svg              app icon
lib/                  local copies of jsPDF 2.5.1 and html2canvas 1.4.1
LICENSE.txt           commercial license
INSTRUCTIONS.txt      beginner-friendly guide (Arabic + English)
```

## Data & privacy
Everything is stored in the browser's `localStorage`:

| Key | Content |
| --- | --- |
| `ic.autosave`, `ic.drafts`, `ic.counter`, `ic.prefs` | current invoice, drafts, numbering, preferences |
| `invoicecraft.clients` | saved clients |
| `invoicecraft.services` | saved services |

Clearing site data removes them — use **Export clients** to keep a backup.

## Support
Email: **amjad.python.dev@yandex.com** — reply within 24 hours · 14-day money-back guarantee.

© 2026 Amjad. All rights reserved.
