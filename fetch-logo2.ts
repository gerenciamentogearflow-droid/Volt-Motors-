import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import fs from 'fs';

const firebaseConfig = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

async function fetchLogo() {
  try {
    const docRef = doc(db, 'settings', 'logo');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data.url) {
        fs.writeFileSync('fetched-base64.txt', data.url);
        console.log('Logo fetched! Length:', data.url.length);
        
        // Save as true file if base64
        if (data.url.startsWith('data:image')) {
          const match = data.url.match(/^data:image\/(.+?);base64,(.+)$/);
          if (match) {
             const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
             const buffer = Buffer.from(match[2], 'base64');
             fs.writeFileSync('public/logo-app.' + ext, buffer);
             console.log('Saved as public/logo-app.' + ext);
          }
        }
      } else {
        console.log('No URL in doc');
      }
    } else {
      console.log('Logo document does not exist.');
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

fetchLogo();
