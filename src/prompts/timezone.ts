import { Message } from 'discord.js';
import {
    DiscordPrompt,
    DiscordPromptFunction,
    MessageVisual,
    Rejection,
    VisualGenerator,
} from 'discord.js-prompts';

type Prompt = {
    timezone: number;
};

export const askTimezoneVisual: VisualGenerator<Prompt> = async (
    data: Prompt,
) => {
    return new MessageVisual(
        "Enter the timezone you're in using the format *UTC+tz*. Replace `tz` with your timezone. EG: `8` for Singapore Timezone (UTC+8).",
    );
};

export const askTimezoneFn: DiscordPromptFunction<Prompt> = async (
    message: Message,
    data: Prompt,
) => {
    const tz = Number.parseInt(message.content?.trim());

    if (isNaN(tz)) {
        throw new Rejection(`Invalid number. Try again.`);
    }

    return {
        ...data,
        timezone: tz,
    };
};
export const askTimezonePrompt = new DiscordPrompt(
    askTimezoneVisual,
    askTimezoneFn,
);
