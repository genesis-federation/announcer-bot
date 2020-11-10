import moment from 'moment';
import { AnnouncementsCache } from './announcements_cache';
import { client } from '@/bot';
import { Settings } from '@/models/settings';
import { TextChannel } from 'discord.js';
import admin from '@/firebase';

const announcerCron = async () => {
    console.log('Cron invoked.');
    const setting = await Settings.get();
    const announcementChannelId = setting.data()?.announcementChannelId;

    const now = moment();
    for (const announcement of AnnouncementsCache) {
        const value = announcement[1];
        if (!value.enablePingEveryone) {
            continue;
        }

        const diffInMinutes = value.when.diff(now, 'minutes');
        const diffInSeconds = value.when.diff(now, 'seconds');

        if (diffInSeconds <= 0 && !value.announced.actual) {
            value.announced.actual = true;
            admin.firestore().doc(`announcements/${value.messageId}`).update({
                'announced.actual': true,
                'announced.first': true,
                'announced.second': true,
            });
            const channel = (await client.channels.fetch(
                announcementChannelId,
            )) as TextChannel;

            if (!channel) {
                continue;
            }
            channel.send(
                `@everyone, **${value.title}** is starting NOW. Get on fucking comms!`,
            );
            continue;
        }

        // Announce 30 minutes before
        if (diffInMinutes <= 30 && !value.announced.second) {
            value.announced.second = true;
            admin.firestore().doc(`announcements/${value.messageId}`).update({
                'announced.second': true,
                'announced.first': true,
            });
            const channel = (await client.channels.fetch(
                announcementChannelId,
            )) as TextChannel;

            if (!channel) {
                continue;
            }
            channel.send(
                `@everyone, **${value.title}** is starting in 30 minutes!`,
            );
            continue;
        }

        // Announce 1.5 hours before
        if (diffInMinutes <= 90 && !value.announced.first) {
            value.announced.first = true;
            admin.firestore().doc(`announcements/${value.messageId}`).update({
                'announced.first': true,
            });
            const channel = (await client.channels.fetch(
                announcementChannelId,
            )) as TextChannel;

            if (!channel) {
                continue;
            }
            channel.send(
                `@everyone, **${value.title}** is starting in 90 minutes!`,
            );
            continue;
        }
    }
};

export const invoke = () => {
    announcerCron();
    setInterval(announcerCron, 60000);
};
