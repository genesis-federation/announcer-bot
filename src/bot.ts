import { Message, MessageReaction, TextChannel, User } from 'discord.js';
import commando, { CommandoMessage } from 'discord.js-commando';
import path from 'path';
import '@/firebase';
import { AnnouncementsCache } from '@/announcements_cache';
import { DiscordPromptRunner, PromptNode } from 'discord.js-prompts';
import { askTimezonePrompt } from '@/prompts/timezone';
import { invoke } from '@/cron';

const config = require(path.join(__dirname, 'config.json'));

const askTimezone = new PromptNode(askTimezonePrompt);
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

client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction, user: User) => {
        if (!AnnouncementsCache.has(reaction.message.id)) {
            return;
        }
        const announcement = AnnouncementsCache.get(reaction.message.id);
        if (!announcement) {
            return;
        }

        // send user time
        if (reaction.emoji.name === '⏱️') {
            const runner = new DiscordPromptRunner<{ timezone: number }>(user, {
                timezone: 0,
            });
            const channel = await user.createDM();
            if (!channel) {
                return;
            }

            const answer = await runner.run(
                askTimezone,
                (channel as unknown) as TextChannel,
            );

            const converted = announcement.when.utcOffset(answer.timezone);

            channel.send(
                `**${announcement.title}** will be on: \`${converted.format(
                    'MM/DD/YYYY HH:mm',
                )} UTC+${answer.timezone}\` (${converted.fromNow()})`,
            );
            reaction.users.remove(user.id);
        }
    },
);

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
        name: 'Test',
        url: 'https://google.com',
    });
});
