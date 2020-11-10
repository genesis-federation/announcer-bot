import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import { MessageReaction, User } from 'discord.js';

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

        // remove user from X reaction
        if (reaction.emoji.name === '✅') {
            const notAttendingReacts = message.reactions.cache.get('❌');
            if (notAttendingReacts) {
                const notAttending = await notAttendingReacts.fetch();
                notAttending.users.remove(user);
            }
        }

        if (reaction.emoji.name === '❌') {
            const attendingReacts = message.reactions.cache.get('✅');
            if (attendingReacts) {
                const attending = await attendingReacts.fetch();
                attending.users.remove(user);
            }
        }
    },
);
