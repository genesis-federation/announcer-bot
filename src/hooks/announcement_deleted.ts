import { AnnouncementsCache } from '@/announcements_cache';
import { client } from '@/bot';
import { Announcement } from '@/models/announcements';
import { askTimezonePrompt } from '@/prompts/timezone';
import { Message } from 'discord.js';
import { PromptNode } from 'discord.js-prompts';
const askTimezone = new PromptNode(askTimezonePrompt);
client.on('messageDelete', async (message: Message) => {
    // check if in Announcement cache
    if (!AnnouncementsCache.has(message.id)) {
        return;
    }

    // delete from cache
    AnnouncementsCache.delete(message.id);

    //delete from firebase
    await Announcement.deleteById(message.id);
});
