# LynnTrades → Telegram Alert Bridge

Receives TradingView webhook alerts and forwards them to Telegram.

---

## Setup

### 1. Create Telegram Bot
1. Message @BotFather on Telegram
2. `/newbot` → follow prompts → copy the **Bot Token**
3. Send your bot a message, then visit:
   `https://api.telegram.org/bot<TOKEN>/getUpdates`
4. Copy your **chat_id** from the response

### 2. Deploy to Railway (free)
1. Go to https://railway.app → New Project → Deploy from GitHub
2. Or: `railway up` from this folder after `npm i -g @railway/cli`

### 3. Set Environment Variables
```
BOT_TOKEN      = 123456:ABCdef...    (from @BotFather)
CHAT_ID        = -1001234567890      (your chat/channel ID)
WEBHOOK_SECRET = 2a773ba85e66cb1282757e75d854d60cb5c60c45161a3e394fe886de0cada211
PORT           = 3000
```

### 4. Your Webhook URL
After deploy, your webhook URL will be:
`https://your-app.railway.app/alert`

---

## TradingView Alert Setup

For **every** alert in your LYNNETRADES strategy:
1. Open alert → "Notifications" tab
2. Enable **Webhook URL**
3. Paste: `https://your-app.railway.app/alert`
4. The "Message" field is auto-filled by the Pine script

### Alerts to create:
| Signal        | Condition                          |
|---------------|------------------------------------|
| Long Entry    | `longE` fires                      |
| Short Entry   | `shortE` fires                     |
| TP1 Hit       | `longTP1 or shortTP1`              |
| TP2 Hit       | `longTP2 or shortTP2`              |
| TP3 Hit       | `longTP3 or shortTP3`              |
| SL Hit        | `longSL or shortSL`                |
| Long Exit     | `longX`                            |
| Short Exit    | `shortX`                           |

Or use **"Any alert() function call"** with the existing `alert()` calls in the script to catch everything in one alert.

---

## Example Telegram Message

```
🟢🚀 LONG ENTRY
━━━━━━━━━━━━━━━
📌 Pair:  XAUUSD (OANDA)
⏱ TF:    15
💲 Price: 2374.56000
🎯 TP1:  2379.31000
🎯 TP2:  2386.43000
🎯 TP3:  2636.39000
🛑 SL:   2362.74000
━━━━━━━━━━━━━━━
🤖 LYNNETRADES V6_1_24
🕐 Sun, 14 Jun 2026 10:22:01 GMT
```
