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
            name: 'announcement-remove-admin',
            group: 'announcement',
            memberName: 'announcement-remove-admin',
            guildOnly: true,
            description: 'Removes an admin from the Announcer bot.',
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

        const admins = (setting.data()?.announcementAdmins as string[]) || [];
        const exist = admins.find((id: string) => id === userId);
        if (!exist) {
            return message.channel.send(
                `${user} is not a valid Announcer bot admin.`,
            );
        }

        await settings.setOne('announcementAdmins', [
            ...new Set(admins.filter((i: string) => i !== userId)),
        ]);
        PermissionsCache.delete(userId);

        return message.channel.send(
            `${user} has been removed from the admins.`,
        );
    }
};
