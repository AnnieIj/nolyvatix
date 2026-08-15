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
  private inMemoryUser: DbUser = {
    id: 1,
    uid: 'default-nolyvatix-user',
    email: 'operator@nolyvatix.io',
    displayName: 'Stellar Operator',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  async getOrCreateDefaultUser(uid = 'default-nolyvatix-user', email = 'operator@nolyvatix.io'): Promise<DbUser> {
    if (!db) {
      return this.inMemoryUser;
    }

    try {
      const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      if (existing && existing.length > 0) {
        return existing[0] as DbUser;
      }

      const inserted = await db
        .insert(users)
        .values({
          uid,
          email,
          displayName: 'Stellar Operator',
        })
        .returning();

      return inserted[0] as DbUser;
    } catch (error) {
      logger.error('Failed to get or create default user in database, using fallback', error);
      return this.inMemoryUser;
    }
  }

  async getUserById(id: number): Promise<DbUser | null> {
    if (!db) {
      return this.inMemoryUser.id === id ? this.inMemoryUser : null;
    }

    try {
      const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
      return (result[0] as DbUser) || null;
    } catch (error) {
      logger.error(`Failed to fetch user by ID: ${id}`, error);
      return null;
    }
  }
}
