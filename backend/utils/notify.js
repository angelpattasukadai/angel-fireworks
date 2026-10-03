// Sends a WhatsApp alert to the shop when a new order arrives.
//
// Supports two providers (set whichever you use in the environment):
//   • TextMeBot (recommended, reliable): TEXTMEBOT_PHONE + TEXTMEBOT_APIKEY
//   • CallMeBot (free, flaky):           CALLMEBOT_PHONE + CALLMEBOT_APIKEY
// Phone = shop number incl. country code, e.g. 916374254296.
//
// If neither pair is set, this is a silent no-op — the order still saves to the
// dashboard regardless. Never throws; notification is strictly best-effort.
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

    try {
        const res = await fetch(url, { method: 'GET' });
        if (!res.ok) console.error('WhatsApp notify failed:', res.status);
    } catch (err) {
        console.error('WhatsApp notify error:', err.message);
    }
}

module.exports = { notifyWhatsApp };
