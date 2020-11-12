import moment from 'moment';
import { AnnouncementsCache } from './announcements_cache';
import { client } from '@/bot';
import { Settings } from '@/models/settings';
import { EmbedFieldData, MessageEmbed, TextChannel } from 'discord.js';
import admin from '@/firebase';
import path from 'path';

const config = require(path.join(__dirname, 'config.json'));

const announcerCron = async () => {
    console.log('announcer cron invoked.');
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
            value.announced.first = true;
            value.announced.second = true;
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
            channel.send(`@everyone, **${value.title}** is starting NOW!`);
            continue;
        }

        // Announce 30 minutes before
        if (diffInMinutes <= 30 && !value.announced.second) {
            value.announced.second = true;
            value.announced.first = true;
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
                `@everyone, **${value.title}** is starting in ${diffInMinutes} minutes!`,
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
                `@everyone, **${value.title}** is starting in ${diffInMinutes} minutes!`,
            );
            continue;
        }
    }
};

const editAnnouncementTimerCron = async () => {
    const setting = await Settings.get();
    const announcementChannelId = setting.data()?.announcementChannelId;

    const now = moment();
    const guild = client.guilds.cache.get(config.guildId);
    if (!guild) {
        console.log(`Failed to retrieve server information.`);
        return;
    }

    const channel = guild.channels.cache.get(
        announcementChannelId,
    ) as TextChannel;

    if (!channel) {
        console.log(`Failed to retrieve announcement channel.`);
        return;
    }

    for (const announcement of AnnouncementsCache) {
        const value = announcement[1];
        const announcementId = value.messageId;
        if (!announcementId) {
            continue;
        }

        const message = await channel.messages.fetch(announcementId);
        const embed = message.embeds[0];

        const fields: EmbedFieldData[] = [];

        const startsIn: string[] = [];
        const diff = moment.duration(value.when.diff(now));
        if (diff.days() > 0) {
            startsIn.push(`${diff.days()} days`);
        }

        if (diff.hours() > 0) {
            startsIn.push(`${diff.hours()} hours`);
        }

        if (diff.minutes() > 0) {
            startsIn.push(`${diff.minutes()} mins`);
        }

        fields.push(
            {
                name: 'Operation Type',
                value: value.type,
            },
            {
                name: 'Date',
                value: `${value.when.format('MMMM D YYYY, h:mm:ss a')} UTC`,
            },
            {
                name: 'Event Starts In',
                value: startsIn.join(', '),
            },
        );

        if (value.staging) {
            fields.push({
                name: 'Staging System',
                value: value.staging,
                inline: true,
            });
        }

        if (value.fcName) {
            fields.push({
                name: 'Fleet Commander',
                value: value.fcName,
                inline: true,
            });
        }

        if (value.doctrine) {
            fields.push({
                name: 'Doctrine Ship(s)',
                value: value.doctrine,
                inline: true,
            });
        }

        if (value.remarks) {
            fields.push({
                name: 'Remarks',
                value: value.remarks,
            });
        }

        // check if has 'participants'
        const participantEmbed = embed.fields.find(
            (i) => i.name === 'Participants',
        );
        if (participantEmbed) {
            fields.push(participantEmbed);
        }

        // check if has 'may participate'
        const mayParticipateEmbed = embed.fields.find(
            (i) => i.name === 'May Participate',
        );
        if (mayParticipateEmbed) {
            fields.push(mayParticipateEmbed);
        }

        const newEmbed = new MessageEmbed()
            .setTitle(value.title)
            .setDescription(value.description)
            .addFields(fields)
            .setTimestamp(value.when.toDate());

        if (value.bannerUrl) {
            newEmbed.setImage(value.bannerUrl);
        }
        await message.edit(newEmbed);
    }
};

export const invoke = () => {
    announcerCron();
    editAnnouncementTimerCron();
    setInterval(announcerCron, 60000);
    setInterval(editAnnouncementTimerCron, 60000);
};
