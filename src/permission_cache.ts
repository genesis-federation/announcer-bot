import admin from '@/firebase';
export const PermissionsCache = new Map();

const fetchPermissions = async () => {
    const settings = await admin.firestore().doc(`settings/settings`).get();
    const admins = (settings.data()?.announcementAdmins as string[]) || [];
    const users = (settings.data()?.announcementUsers as string[]) || [];

    admins.forEach((i) => {
        PermissionsCache.set(i, 'admin');
    });

    users.forEach((i) => {
        PermissionsCache.set(i, 'user');
    });
};

fetchPermissions();
