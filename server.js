const { WebcastPushConnection } = require('tiktok-live-connector');
const https = require('https');

const TIKTOK_USERNAME = "YOUR_TIKTOK_USERNAME"; // 👈 change this
const VERCEL_FUNCTION_URL = "https://bike-tug-of-war.vercel.app/api/tiktok";

const GIFT_MAP = {
    'Rose':      'girl',
    'Heart':     'superGirl',
    'TikTok':    'boy',
    'Confetti':  'superBoy',
};

console.log('\n================================================');
console.log('  🎮 Bike Tug of War — TikTok Bridge');
console.log('================================================');
console.log(`  TikTok account: @${TIKTOK_USERNAME}`);
console.log(`  Sending gifts to: ${VERCEL_FUNCTION_URL}`);
console.log('================================================\n');

const tiktok = new WebcastPushConnection(TIKTOK_USERNAME);

function sendGift(giftName, uniqueId) {
    const data = JSON.stringify({ giftName, uniqueId });
    const url  = new URL(VERCEL_FUNCTION_URL);
    const options = {
        hostname: url.hostname,
        path:     url.pathname,
        method:   'POST',
        headers: {
            'Content-Type':   'application/json',
            'Content-Length': Buffer.byteLength(data)
        }
    };
    const req = https.request(options, (res) => {
        console.log(`[SENT] ${giftName} from ${uniqueId} → Status: ${res.statusCode}`);
    });
    req.on('error', (e) => console.error('[ERROR]', e.message));
    req.write(data);
    req.end();
}

tiktok.on('gift', (data) => {
    if (GIFT_MAP[data.giftName]) {
        console.log(`[GIFT] 🎁 ${data.uniqueId} sent "${data.giftName}"`);
        sendGift(data.giftName, data.uniqueId);
    } else {
        console.log(`[IGNORED] "${data.giftName}" from ${data.uniqueId}`);
    }
});

tiktok.connect()
    .then(() => {
        console.log(`[TIKTOK] ✅ Connected to @${TIKTOK_USERNAME}'s live!`);
        console.log('[TIKTOK] Waiting for gifts...\n');
    })
    .catch((err) => {
        console.log('[TIKTOK] ❌ ERROR:', err.message);
        console.log('[TIKTOK] Make sure you are LIVE before running this!\n');
    });
