import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import { MessageReaction, User } from 'discord.js';

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
        const attendingReacts = message.reactions.cache.get('✅');
        const notAttendingReacts = message.reactions.cache.get('❌');
        const mayAttendReacts = message.reactions.cache.get('❔');

        if (reaction.emoji.name === '✅') {
            // remove user from X reaction
            if (notAttendingReacts) {
                const notAttending = await notAttendingReacts.fetch();
                notAttending.users.remove(user);
            }

            // remove user from ? reaction
            if (mayAttendReacts) {
                const mayAttend = await mayAttendReacts.fetch();
                mayAttend.users.remove(user);
            }
        }

        if (reaction.emoji.name === '❌') {
            if (attendingReacts) {
                const attending = await attendingReacts.fetch();
                attending.users.remove(user);
            }

            if (mayAttendReacts) {
                const mayAttend = await mayAttendReacts.fetch();
                mayAttend.users.remove(user);
            }
        }

        if (reaction.emoji.name === '❔') {
            if (attendingReacts) {
                const attending = await attendingReacts.fetch();
                attending.users.remove(user);
            }

            if (notAttendingReacts) {
                const notAttending = await notAttendingReacts.fetch();
                notAttending.users.remove(user);
            }
        }
    },
);
