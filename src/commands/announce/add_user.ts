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
            name: 'announcement-add-user',
            group: 'announcement',
            memberName: 'announcement-add-user',
            guildOnly: true,
            description: 'Authorizes a user to use the Announcer bot.',
            args: [
                {
                    key: 'userId',
                    prompt: 'UID of the user',
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
        const userId = args.userId;

        const user = message.guild.members.cache.get(userId);

        if (!user) {
            return message.channel.send(
                `Unable to find user with the ID of: \`${userId}\``,
            );
        }

        const settings = Settings;
        const setting = await settings.get();

        const users = setting.data()?.announcementUsers || [];

        users.push(userId);
        await settings.setOne('announcementUsers', [...new Set(users)]);
        PermissionsCache.set(userId, 'user');

        return message.channel.send(
            `${user} has been authorized to use the Announcer bot.`,
        );
    }
};
