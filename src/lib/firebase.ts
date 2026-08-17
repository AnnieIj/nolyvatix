/**
 * Nolyvatix Client - Firebase Client SDK Initializer
 * Configured with project bubbly-music-ztgzl credentials
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);

/**
 * Ensures the client has an active Firebase user session (anonymous or authenticated)
 * Returns the current Firebase ID Token string
 */
export async function getAuthToken(): Promise<string | null> {
  let currentUser = auth.currentUser;

  if (!currentUser) {
    try {
      const userCredential = await signInAnonymously(auth);
      currentUser = userCredential.user;
    } catch (err) {
      console.warn('Anonymous sign-in failed or blocked:', err);
      return null;
    }
  }

  if (currentUser) {
    try {
      return await currentUser.getIdToken();
    } catch (err) {
      console.warn('Failed to retrieve Firebase ID Token:', err);
      return null;
    }
  }

  return null;
}

export { app, signInAnonymously, onAuthStateChanged };
export type { User };
