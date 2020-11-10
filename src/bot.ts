import {
    Message,
    MessageReaction,
    TextChannel,
    User,
    EmbedFieldData,
    MessageEmbed,
} from 'discord.js';
import commando, { CommandoMessage } from 'discord.js-commando';
import path from 'path';
import '@/firebase';
import { AnnouncementsCache } from '@/announcements_cache';
import { DiscordPromptRunner, MenuEmbed, PromptNode } from 'discord.js-prompts';
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
            return;
        }

        if (reaction.emoji.name === '✅') {
            const message = reaction.message;
            await message.fetch();

            if (!message) {
                return;
            }

            const embed = message.embeds[0];

            if (!embed) {
                return;
            }

            const fields = embed.fields;

            if (!fields) {
                return;
            }
            let attending: EmbedFieldData | undefined;

            attending = embed.fields.find((e) => e.name === 'Attending');
            let attendees: string[] = [];
            // create attending embed
            if (attending) {
                attendees = (attending.value.replace(/`/g, '') as string)
                    .split(',')
                    .map((a) => a.trim());
            }
            attendees.push(user.username);
            attendees = [...new Set(attendees)];
            const attendeesString = attendees.join(', ');
            if (attendeesString.length > 1000) {
                return;
            }

            const newFields = [
                ...embed.fields.filter((e) => e.name !== 'Attending'),
            ];
            newFields.push({
                inline: false,
                value: `\`\`\`${attendeesString}\`\`\``,
                name: 'Attending',
            });
            const newEmbed = new MessageEmbed()
                .setTitle(embed.title)
                .setDescription(embed.description)
                .addFields(newFields)
                .setFooter('React with ⏱️ to get the local time.');
            message.edit(newEmbed);
        }
    },
);

client.on(
    'messageReactionRemove',
    async (reaction: MessageReaction, user: User) => {
        if (!AnnouncementsCache.has(reaction.message.id)) {
            return;
        }
        const announcement = AnnouncementsCache.get(reaction.message.id);
        if (!announcement) {
            return;
        }

        if (reaction.emoji.name === '✅') {
            const message = reaction.message;
            await message.fetch();

            if (!message) {
                return;
            }

            const embed = message.embeds[0];

            if (!embed) {
                return;
            }

            const fields = embed.fields;

            if (!fields) {
                return;
            }

            let attending: EmbedFieldData | undefined;

            attending = embed.fields.find((e) => e.name === 'Attending');
            let attendees: string[] = [];
            // create attending embed
            if (attending) {
                attendees = (attending.value.replace(/`/g, '') as string)
                    .split(',')
                    .map((a) => a.trim());
            }
            attendees = attendees.filter((u) => u !== user.username);
            attendees = [...new Set(attendees)];
            const attendeesString = attendees.join(', ');
            if (attendeesString.length > 1000) {
                return;
            }

            const newFields = [
                ...embed.fields.filter((e) => e.name !== 'Attending'),
            ];
            newFields.push({
                inline: false,
                value: `\`\`\`${attendeesString}\`\`\``,
                name: 'Attending',
            });
            const newEmbed = new MessageEmbed()
                .setTitle(embed.title)
                .setDescription(embed.description)
                .addFields(newFields)
                .setFooter('React with ⏱️ to get the local time.');
            message.edit(newEmbed);
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
        type: 'CUSTOM_STATUS',
        name: config.botStatus,
    });
});
