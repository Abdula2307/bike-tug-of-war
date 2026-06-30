const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');

const TIKTOK_USERNAME = "YOUR_TIKTOK_USERNAME";

const GIFT_MAP = {
    'Rose':      'girl',
    'Heart':     'superGirl',
    'TikTok':    'boy',
    'Confetti':  'superBoy',
};

// Railway gives you a PORT env variable
const PORT = process.env.PORT || 8080;
const wss = new WebSocket.Server({ port: PORT });

console.log(`WebSocket running on port ${PORT}`);

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

wss.on('connection', (ws) => {
    console.log('[BROWSER] Connected!');

    tiktok.on('gift', (data) => {
        const cmd = GIFT_MAP[data.giftName];
        if (cmd) {
            console.log(`[GIFT] ${data.uniqueId} sent "${data.giftName}"`);
            safeSend(ws, cmd);
        }
    });

    ws.on('close', () => console.log('[BROWSER] Disconnected.'));
});

tiktok.connect()
    .then(() => console.log(`[TIKTOK] Connected to @${TIKTOK_USERNAME}`))
    .catch((err) => console.log('[TIKTOK] ERROR:', err.message));

function safeSend(ws, command) {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ command }));
    }
}