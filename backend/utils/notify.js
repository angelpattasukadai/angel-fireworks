// Sends a WhatsApp alert to the shop when a new order arrives.
// Uses CallMeBot (free) — set CALLMEBOT_PHONE (shop number incl. country code, e.g. 916374254296)
// and CALLMEBOT_APIKEY in the environment. If either is missing, this is a silent no-op, so the
// order still saves to the dashboard regardless. Never throws — notification is best-effort.
async function notifyWhatsApp(text) {
    const phone = process.env.CALLMEBOT_PHONE;
    const apikey = process.env.CALLMEBOT_APIKEY;
    if (!phone || !apikey) return;
    try {
        const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(phone)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(apikey)}`;
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) console.error('WhatsApp notify failed:', res.status);
    } catch (err) {
        console.error('WhatsApp notify error:', err.message);
    }
}

module.exports = { notifyWhatsApp };
