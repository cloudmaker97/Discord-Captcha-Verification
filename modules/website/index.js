const { turnstileSitekey, turnstileSecret, port } = require('./../../config.json');
const { IpDeniedError, IpFilter } = require('express-ipfilter');
const express = require('express');
const expressApp = express();
const event = require('../events/index').eventBus;
const blacklist = require('../network/blacklist');
const database = require('../database/index');

event.on('discord:ready', () => {
    // This will load the blacklist and start the webserver when it's done
    blacklist.loadBlacklist().then(blacklist => {
        console.log('Network-Blacklist has been loaded')
        expressApp.use('/', express.static(__dirname + '/public'));
        let clientIp = function(req) {
            return req.headers['x-forwarded-for'] ? (req.headers['x-forwarded-for']).split(',')[0] : ""
        }
        expressApp.use(IpFilter(blacklist, {clientIp: clientIp}));
        expressApp.use(express.json())

        expressApp.use((err, req, res, _next) => {
            if(req.query) {
                if(req.query.data && err instanceof IpDeniedError) {
                    req.body = JSON.parse(Buffer.from(req.query.data, 'base64').toString('utf-8'));
                    database.addAttempt(req.body.userId, req.body.guildId, req.headers['x-forwarded-for'] || req.socket.remoteAddress, "NETWORK_BLOCKED").then(() => {
                        res.status(401)
                        res.json({ networkBlacklisted: err.message })
                    })
                    return;
                }
            }
            res.status(err.status || 500)
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

            database.ipUsedInLastDay(internetProtocolAddress).then(ipUsed => {
                console.log('Verification request received, (IP, Discord-ID, Guild-ID)');
                console.info(internetProtocolAddress, authenticationObject.userId, authenticationObject.guildId);
                if(ipUsed) {
                    database.addAttempt(authenticationObject.userId, authenticationObject.guildId, internetProtocolAddress, "IP_USED").then(() => {
                        console.log('IP-Address has been used in the last 24 hours');
                        res.json({ success: false, message: 'Die von dir genutzte IP-Adresse wurde erst kürzlich registriert. Probiere es später erneut.' });
                    });
                } else {
                    database.isUserVerified(authenticationObject.userId, authenticationObject.guildId).then(userExists => {
                        if(!userExists) {
                            fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                                body: formData,
                                method: 'POST',
                            }).then(response => response.json()).then(data => {
                                if (data.success) {
                                    // Add the user to the database and emit the verification success event
                                    database.addUser(authenticationObject.userId, authenticationObject.guildId, internetProtocolAddress).then(() => {
                                        event.emit('verification:success', authenticationObject, internetProtocolAddress);
                                        res.json({ success: true, message: 'Die Authentifizierung war erfolgreich' });
                                    });
                                } else {
                                    database.addAttempt(authenticationObject.userId, authenticationObject.guildId, internetProtocolAddress, "CAPTCHA_FAIL").then(() => {
                                        console.log('Verification failed');
                                        res.json({ success: false, message: 'Das Captcha wurde nicht korrekt gelöst.' });
                                    })
                                    
                                }
                            }).catch(error => {
                                database.addAttempt(authenticationObject.userId, authenticationObject.guildId, internetProtocolAddress, "ERROR").then(() => {
                                    console.error(error);
                                    res.json({ success: false, message: 'Bitte probiere es später erneut.' });
                                })
                            });
                        } else {
                            database.addAttempt(authenticationObject.userId, authenticationObject.guildId, internetProtocolAddress, "USER_VERIFIED_ALREADY").then(() => {
                                console.log('User already verified, potential risk');
                                res.json({ success: false, message: 'Das Konto wurde bereits in der Vergangenheit verifiziert. Wende dich an einen Admin um dich manuell freischalten zu lassen.' });
                            })
                        }
                    });
                }
            });
        });

        expressApp.listen(port, () => {
            console.log(`Webserver is available on http://localhost:${port}`)
        })
    });
});