import { AnnouncementInterface } from '@/types/type';
import moment from 'moment';
import { EmbedFieldData, Message, MessageEmbed } from 'discord.js';
import {
    DiscordPrompt,
    DiscordPromptFunction,
    MenuEmbed,
    MenuVisual,
    MessageVisual,
    Rejection,
    VisualGenerator,
} from 'discord.js-prompts';

export const askTitleVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    const embed = new MessageEmbed({
        title: '(Required) Operation title:',
        description: 'Enter the operation title. Max **256** characters.',
    });
    return new MessageVisual('', {
        embed: embed,
    });
};

export const askTitleFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const title = message.content?.trim();
    if (!title) {
        throw new Rejection(`Invalid operation title. Try again.`);
    }

    if (title.length > 256) {
        throw new Rejection(
            `Title must be less than 256 characters. Try again.`,
        );
    }

    return {
        ...data,
        title: title,
    };
};
export const askTitlePrompt = new DiscordPrompt(askTitleVisual, askTitleFn);

// FC
export const askFcVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Optional) Overall FC for this OP:`,
            description:
                'Enter the overall FC for this operation. Type `none` to disable.',
        }),
    });
};

export const askFcFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const fc = message.content?.trim();

    if (!fc) {
        throw new Rejection(`Invalid FC name. Try again.`);
    }

    if (fc.length > 1024) {
        throw new Rejection(
            `FC name(s) must be less than 1024 characters. Try again.`,
        );
    }

    return {
        ...data,
        fcName: fc.toLowerCase() === 'none' ? null : fc,
    };
};
export const askFcPrompt = new DiscordPrompt(askFcVisual, askFcFn);

// Description
export const askDescriptionVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Required) Operation description:`,
            description:
                'Enter a detailed description about this op. You can use @mention, @ here and @ everyone. Max **2048** characters.',
        }),
    });
};

export const askDescriptionFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const description = message.content?.trim();
    if (!description) {
        throw new Rejection(`Invalid description. Try again.`);
    }

    if (description.length > 2048) {
        throw new Rejection(
            `Description must be less than 2048 characters. Try again.`,
        );
    }

    return {
        ...data,
        description: description,
    };
};
export const askDescriptionPrompt = new DiscordPrompt(
    askDescriptionVisual,
    askDescriptionFn,
);

// Doctrine ships
export const askDoctrineVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Optional) Doctrine Ship(s) for this OP:`,
            description:
                'Enter the doctrine ships for this operation eg: `Stabber, Moa, Vexor Navy Issue`. Type `none` to disable.',
        }),
    });
};

export const askDoctrineFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const doctrine = message.content?.trim();
    if (!doctrine) {
        throw new Rejection(`Invalid doctrine ship(s). Try again.`);
    }

    if (doctrine.length > 1024) {
        throw new Rejection(
            `Doctrine ships length must be less than 1024 characters. Try again.`,
        );
    }

    return {
        ...data,
        doctrine: doctrine.toLowerCase() === 'none' ? null : doctrine,
    };
};
export const askDoctrinePrompt = new DiscordPrompt(
    askDoctrineVisual,
    askDoctrineFn,
);

// Staging
export const askStagingVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Optional) Staging system:`,
            description:
                'Enter the staging system name. EG: `BZ-0GW`. Type `none` to disable.',
        }),
    });
};

export const askStagingFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const staging = message.content?.trim();
    if (!staging) {
        throw new Rejection(`Invalid doctrine ship(s). Try again.`);
    }

    if (staging.length > 1024) {
        throw new Rejection(
            `Staging system must be less than 1024 characters. Try again.`,
        );
    }

    return {
        ...data,
        staging: staging.toLowerCase() === 'none' ? null : staging,
    };
};
export const askStagingPrompt = new DiscordPrompt(
    askStagingVisual,
    askStagingFn,
);

// Type
export const askTypeVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    const embed = new MessageEmbed({
        title: `(Required) Operation type:`,
    });

    const askTypeMenu = new MenuEmbed(embed)
        .addOption('CTA', 'This is a Call to Arms operation.')
        .addOption('HD', 'This is a Home Defense operation.')
        .addOption('OTHER', 'This is another type of operation.');

    return new MenuVisual(askTypeMenu);
};

export const askTypeFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const type = message.content?.trim();
    let chosenType: 'CTA' | 'HD' | 'OTHER' = 'CTA';
    if (type === '1') {
        chosenType = 'CTA';
    } else if (type === '2') {
        chosenType = 'HD';
    } else {
        chosenType = 'OTHER';
    }
    return {
        ...data,
        type: chosenType,
    };
};
export const askTypePrompt = new DiscordPrompt(askTypeVisual, askTypeFn);

