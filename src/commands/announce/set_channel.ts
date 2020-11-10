import { Settings } from '@/models/settings';
import { PermissionsCache } from '@/permission_cache';
import { Message } from 'discord.js';
import {
    Command,
    ArgumentCollectorResult,
    CommandoClient,
    CommandoMessage,
} from 'discord.js-commando';

module.exports = class NewCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announcement-set-channel-id',
            group: 'announcement',
            memberName: 'announcement-set-channel-id',
            guildOnly: true,
            description: 'Sets the channel ID of the announcement channel.',
            args: [
                {
                    key: 'channelId',
                    prompt:
                        'The channel id where the announcement will be posted.',
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
        const channelId = args.channelId;

        const channels = message.guild.channels;
        const channel = channels.cache.get(channelId);
        if (!channel) {
            message.channel.send(`Channel does not exist: \`${channelId}\``);
            return null;
        }
        try {
            await Settings.setOne('announcementChannelId', channelId);
            message.channel.send(
                `Announcement channel set to \`${channel.name}\``,
            );
        } catch (error) {
            message.channel.send(
                `An error occured while updating the channel ID: ${error.message}`,
            );
        }
        return null;
    }
};
