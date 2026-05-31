# CurseForge MVP — Käivitusjuhend

## Mida sul vaja on
- Windows 10/11, Mac või Linux
- Internetiühendus (allalaadimiseks)

---

## SAMM 1 — Paigalda Node.js

1. Mine: https://nodejs.org
2. Kliki rohelist nuppu "LTS" (soovitatav versioon)
3. Käivita allalaaditud installer, kliki "Next" kõikjal
4. Taaskäivita arvuti pärast installeerimist

**Kontrolli paigaldust** — ava Command Prompt (Windows) või Terminal (Mac):
```
node --version
npm --version
```
Mõlemad peaksid näitama versiooninumbrit (nt v20.11.0)

---

## SAMM 2 — Ava kaks terminali akent

### Terminal 1 — Backend (server)

Windows: otsi "Command Prompt" või "cmd" Start menüüst
Mac: otsi "Terminal" Spotlight otsingust (Cmd+Space)

```bash
# Mine backend kausta (muuda tee vastavalt kus fail asub)
cd curseforge-mvp/backend

# Paigalda vajalikud paketid (ainult esimesel korral)
npm install

# Käivita server
npm run dev
```

✅ Näed teadet: "Backend käib: http://localhost:3001"

### Terminal 2 — Frontend (veebileht)

Ava UUS terminali aken (ära sulge esimest!)

```bash
# Mine frontend kausta
cd curseforge-mvp/frontend

# Paigalda vajalikud paketid (ainult esimesel korral)
npm install

# Käivita veebileht
npm run dev
```

✅ Näed teadet: "Local: http://localhost:5173"

---

## SAMM 3 — Ava brauser

Mine aadressile: **http://localhost:5173**

🎉 CurseForge MVP peaks olema käivitunud!

---

## Kuidas kasutada

- **Avalehel** näed kõiki mänge ja populaarseid mode
- **Sirvi** — filtreeri mängu järgi, otsi, sorteeri
- **Registreeru** — loo konto päises "Registreeru" nupuga
- **Laadi üles** — logi sisse, siis "Laadi üles" menüüs
- **Laadi alla** — kliki "Laadi alla" nuppu mistahes modil

---

## Probleemide lahendamine

**"npm is not recognized"** — Node.js pole korrektselt paigaldatud, proovi uuesti

**"Port already in use"** — keegi kasutab juba porti, taaskäivita terminal

**Lehekülg ei laadi** — kontrolli et mõlemad terminalid töötavad

**"Cannot connect to backend"** — backend (Terminal 1) peab töötama enne frontendi

---

## Stopp

Kummagi terminali peal vajuta: **Ctrl + C**
