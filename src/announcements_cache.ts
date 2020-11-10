import admin from '@/firebase';
import fbadmin from 'firebase-admin';
import moment from 'moment';
import { AnnouncementInterface } from './types/type';
export const AnnouncementsCache = new Map<string, AnnouncementInterface>();

const fetchAnnouncements = async () => {
    const now = new Date();
    const settings = await admin
        .firestore()
        .collection('announcements')
        .where('when', '>=', now)
        .get();
    settings.docs.forEach((doc) => {
        if (doc.exists) {
            const data = doc.data();

            data.when = moment.utc(
                (data.when as fbadmin.firestore.Timestamp).toDate(),
            );

            AnnouncementsCache.set(
                data.messageId,
                data as AnnouncementInterface,
            );
        }
    });
};

fetchAnnouncements();
