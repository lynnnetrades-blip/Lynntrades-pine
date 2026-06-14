// LynnTrades → Telegram Alert Bridge
// Deploy to Railway / Render / Fly.io
// Required env vars: BOT_TOKEN, CHAT_ID, WEBHOOK_SECRET

const http    = require('http');
const https   = require('https');

const BOT_TOKEN       = process.env.BOT_TOKEN;        // from @BotFather
const CHAT_ID         = process.env.CHAT_ID;         // your Telegram chat ID
const WEBHOOK_SECRET  = process.env.WEBHOOK_SECRET || '2a773ba85e66cb1282757e75d854d60cb5c60c45161a3e394fe886de0cada211';
const PORT            = process.env.PORT || 3000;

// ─── Emoji map per signal type ───────────────────────────────────────────────
const SIGNAL_EMOJI = {
  'LONG ENTRY'  : '🟢🚀',
  'SHORT ENTRY' : '🔴🔻',
  'TP1 HIT'     : '✅ TP1',
  'TP2 HIT'     : '✅✅ TP2',
  'TP3 HIT'     : '✅✅✅ TP3',
  'SL HIT'      : '❌ SL',
  'LONG EXIT'   : '🏁 Long Exit',
  'SHORT EXIT'  : '🏁 Short Exit',
};

// ─── Format alert as Telegram message ────────────────────────────────────────
function formatMessage(data) {
  const emoji   = SIGNAL_EMOJI[data.signal] || '📊';
  const price   = parseFloat(data.price).toFixed(5);
  const now     = new Date().toUTCString();

  let msg = `${emoji} *${data.signal}*\n`;
  msg    += `━━━━━━━━━━━━━━━\n`;
  msg    += `📌 *Pair:*  \`${data.ticker}\` (${data.exchange})\n`;
  msg    += `⏱ *TF:*    ${data.timeframe}\n`;
  msg    += `💲 *Price:* \`${price}\`\n`;

  if (data.tp1) msg += `🎯 *TP1:* \`${parseFloat(data.tp1).toFixed(5)}\`\n`;
  if (data.tp2) msg += `🎯 *TP2:* \`${parseFloat(data.tp2).toFixed(5)}\`\n`;
  if (data.tp3) msg += `🎯 *TP3:* \`${parseFloat(data.tp3).toFixed(5)}\`\n`;
  if (data.sl)  msg += `🛑 *SL:*  \`${parseFloat(data.sl).toFixed(5)}\`\n`;

  msg += `━━━━━━━━━━━━━━━\n`;
  msg += `🤖 ${data.strategy}\n`;
  msg += `🕐 ${now}`;

  return msg;
}

// ─── Send to Telegram ─────────────────────────────────────────────────────────
function sendTelegram(text) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      chat_id    : CHAT_ID,
      text       : text,
      parse_mode : 'Markdown',
    });

    const options = {
      hostname : 'api.telegram.org',
      path     : `/bot${BOT_TOKEN}/sendMessage`,
      method   : 'POST',
      headers  : {
        'Content-Type'   : 'application/json',
        'Content-Length' : Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(data);
        if (parsed.ok) {
          console.log(`[OK] Telegram message sent: ${parsed.result.message_id}`);
          resolve(parsed);
        } else {
          console.error('[FAIL] Telegram error:', parsed);
          reject(parsed);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── HTTP Server ──────────────────────────────────────────────────────────────
const server = http.createServer((req, res) => {

  // Health check
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200);
    res.end('LynnTrades Alert Bridge running ✅');
    return;
  }

  // Only accept POST /alert
  if (req.method !== 'POST' || req.url !== '/alert') {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);

  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      console.log('[RECV]', JSON.stringify(data));

      // Secret check
      if (data.secret !== WEBHOOK_SECRET) {
        console.warn('[WARN] Invalid secret received');
        res.writeHead(401);
        res.end('Unauthorized');
        return;
      }

      const message = formatMessage(data);
      await sendTelegram(message);

      res.writeHead(200);
      res.end('OK');

    } catch (err) {
      console.error('[ERROR]', err.message);
      res.writeHead(400);
      res.end('Bad request');
    }
  });
});

server.listen(PORT, () => {
  console.log(`LynnTrades Alert Bridge listening on port ${PORT}`);
  if (!BOT_TOKEN) console.warn('⚠️  BOT_TOKEN not set!');
  if (!CHAT_ID)   console.warn('⚠️  CHAT_ID not set!');
});
