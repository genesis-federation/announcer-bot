import { client } from '@/bot';
import { Message } from 'discord.js';

client.on('message', async (message: Message) => {
    if (message.author.bot) {
        return;
    }

    if (
        message.content.includes('@here') ||
        message.content.includes('@everyone')
    ) {
        return;
    }

    if (!client.user) {
        return;
    }

    if (message.mentions.has(client.user.id)) {
        message.channel.send(`Do not @ me ${message.author}`);
    }
});
