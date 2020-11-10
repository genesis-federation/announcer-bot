import { PermissionsCache } from '@/permission_cache';

import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import {
    Command,
    ArgumentCollectorResult,
    CommandoClient,
    CommandoMessage,
} from 'discord.js-commando';

import admin from '@/firebase';
import moment from 'moment';

module.exports = class NewCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announcement-list',
            group: 'announcement',
            memberName: 'announcement-list',
            guildOnly: true,
            description: 'List all announcements.',
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

        if (!permission) {
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
        const now = new Date();
        const announcements = await admin
            .firestore()
            .collection(`announcements`)
            .where('when', '>=', now)
            .get();

        if (announcements.empty) {
            return message.channel.send(
                'There are no upcoming events right now.',
            );
        }

        const fields: EmbedFieldData[] = [];

        announcements.docs.forEach((i) => {
            const data = i.data() as FirebaseFirestore.DocumentData;
            const momentDate = moment(
                (data.when as FirebaseFirestore.Timestamp).toDate(),
            );
            const user = message.guild.members.cache.get(data.authorId);
            fields.push({
                name: i.data()?.title,
                value: `**Date:** ${momentDate.format(
                    'MM/DD/YYY HH:mm',
                )} UTC (${momentDate.fromNow()})\n**By:**${user}\n**ID:**${
                    data.messageId
                }`,
            });
        });

        const embed = new MessageEmbed()
            .setTitle('Upcoming Events')
            .addFields(fields);

        return message.channel.send('', {
            embed: embed,
        });
    }
};
