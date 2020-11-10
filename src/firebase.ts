import * as admin from 'firebase-admin';

admin.initializeApp({
    credential: admin.credential.cert('./firebase.json'),
    databaseURL: 'https://genesis-connect-app.firebaseio.com',
});

export default {
    admin: admin,
    firestore: admin.firestore,
};
