const express = require('express');
const { turnstileSitekey, turnstileSecret, port } = require('./../../config.json');
const app = express();
const event = require('../events/index').eventBus;

app.use('/', express.static(__dirname + '/public'));
app.use(express.json())

// This endpoint will return the turnstile sitekey
app.get('/turnstile/id', (req, res) => {
    res.json({ id: turnstileSitekey });
});

// This endpoint will verify the token from turnstile and adds the user to the database
app.post('/verify', (req, res) => {
    let turnstileToken = req.body.token;
    let authenticationObject = req.body.data;
    let internetProtocolAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

	let formData = new FormData();
	formData.append('secret', turnstileSecret);
	formData.append('response', turnstileToken);

	fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
		body: formData,
		method: 'POST',
	}).then(response => response.json()).then(data => {
        if (data.success) {
            event.emit('verification:success', authenticationObject, internetProtocolAddress);
            res.json({ success: true });
        } else {
            console.log('Verification failed');
            res.json({ success: false });
        }
    }).catch(error => {
        console.error(error);
        res.json({ success: false });
    });
});

app.listen(port, () => {
    console.log(`Webserver is available on http://localhost:${port}`)
})