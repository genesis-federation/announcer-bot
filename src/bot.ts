import { Message } from 'discord.js';
import commando, { CommandoMessage } from 'discord.js-commando';
import path from 'path';
import '@/firebase';
import { invoke } from '@/cron';

const config = require(path.join(__dirname, 'config.json'));

export const client = new commando.Client({
    partials: ['MESSAGE', 'GUILD_MEMBER', 'CHANNEL', 'REACTION'],
    owner: config.ownerId,
    commandPrefix: '!',
});

client.on('message', async (message: Message) => {
    if (message.channel.type === 'dm' || message.author.bot) {
        return;
    }
});

client.dispatcher.addInhibitor((msg: CommandoMessage) => {
    if (
        msg.channel.type === 'dm' ||
        msg.author.bot ||
        config.commandChannelId !== msg.channel.id
    ) {
        return 'Not allowed in this channel.';
    }
    return false;
});

client.registry
    .registerDefaultTypes()
    .registerGroups([['announcement', 'Announcements']])
    .registerDefaultGroups()
    .registerDefaultCommands()
    .registerCommandsIn({
        filter: /^([^.].*)\.(js|ts)$/,
        dirname: path.join(__dirname, 'commands'),
    });

client.login(config.token);
client.on('ready', () => {
    console.log('Client ready!');
    invoke();
    client.user?.setActivity({
        type: 'PLAYING',
        name: config.botStatus,
    });
});

import '@/hooks/toggle_reactions';
import '@/hooks/timer';
import '@/hooks/participants';
import '@/hooks/check_removed';
