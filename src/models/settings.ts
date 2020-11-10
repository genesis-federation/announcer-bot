import firebase from '@/firebase';

class AppSettings {
    async get() {
        return firebase.firestore().doc(`settings/settings`).get();
    }

    async setOne(key: string, value: any) {
        return firebase
            .firestore()
            .doc(`settings/settings`)
            .set(
                {
                    [key]: value,
                },
                {
                    merge: true,
                },
            );
    }
}

export const Settings = new AppSettings();
