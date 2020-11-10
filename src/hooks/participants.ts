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
        const validReactions = ['✅', '❌'];
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

        if (reaction.emoji.name === '✅' || reaction.emoji.name === '❌') {
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

            attendingEmbed = embed.fields.find(
                (e) => e.name === 'Participants',
            );
            let attendees: string[] = [];
            // create attending embed
            if (attendingEmbed) {
                attendees = (attendingEmbed.value.replace(/`/g, '') as string)
                    .split(',')
                    .map((a) => a.trim());
            }
            if (reaction.emoji.name === '✅') {
                attendees.push(user.username);
            } else if (reaction.emoji.name === '❌') {
                attendees = attendees.filter((n) => n !== user.username);
            }

            // make attendees unique
            attendees = [...new Set(attendees)];
            let attendeesString = attendees.slice(0, 20).join(', ');

            // get all fields except "Participants"
            const newFields = [
                ...embed.fields.filter((e) => e.name !== 'Participants'),
            ];

            if (attendeesString) {
                newFields.push({
                    inline: false,
                    value: `\`\`\`${attendeesString}\`\`\``,
                    name: 'Participants',
                });
            }

            const newEmbed = new MessageEmbed()
                .setTitle(embed.title)
                .setDescription(embed.description)
                .addFields(newFields)
                .setFooter('React with ⏱️ to get the local time.');

            if (embed.image) {
                newEmbed.setImage(embed.image.url);
            }
            message.edit(newEmbed);
        }
    },
);
