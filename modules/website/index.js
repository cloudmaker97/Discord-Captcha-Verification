const { turnstileSitekey, turnstileSecret, port } = require('./../../config.json');
const { IpDeniedError, IpFilter } = require('express-ipfilter');
const express = require('express');
const expressApp = express();
const event = require('../events/index').eventBus;
const blacklist = require('../network/blacklist');

// This will load the blacklist and start the webserver when it's done
blacklist.loadBlacklist().then(blacklist => {
    console.log('Network-Blacklist has been loaded')
    expressApp.use('/', express.static(__dirname + '/public'));
    expressApp.use(IpFilter(blacklist));
    expressApp.use(express.json())

    expressApp.use((err, req, res, _next) => {
        if (err instanceof IpDeniedError) {
            res.status(401)
            res.json({ networkBlacklisted: err.message })
        } else {
            res.status(err.status || 500)
        }
    })
    

    // This endpoint will return the turnstile sitekey
    expressApp.get('/turnstile/id', (req, res) => {
        res.json({ id: turnstileSitekey });
    });

    // This endpoint will verify the token from turnstile and adds the user to the database
    expressApp.post('/verify', (req, res) => {
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

    expressApp.listen(port, () => {
        console.log(`Webserver is available on http://localhost:${port}`)
    })
});