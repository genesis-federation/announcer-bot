import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import {
    EmbedFieldData,
    MessageEmbed,
    MessageReaction,
    User,
} from 'discord.js';

client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction, user: User) => {
        const validReactions = ['✅', '❌', '❔'];
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

        if (!validReactions.includes(reaction.emoji.name)) {
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
        let attendingEmbed: EmbedFieldData | undefined;
        let mayAttendEmbed: EmbedFieldData | undefined;

        attendingEmbed = embed.fields.find((e) => e.name === 'Participants');
        mayAttendEmbed = embed.fields.find((e) => e.name === 'May Participate');

        let attendees: string[] = [];
        let mayAttend: string[] = [];

        if (attendingEmbed) {
            attendees = (attendingEmbed.value.replace(/`/g, '') as string)
                .split(',')
                .map((a) => a.trim());
        }

        if (mayAttendEmbed) {
            mayAttend = (mayAttendEmbed.value.replace(/`/g, '') as string)
                .split(',')
                .map((a) => a.trim());
        }

        client.guilds.cache;

        if (reaction.emoji.name === '✅') {
            attendees.push(user.username);
            mayAttend = mayAttend.filter((n) => n !== user.username);
        } else if (reaction.emoji.name === '❌') {
            attendees = attendees.filter((n) => n !== user.username);
            mayAttend = mayAttend.filter((n) => n !== user.username);
        } else if (reaction.emoji.name === '❔') {
            mayAttend.push(user.username);
            attendees = attendees.filter((n) => n !== user.username);
        }

        // make unique
        attendees = [...new Set(attendees)];
        mayAttend = [...new Set(mayAttend)];
        let attendeesString = attendees.slice(0, 20).join(', ');
        let mayAttendString = mayAttend.slice(0, 20).join(', ');

        // get all fields except "Participants"
        const newFields = [
            ...embed.fields.filter(
                (e) =>
                    e.name !== 'Participants' && e.name !== 'May Participate',
            ),
        ];

        if (attendeesString && attendees.length > 0) {
            newFields.push({
                inline: false,
                value: `\`\`\`${attendeesString}\`\`\``,
                name: 'Participants',
            });
        }

        if (mayAttendString && mayAttend.length > 0) {
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
