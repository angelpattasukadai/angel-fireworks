const https = require('https');

// Sends a WhatsApp alert to the shop when a new order arrives.
//
// Supports two providers (set whichever you use in the environment):
//   • TextMeBot (recommended, reliable): TEXTMEBOT_PHONE + TEXTMEBOT_APIKEY
//   • CallMeBot (free, flaky):           CALLMEBOT_PHONE + CALLMEBOT_APIKEY
// Phone = shop number incl. country code, e.g. 916374254296.
//
// If neither pair is set, this is a silent no-op — the order still saves to the
// dashboard regardless. Never throws; notification is strictly best-effort.
//
// NOTE: we use Node's https module (not global fetch). TextMeBot's server rejects
// undici/fetch GETs with HTTP 411, but accepts a standard client request (like curl).

function httpGet(url) {
    return new Promise((resolve) => {
        try {
            const req = https.get(url, { headers: { 'User-Agent': 'AngelFireworks/1.0' } }, (res) => {
                let body = '';
                res.on('data', (c) => { body += c; });
                res.on('end', () => resolve({ status: res.statusCode, body }));
            });
            req.on('error', (err) => resolve({ status: 0, body: String(err.message) }));
            req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, body: 'timeout' }); });
        } catch (err) {
            resolve({ status: 0, body: String(err.message) });
        }
    });
}

async function notifyWhatsApp(text) {
    const tmbPhone = process.env.TEXTMEBOT_PHONE;
    const tmbKey = process.env.TEXTMEBOT_APIKEY;
    const cmbPhone = process.env.CALLMEBOT_PHONE;
    const cmbKey = process.env.CALLMEBOT_APIKEY;

    let url;
    if (tmbPhone && tmbKey) {
        // TextMeBot: https://api.textmebot.com/send.php?recipient=..&apikey=..&text=..
        url = `https://api.textmebot.com/send.php?recipient=${encodeURIComponent(tmbPhone)}&apikey=${encodeURIComponent(tmbKey)}&text=${encodeURIComponent(text)}`;
    } else if (cmbPhone && cmbKey) {
        // CallMeBot: https://api.callmebot.com/whatsapp.php?phone=..&text=..&apikey=..
        url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(cmbPhone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(cmbKey)}`;
    } else {
        return; // no provider configured
    }

    const { status, body } = await httpGet(url);
    // Some providers (TextMeBot) return HTTP 200/201 even on errors, with the real
    // result in the body — so log it to make misconfig (bad key / not linked) visible.
    if (status < 200 || status >= 300 || /error|invalid/i.test(body)) {
        console.error('WhatsApp notify problem:', status, (body || '').slice(0, 200));
    } else {
        console.log('WhatsApp notify sent:', status);
    }
}

module.exports = { notifyWhatsApp };
