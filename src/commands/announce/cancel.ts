import { Settings } from '@/models/settings';
import { PermissionsCache } from '@/permission_cache';

import { Channel, Message, TextChannel } from 'discord.js';
import {
    Command,
    ArgumentCollectorResult,
    CommandoClient,
    CommandoMessage,
} from 'discord.js-commando';
import admin from '@/firebase';
import { AnnouncementsCache } from '@/announcements_cache';

module.exports = class NewCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announcement-cancel',
            group: 'announcement',
            memberName: 'announcement-cancel',
            guildOnly: true,
            description: 'Cancels an announcement.',
            args: [
                {
                    key: 'id',
                    prompt: 'The message ID of the announcement.',
                    type: 'string',
                    validate: (id: string) => id.length > 0,
                },
            ],
        });
    }

    hasPermission(msg: CommandoMessage) {
        if (msg.client.isOwner(msg.author)) {
            return true;
        }

        const permission = PermissionsCache.get(msg.author.id);
        if (!permission) {
            return false;
        }

        if (permission !== 'admin') {
            return false;
        }

        return true;
    }

    async run(
        message: CommandoMessage,
        args: Record<any, any>,
        fromPattern: boolean,
        result?: ArgumentCollectorResult<object> | undefined,
    ): Promise<Message | Message[] | null> {
        const postId = args.id;
        const setting = await Settings.get();
        if (!setting.data()?.announcementChannelId) {
            message.channel.send(
                'Please set a channel where the announcement will be made by typing `!announcement-set-channel-id channel_id`',
            );
            return null;
        }

        const announcementChannelId = setting.data()?.announcementChannelId;
        const announcementChannel = message.guild.channels.cache.get(
            announcementChannelId,
        ) as TextChannel;

        if (!announcementChannel) {
            return message.channel.send(
                `Error: Failed to retrieve announcement channel.`,
            );
        }

        const post = await announcementChannel.messages.fetch(postId);

        if (post) {
            if (post.deletable) {
                post.delete();
            }
        }

        await admin.firestore().doc(`announcements/${postId}`).delete();

        AnnouncementsCache.delete(postId);
        return message.channel.send(
            `Announcement \`${postId}\` has been deleted.`,
        );
    }
};
