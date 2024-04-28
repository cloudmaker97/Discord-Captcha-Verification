function inititalize() {
    fetch(`/turnstile/id?data=${btoa(JSON.stringify(getUserData()))}`, {
        method: 'GET',
    })
    .then(response => response.json())
    .then(data => {
        if(data.networkBlacklisted) {
            failed("Dein Netzwerk ist gesperrt. Bitte schalte deinen VPN aus, sofern du einen benutzt.");
            return;
        }
        if(getUserData() === false) {
            failed('Kein Benutzer gefunden. Bitte versuchen Sie es erneut.');
            return;
        }

        window.onloadTurnstileCallback = function () {
            turnstile.render('#turnstile-container', {
                sitekey: data.id,
                callback: function(token) {
                    sendVerification(token, getUserData());
                },
            });
        };

        // Load the turnstile script from Cloudflare, so that the callback function is available in the global scope
        let newScriptElement = document.createElement('script');
        newScriptElement.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback';
        newScriptElement.defer = true;
        document.body.appendChild(newScriptElement);
    }).catch((error) => {
        failed(error);
    });
}

function getUserData() {
    const urlParams = new URLSearchParams(window.location.search);
    const userData = urlParams.get('data');
    if (userData) {
        return JSON.parse(atob(userData));
    } else {
        return false;
    }
}

// This function will remove the turnstile from the DOM
function removeTurnstile() {
    document.querySelector('#turnstile-container')?.remove();
}

// This function will be called when the verification is successful
function success() {
    removeTurnstile();
    document.querySelector('[data-verification-step="waiting"]').classList.add('hidden');
    document.querySelector('[data-verification-step="failed"]').classList.add('hidden');
    document.querySelector('[data-verification-step="success"]').classList.remove('hidden');
}

// This function is called when the verification fails
function failed(errorMessage) {
    removeTurnstile();
    document.querySelector('[data-verification-step="waiting"]').classList.add('hidden');
    document.querySelector('[data-verification-step="failed"]').classList.remove('hidden');
    document.querySelector('[data-verification-step="success"]').classList.add('hidden');
    document.querySelector('#errorMessage').textContent = errorMessage;
}

function sendVerification(turnstileToken, userData) {
    // This function will send the verification request to the server for validation
    fetch('/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: turnstileToken,
            data: userData,
        }),
    })
    .then(response => response.json())
    .then(data => {
        // Assume the response were successful
        success();
        // Check if the response was really successful (turnstile verification on the server side)
        if(!data.success) {
            failed(data.message);
        }
    })
    .catch((error) => {
        failed(error);
    });
}

// Initialize the script
document.addEventListener('DOMContentLoaded', inititalize);