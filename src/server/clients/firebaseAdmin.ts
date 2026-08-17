/**
 * Nolyvatix Server - Firebase Admin SDK Client
 * Lazy, singleton initialization using Application Default Credentials (ADC)
 * Project: bubbly-music-ztgzl
 */

import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { Logger } from '../utils/logger.ts';

const logger = new Logger('FirebaseAdmin');

const DEFAULT_PROJECT_ID = 'bubbly-music-ztgzl';

let firebaseAdminApp: App | null = null;
let firebaseAdminAuth: Auth | null = null;

export function getFirebaseAdminApp(): App {
  if (firebaseAdminApp) {
    return firebaseAdminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    firebaseAdminApp = existingApps[0];
    logger.info('Reusing existing Firebase Admin App instance');
    return firebaseAdminApp;
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT || DEFAULT_PROJECT_ID;

  try {
    firebaseAdminApp = initializeApp({
      projectId,
    });
    logger.info(`Initialized Firebase Admin SDK for project: ${projectId}`);
    return firebaseAdminApp;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', error);
    throw error;
  }
}

export function getFirebaseAuthAdmin(): Auth {
  if (firebaseAdminAuth) {
    return firebaseAdminAuth;
  }

  const app = getFirebaseAdminApp();
  firebaseAdminAuth = getAuth(app);
  return firebaseAdminAuth;
}
