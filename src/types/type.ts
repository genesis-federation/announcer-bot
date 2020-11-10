export type SessionType = 'announcement' | null;
export interface AnnouncementInterface {
    messageId?: string;
    authorId: string;
    fcName?: string | null;
    title: string;
    when: moment.Moment;
    doctrine?: string | null;
    description: string;
    attending: number;
    notAttending: number;
    notSure: number;
    staging?: string | null;
    type: 'CTA' | 'HD' | 'OTHER';
    enablePingEveryone: boolean;
    [index: string]: any;
    announced: {
        first: boolean;
        second: boolean;
        actual: boolean;
    };
}
