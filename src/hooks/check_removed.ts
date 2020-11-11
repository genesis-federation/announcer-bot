import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import {
    EmbedFieldData,
    MessageEmbed,
    MessageReaction,
    User,
} from 'discord.js';
import path from 'path';
const config = require(path.join(__dirname, '../', 'config.json'));

client.on(
    'messageReactionRemove',
    async (reaction: MessageReaction, user: User) => {
        const allowedEmojis = ['❔', '✅'];

        if (!allowedEmojis.includes(reaction.emoji.name)) {
            return;
        }

        if (user.bot) {
            return;
        }

        if (!AnnouncementsCache.has(reaction.message.id)) {
            return;
        }
        const announcement = AnnouncementsCache.get(reaction.message.id);
        if (!announcement) {
            return;
        }

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

        const guildUser = client.guilds.cache
            .get(config.guildId)
            ?.members.cache.get(user.id);

        let username: string;

        if (guildUser) {
            username = guildUser.displayName;
        } else {
            username = user.username;
        }

        let attendingEmbed: EmbedFieldData | undefined;
        let maybeAttendingEmbed: EmbedFieldData | undefined;

        attendingEmbed = embed.fields.find((e) => e.name === 'Participants');
        maybeAttendingEmbed = embed.fields.find(
            (e) => e.name === 'May Participate',
        );

        let attendees: string[] = [];
        let mayAttend: string[] = [];

        // create attending embed
        if (attendingEmbed) {
            attendees = (attendingEmbed.value.replace(/`/g, '') as string)
                .split(',')
                .map((a) => a.trim());
        }

        if (maybeAttendingEmbed) {
            mayAttend = (maybeAttendingEmbed.value.replace(/`/g, '') as string)
                .split(',')
                .map((a) => a.trim());
        }

        attendees = attendees.filter((u) => u !== username);
        mayAttend = mayAttend.filter((u) => u !== username);
        attendees = [...new Set(attendees)];
        mayAttend = [...new Set(mayAttend)];

        const attendeesString = attendees.slice(0, 20).join(', ');
        const mayAttendString = mayAttend.slice(0, 20).join(', ');

        const newFields = [
            ...embed.fields.filter(
                (e) =>
                    e.name !== 'Participants' && e.name !== 'May Participate',
            ),
        ];

        if (attendeesString.length > 0) {
            newFields.push({
                inline: false,
                value: `\`\`\`${attendeesString}\`\`\``,
                name: 'Participants',
            });
        }

        if (mayAttendString.length > 0) {
            newFields.push({
                inline: false,
                value: `\`\`\`${mayAttendString}\`\`\``,
                name: 'May Participate',
            });
        }

        const newEmbed = new MessageEmbed()
            .setTitle(embed.title)
            .setDescription(embed.description)
            .addFields(newFields);

        if (embed.timestamp) {
            newEmbed.setTimestamp(embed.timestamp);
        }

        if (embed.image) {
            newEmbed.setImage(embed.image.url);
        }

        message.edit(newEmbed);
    },
);
