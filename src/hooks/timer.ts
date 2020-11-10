import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import { askTimezonePrompt } from '@/prompts/timezone';
import { MessageReaction, TextChannel, User } from 'discord.js';
import { DiscordPromptRunner, PromptNode } from 'discord.js-prompts';
const askTimezone = new PromptNode(askTimezonePrompt);
client.on(
    'messageReactionAdd',
    async (reaction: MessageReaction, user: User) => {
        if (reaction.emoji.name !== '⏱️') {
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
    },
);