// Time
export const askTimeVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Required) Time:`,
            description:
                'Enter the exact time of operation **in UTC** using the format `MM/DD/YYYY HH:MM`: EG: 12/31/2020 15:00 (December 31, 2020 at 3:00pm UTC)',
        }),
    });
};

export const askTimeFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const time = message.content?.trim();
    const date = moment.utc(time, 'MM/DD/YYYY HH:mm', true);

    if (!date.isValid()) {
        throw new Rejection(`Failed to parse date. Please Try again.`);
    }

    const now = moment.utc();
    if (now.diff(date, 'hours') >= 0) {
        throw new Rejection(`Please enter a date and time in the future.`);
    }
    return {
        ...data,
        when: date,
    };
};
export const askDatePrompt = new DiscordPrompt(askTimeVisual, askTimeFn);

// Confirm Ping
export const askPingeveryoneVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Required) Send Ping Alerts?`,
            description:
                'Enter `yes` to mention @ everyone at: 1 hour before the event, 10 minutes before the event, at the actual start of the event. Otherwise, enter `no`',
        }),
    });
};

export const askPingEveryoneFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const ping = message.content?.trim().toLowerCase();
    const choices = ['yes', 'no'];
    if (!choices.includes(ping)) {
        throw new Rejection(`Please choose between \`yes\` and \`no\`.`);
    }

    let pingEveryone = false;
    if (ping.toLowerCase() === 'yes') {
        pingEveryone = true;
    }

    return {
        ...data,
        enablePingEveryone: pingEveryone,
    };
};
export const askPingEveryonePrompt = new DiscordPrompt(
    askPingeveryoneVisual,
    askPingEveryoneFn,
);

// Remarks
export const askRemarksVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Optional) Remarks:`,
            description:
                'Anything you want to add on this announcement. Type `none` to disable. Max **1024** characters.',
        }),
    });
};

export const askRemarksFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const remarks = message.content?.trim();
    if (!remarks) {
        throw new Rejection(`Invalid remarks. Try again.`);
    }

    if (remarks.length > 1024) {
        throw new Rejection(
            `Remarks must be less than 1024 characters. Try again.`,
        );
    }

    return {
        ...data,
        remarks: remarks.toLowerCase() === 'none' ? null : remarks,
    };
};
export const askRemarksPrompt = new DiscordPrompt(
    askRemarksVisual,
    askRemarksFn,
);

// Propaganda GIF
export const askBannerUrlVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
    return new MessageVisual('', {
        embed: new MessageEmbed({
            title: `(Optional) GIF:`,
            description:
                'Enter an image URL to be used for this OP. Type `none` to disable.',
        }),
    });
};

export const askBannerUrlFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const bannerUrl = message.content?.trim();

    if (!bannerUrl) {
        throw new Rejection(`Invalid image URL. Try again.`);
    }

    if (bannerUrl.length > 1024) {
        throw new Rejection(
            `Remarks must be less than 1024 characters. Try again.`,
        );
    }

    return {
        ...data,
        bannerUrl: bannerUrl.toLowerCase() === 'none' ? null : bannerUrl,
    };
};
export const askBannerUrlPrompt = new DiscordPrompt(
    askBannerUrlVisual,
    askBannerUrlFn,
);

// Confirm
export const confirmVisual: VisualGenerator<AnnouncementInterface> = async (
    data: AnnouncementInterface,
) => {
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
            name: 'Events Starts In',
            value: '*event timer will be shown on the actual post*',
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
        .addFields(fields);

    if (data.bannerUrl) {
        embed.setImage(data.bannerUrl);
    }

    if (data.enablePingEveryone) {
        embed.setFooter(
            `Bot will send pings for this event (90 minutes, 30 minutes and at the actual start)`,
        );
    }
    return new MessageVisual(
        'Post the announcement below? Type **yes** or **no** to finalize.',
        {
            embed: embed,
        },
    );
};

export const confirmFn: DiscordPromptFunction<AnnouncementInterface> = async (
    message: Message,
    data: AnnouncementInterface,
) => {
    const answer = message.content?.trim();
    let finalize = false;

    if (answer.toLowerCase() === 'yes') {
        finalize = true;
    }

    return {
        ...data,
        finalize: finalize,
    };
};
export const confirmPrompt = new DiscordPrompt(confirmVisual, confirmFn);
