import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { users } from '../../../db/schema.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('UserDbRepository');

export interface DbUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class UserDbRepository {
  private inMemoryUsers: Map<string, DbUser> = new Map([
    [
      'default-nolyvatix-user',
      {
        id: 1,
        uid: 'default-nolyvatix-user',
        email: 'operator@nolyvatix.io',
        displayName: 'Stellar Operator',
        avatarUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  ]);
  private nextInMemoryId = 2;

  async getOrCreateDefaultUser(uid = 'default-nolyvatix-user', email = 'operator@nolyvatix.io'): Promise<DbUser> {
    return this.getOrCreateUserFromFirebase(uid, email, 'Stellar Operator', null);
  }

  async getOrCreateUserFromFirebase(
    uid: string,
    email: string = `${uid}@nolyvatix.io`,
    displayName: string | null = null,
    avatarUrl: string | null = null
  ): Promise<DbUser> {
    if (!db) {
      const existingInMemory = this.inMemoryUsers.get(uid);
      if (existingInMemory) {
        if (displayName) existingInMemory.displayName = displayName;
        if (avatarUrl) existingInMemory.avatarUrl = avatarUrl;
        return existingInMemory;
      }

      const newUser: DbUser = {
        id: this.nextInMemoryId++,
        uid,
        email: email || `${uid}@nolyvatix.io`,
        displayName: displayName || 'Nolyvatix User',
        avatarUrl,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryUsers.set(uid, newUser);
      return newUser;
    }

    try {
      const safeEmail = email || `${uid}@nolyvatix.io`;
      
      const inserted = await db
        .insert(users)
        .values({
          uid,
          email: safeEmail,
          displayName: displayName || null,
          avatarUrl: avatarUrl || null,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            updatedAt: new Date(),
            ...(displayName ? { displayName } : {}),
            ...(avatarUrl ? { avatarUrl } : {}),
          },
        })
        .returning();

      if (inserted && inserted.length > 0) {
        return inserted[0] as DbUser;
      }

      const fallback = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      return (fallback[0] as DbUser) || this.inMemoryUsers.get('default-nolyvatix-user')!;
    } catch (error) {
      logger.error(`Failed to get or create user for UID ${uid} in database:`, error);
      
      // Secondary fallback query in case of racing insert conflict
      try {
        const fallback = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
        if (fallback && fallback.length > 0) {
          return fallback[0] as DbUser;
        }
      } catch (innerErr) {
        logger.error(`Fallback select also failed for UID ${uid}:`, innerErr);
      }

      let inMem = this.inMemoryUsers.get(uid);
      if (!inMem) {
        inMem = {
          id: this.nextInMemoryId++,
          uid,
          email: email || `${uid}@nolyvatix.io`,
          displayName: displayName || 'Nolyvatix User',
          avatarUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.inMemoryUsers.set(uid, inMem);
      }
      return inMem;
    }
  }

  async getUserById(id: number): Promise<DbUser | null> {
    if (!db) {
      for (const u of this.inMemoryUsers.values()) {
        if (u.id === id) return u;
      }
      return null;
    }

    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return (result[0] as DbUser) || null;
    } catch (error) {
      logger.error(`Failed to fetch user by ID: ${id}`, error);
      return null;
    }
  }

  async getUserByUid(uid: string): Promise<DbUser | null> {
    if (!db) {
      return this.inMemoryUsers.get(uid) || null;
    }

    try {
      const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      return (result[0] as DbUser) || null;
    } catch (error) {
      logger.error(`Failed to fetch user by UID: ${uid}`, error);
      return null;
    }
  }
}

