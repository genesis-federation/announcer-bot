import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import { askTimezonePrompt } from '@/prompts/timezone';
import {
    EmbedFieldData,
    MessageEmbed,
    MessageReaction,
    TextChannel,
    User,
} from 'discord.js';
import { DiscordPromptRunner, PromptNode } from 'discord.js-prompts';
const askTimezone = new PromptNode(askTimezonePrompt);

client.on(
    'messageReactionRemove',
    async (reaction: MessageReaction, user: User) => {
        if (reaction.emoji.name !== '✅') {
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

        let attending: EmbedFieldData | undefined;

        attending = embed.fields.find((e) => e.name === 'Participants');
        let attendees: string[] = [];
        // create attending embed
        if (attending) {
            attendees = (attending.value.replace(/`/g, '') as string)
                .split(',')
                .map((a) => a.trim());
        }
        attendees = attendees.filter((u) => u !== user.username);
        attendees = [...new Set(attendees)];
        const attendeesString = attendees.slice(0, 20).join(', ');

        const newFields = [
            ...embed.fields.filter((e) => e.name !== 'Participants'),
        ];

        if (attendeesString.length > 0) {
            newFields.push({
                inline: false,
                value: `\`\`\`${attendeesString}\`\`\``,
                name: 'Participants',
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
