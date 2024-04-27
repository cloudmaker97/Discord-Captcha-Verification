const { Client, Events, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonStyle, ButtonBuilder } = require('discord.js');
const { discordToken, channelId, channelLogsId, host, port, protocol, verifiedRoleId } = require('../../config.json');
const event = require('../events/index').eventBus;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('interactionCreate', async interaction => {
    if(interaction.isButton()) {
        console.log(interaction)
        let verificationObject = {
            guildId: interaction.guildId,
            userId: interaction.user.id,
            timestamp: Date.now()
        }

        let base64 = Buffer.from(JSON.stringify(verificationObject)).toString('base64');
        interaction.reply({ content: `Bitte öffne folgenden Link: <${protocol}://${host}?data=${base64}>`, ephemeral: true });
    }
})

client.once(Events.ClientReady, readyClient => {
	let targetChannel = readyClient.channels.cache.find(channel => channel.id === channelId);
    targetChannel.messages.fetch().then(messages => {
        messages.forEach(message => {
            if (message.author.id === readyClient.user.id) {
                message.delete();
            }
        });
    }).then(() => {
        if (targetChannel) {
            let confirm = new ButtonBuilder()
                .setCustomId('verify')
                .setLabel('Verifizieren')
                .setStyle(ButtonStyle.Success);
    
            let actionRow = new ActionRowBuilder()
                .addComponents(confirm)
    
            let embedBuilder = new EmbedBuilder()
                .setTitle('Verifizierung erforderlich')
                .setDescription('Um diesen Server nutzen zu können, musst du dich verifizieren. Dies kannst du tun, indem du auf den Button klickst.')
                .setColor('#FF0000');
    
            targetChannel.send({ embeds: [embedBuilder], components: [actionRow] });
        }
    });
});

event.on('verification:success', (authenticationObject, internetProtocolAddress) => {
    let guild = client.guilds.cache.get(authenticationObject.guildId);
    let member = guild.members.cache.get(authenticationObject.userId);
    member.roles.add(verifiedRoleId);

    let embedBuilder = new EmbedBuilder();
    embedBuilder.setTitle('Verifizierung abgeschlossen');
    embedBuilder.setFields([
        { name: 'Benutzername', value: `<@${member.id}>`, inline: false },
        { name: 'Zeitpunkt', value: `${new Date().toISOString()}`, inline: false },
        { name: 'IP-Adresse', value: internetProtocolAddress, inline: false },
        { name: 'IP-Informationen', value: `[Informationen anzeigen](https://ipinfo.io/${internetProtocolAddress})`, inline: false },
        { name: 'User-ID', value: `${member.id}`, inline: false },
    ]);

    client.channels.cache.get(channelLogsId).send({embeds: [embedBuilder]});
});

client.login(discordToken);