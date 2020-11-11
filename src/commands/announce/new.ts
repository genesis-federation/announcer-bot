import { EmbedFieldData, Message, MessageEmbed, TextChannel } from 'discord.js';
import {
    Command,
    ArgumentCollectorResult,
    CommandoClient,
    CommandoMessage,
} from 'discord.js-commando';

import moment from 'moment';
import { Settings } from '@/models/settings';
import {
    askTitlePrompt,
    askFcPrompt,
    askDoctrinePrompt,
    askTypePrompt,
    askStagingPrompt,
    askDatePrompt,
    confirmPrompt,
    askDescriptionPrompt,
    askPingEveryonePrompt,
    askRemarksPrompt,
    askBannerUrlPrompt,
} from '@/prompts/announcement';
import { DiscordPromptRunner, Errors, PromptNode } from 'discord.js-prompts';
import { AnnouncementInterface } from '@/types/type';
import { Announcement } from '@/models/announcements';
import { PermissionsCache } from '@/permission_cache';
import { AnnouncementsCache } from '@/announcements_cache';

const askTitle = new PromptNode(askTitlePrompt);
const askFc = new PromptNode(askFcPrompt);
const askDescription = new PromptNode(askDescriptionPrompt);
const askDoctrine = new PromptNode(askDoctrinePrompt);
const askType = new PromptNode(askTypePrompt);
const askStaging = new PromptNode(askStagingPrompt);
const askDate = new PromptNode(askDatePrompt);
const askConfirm = new PromptNode(confirmPrompt);
const askRemarks = new PromptNode(askRemarksPrompt);
const askBannerUrl = new PromptNode(askBannerUrlPrompt);
const askPingEveryone = new PromptNode(askPingEveryonePrompt);

askTitle.addChild(askFc);
askFc.addChild(askDoctrine);
askDoctrine.addChild(askDescription);
askDescription.addChild(askType);
askType.addChild(askStaging);
askStaging.addChild(askDate);
askDate.addChild(askPingEveryone);
askPingEveryone.addChild(askRemarks);
askRemarks.addChild(askBannerUrl);
askBannerUrl.addChild(askConfirm);

module.exports = class NewCommand extends Command {
    constructor(client: CommandoClient) {
        super(client, {
            name: 'announcement-new',
            group: 'announcement',
            memberName: 'new',
            description: 'Creates a new announcement.',
            guildOnly: true,
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

        return true;
    }

    async run(
        message: CommandoMessage,
        args: string | object | string[],
        fromPattern: boolean,
        result?: ArgumentCollectorResult<object> | undefined,
    ): Promise<Message | Message[] | null> {
        //check if channelid is set
        const setting = await Settings.get();
        if (!setting.data()?.announcementChannelId) {
            message.channel.send(
                'Please set a channel where the announcement will be made by typing `!announcement-set-channel-id channel_id`',
            );
            return null;
        }

        const announcementChannelId = setting.data()?.announcementChannelId;

        // get announcement channel
        const channel = message.guild.channels.cache.get(announcementChannelId);
        if (!channel) {
            message.channel.send(
                `Cannot find announcement channel:\`${announcementChannelId}\`. Set a channel id using \`!announcement-set-channel-id channel_id\` `,
            );
            return null;
        }

        if (
            !((channel): channel is TextChannel => channel.type === 'text')(
                channel,
            )
        ) {
            message.channel.send(
                `\`${channel.name}\` is not a text channel. Set a new channel id using \`!announcement-set-channel-id channel_id\``,
            );
            return null;
        }

        const runner = new DiscordPromptRunner<AnnouncementInterface>(
            message.author,
            {
                authorId: message.author.id,
                attending: 0,
                description: '',
                doctrine: null,
                staging: null,
                fcName: null,
                notAttending: 0,
                notSure: 0,
                title: '',
                type: 'CTA',
                when: moment(),
                remarks: '',
                bannerUrl: '',
                enablePingEveryone: false,
                announced: {
                    actual: false,
                    first: false,
                    second: false,
                },
            },
        );

        try {
            const data = await runner.run(
                askTitle,
                message.channel as TextChannel,
            );

            const fields: EmbedFieldData[] = [];
            fields.push(
                {
                    name: 'Operation Type',
                    value: data.type,
                },
                {
                    name: 'Date',
                    value: `${data.when.format('MMMM D YYYY, h:mm:ss a')} UTC`,
                },
                {
                    name: 'Event Starts In',
                    value: data.when.format(
                        'D [day(s)], H [hour(s) and] m [min(s)]',
                    ),
                },
            );

            if (data.staging) {
                fields.push({
                    name: 'Staging System',
                    value: data.staging,
                    inline: true,
                });
            }

            if (data.fcName) {
                fields.push({
                    name: 'Fleet Commander',
                    value: data.fcName,
                    inline: true,
                });
            }

            if (data.doctrine) {
                fields.push({
                    name: 'Doctrine Ship(s)',
                    value: data.doctrine,
                    inline: true,
                });
            }

            if (data.remarks) {
                fields.push({
                    name: 'Remarks',
                    value: data.remarks,
                });
            }

            const embed = new MessageEmbed()
                .setTitle(data.title)
                .setDescription(data.description)
                .addFields(fields)
                .setFooter('React with ⏱️ to get the local time.');

            if (data.bannerUrl) {
                embed.setImage(data.bannerUrl);
            }

            const post = await channel.send('', {
                embed: embed,
            });

            await post.react('✅');
            await post.react('❔');
            await post.react('❌');
            post.react('⏱️');

            const announcement = new Announcement({
                messageId: post.id,
                ...data,
            });

            //save to cache
            AnnouncementsCache.set(post.id, announcement);

            await announcement.save();
            message.channel.send(
                `Announcement created! ID: \`${post.id}\`. To see a list of announcements, type \`!announcement-list\`. To cancel an announcement \`!announcement-cancel id\``,
            );
        } catch (err) {
            if (err instanceof Errors.UserInactivityError) {
                message.channel.send(
                    `New announcement aborted due to user inactivity.`,
                );
                // User is inactive
            } else if (err instanceof Errors.UserVoluntaryExitError) {
                message.channel.send(`Announcement cancelled by user.`);
            } else {
                message.channel.send(`An error occured.`);
                console.log(err.message);
            }
        }

        return null;
    }
};
