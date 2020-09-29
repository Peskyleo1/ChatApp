const functions = require('firebase-functions');
//installing bad words package
const Filter = require('bad-words');

const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

//We will export a cloud function which runs every time a new document is
//created in the "messages" collection.
//That will give us access to the message's text which we can then
//check for profanity. If there is profanity then we'll clean the text
//and ban the user.
exports.detectEvilUsers = functions.firestore
    .document('messages/{msgId}')
    .onCreate(async (doc, cxt) => {

        const filter = new Filter();
        const { text, uid } = doc.data();

        if (filter.isProfane(text)) {

            const cleaned = filter.clean(text);
            await doc.ref.update({text: ` I got Banned because i said... ${cleaned}`})

            await db.collection('banned').doc(uid).set({});
        }
    });