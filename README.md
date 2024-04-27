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

## Development

If you want to contribute to the project, you can use the following commands:

- `pnpm tailwind`: Start the tailwindcss compiler in watch mode

The project structure is as follows:

- `modules/discord`: Client for Discord
- `modules/website`: Webserver and static files
- `modules/events`: EventEmitter for communication between discord client and website
