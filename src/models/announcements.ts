import firebase from '@/firebase';
import { AnnouncementInterface } from '@/types/type';
import moment from 'moment';

export class Announcement implements AnnouncementInterface {
    messageId = '';
    authorId = '';
    fcName = '';
    title = '';
    bannerUrl = '';
    when = moment();
    type: 'CTA' | 'HD' | 'OTHER' = 'OTHER';
    doctrine = '';
    description = '';
    attending = 0;
    notAttending = 0;
    notSure = 0;
    staging = '';
    remarks = '';
    enablePingEveryone = false;
    announced = {
        first: false,
        second: false,
        actual: false,
    };

    constructor(announcement: AnnouncementInterface) {
        const keys = Object.keys(this);
        keys.forEach((item) => {
            if (!announcement[item]) {
                return;
            }

            Object.assign(this, {
                [item]: announcement[item],
            });
        });
    }

    fill(announcementId: string) {}

    save() {
        return firebase.firestore().doc(`announcements/${this.messageId}`).set({
            messageId: this.messageId,
            authorId: this.authorId,
            fcName: this.fcName,
            title: this.title,
            when: this.when,
            type: this.type,
            doctrine: this.doctrine,
            description: this.description,
            attending: this.attending,
            notAttending: this.notAttending,
            notSure: this.notSure,
            staging: this.staging,
            enablePingEveryone: this.enablePingEveryone,
            announced: this.announced,
            remarks: this.remarks,
            bannerUrl: this.bannerUrl,
        });
    }

    updateField(field: string, value: any) {
        return firebase
            .firestore()
            .doc(`announcements/${this.messageId}`)
            .update({
                [field]: value,
            });
    }
}
