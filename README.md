# Discord-Verification

This is a simple discord verification bot that uses a captcha (CloudFlare Turnstile).
The bot creates an embed in a specified discord channel with a button. If the button is clicked, the user receives a personal link.
After clicking the link, the user is redirected to the captcha page. If the captcha is solved, the user is verified and receives a role.
The bot also logs the user's IP address and the time of verification.

## Installation

You need to have [Node.js](https://nodejs.org/en/) and [pnpm](https://pnpm.io/) installed.

1. Clone the repository
2. Install the required packages with `pnpm install`
3. Copy the `config.example.json` file and rename it to `.config.json`
4. Fill in the required fields in the `.config.json` file (see [Settings](#settings))
5. Start the bot with `pnpm start`

### Run with Docker

You can also run the bot with Docker. You need to have [Docker](https://www.docker.com/) installed.

1. Clone the repository
2. Copy the `config.example.json` file and rename it to `.config.json`
3. Fill in the required fields in the `.config.json` file (see [Settings](#settings))
4. Run the following command to start the bot: `docker compose up -d.`
5. To stop the bot, run the following command: `docker compose down`

You can set the published ports in the `docker-compose.yml` file.

## Settings

These are the settings that need to be filled in the `config.json` file:

- `protocol`: The protocol of the website (http or https)
- `host`: The hostname of the hosted website
- `port`: The available port of the website
- `channelId`: The ID of the discord channel where the verification embed will be sent
- `channelLogsId`: The ID of the discord channel where the logs will be sent
- `verifiedRoleId`: The ID of the role that will be given to the verified users
- `discordToken`: The token of the discord bot
- `turnstileSitekey`: The sitekey of the CloudFlare Turnstile captcha
- `turnstileSecret`: The secret of the CloudFlare Turnstile captcha

## Screenshots

The embed that will be created on the discord channel:

![2024-04-27 03_58_26-#verifizieren _ The High Roller - Discord](https://github.com/cloudmaker97/Discord-Captcha-Verification/assets/4189795/866913af-edb7-4872-9458-01e7231f936a)

The opened website with captcha validation:

![2024-04-27 03_58_58-Verifizierung abschließen](https://github.com/cloudmaker97/Discord-Captcha-Verification/assets/4189795/a4ce933e-e8b6-43bf-807d-e3b5990be21c)

The logged message in a hidden discord channel:

![2024-04-27 04_01_04-#verification _ The High Roller - Discord](https://github.com/cloudmaker97/Discord-Captcha-Verification/assets/4189795/44959157-855a-46fb-9889-83833a931c98)

## Development

If you want to contribute to the project, you can use the following commands:

- `pnpm tailwind`: Start the tailwindcss compiler in watch mode

The project structure is as follows:

- `modules/discord`: Client for Discord
- `modules/website`: Webserver and static files
- `modules/events`: EventEmitter for communication between discord client and website
