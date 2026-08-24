import fs from "fs";
import path from "path";
import { getDb, withDbLock, type User, toPublicUser } from "./db";
import { TOTAL_STAMPS } from "./constants";
import { getAvatarsDir } from "./paths";
import { notifyStampMilestone } from "./telegram";

export { TOTAL_STAMPS };

export async function addStampToUser(userId: number) {
  return withDbLock(async () => {
    const db = await getDb();

    const result = db
      .prepare(
        `UPDATE users
         SET stamps = stamps + 1,
             rewards = CASE WHEN stamps + 1 >= ? THEN rewards + 1 ELSE rewards END
         WHERE id = ? AND stamps < ?`
      )
      .run(TOTAL_STAMPS, userId, TOTAL_STAMPS);

    if (!result.changes) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
      if (!user) {
        return { error: "Usuario no encontrado" as const };
      }
      return {
        error:
          "Este cliente ya completó sus 10 sellos. Entrega el premio y reinicia la tarjeta antes de seguir." as const,
      };
    }

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;
    const earnedReward = updated.stamps >= TOTAL_STAMPS;

    void notifyStampMilestone(updated.username, updated.stamps).catch((error) => {
      console.error("[telegram] Error al notificar hito:", error);
    });

    return {
      user: toPublicUser(updated),
      earnedReward,
    };
  });
}

export async function removeStampFromUser(userId: number) {
  return withDbLock(async () => {
    const db = await getDb();

    const before = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
    if (!before) {
      return { error: "Usuario no encontrado" as const };
    }

    if (before.stamps <= 0) {
      return { error: "Este cliente no tiene sellos para quitar" as const };
    }

    const result = db
      .prepare(
        `UPDATE users
         SET stamps = stamps - 1,
             rewards = CASE
               WHEN stamps >= ? AND rewards > 0 THEN rewards - 1
               ELSE rewards
             END
         WHERE id = ? AND stamps > 0`
      )
      .run(TOTAL_STAMPS, userId);

    if (!result.changes) {
      return { error: "Este cliente no tiene sellos para quitar" as const };
    }

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;
    const removedReward = before.stamps >= TOTAL_STAMPS && updated.rewards < before.rewards;

    return {
      user: toPublicUser(updated),
      removedReward,
    };
  });
}

export async function redeemPrizeAndResetCard(userId: number) {
  return withDbLock(async () => {
    const db = await getDb();

    const result = db
      .prepare("UPDATE users SET stamps = 0 WHERE id = ? AND stamps >= ?")
      .run(userId, TOTAL_STAMPS);

    if (!result.changes) {
      const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
      if (!user) {
        return { error: "Usuario no encontrado" as const };
      }
      return { error: "La tarjeta aún no está completa" as const };
    }

    const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;
    return { user: toPublicUser(updated) };
  });
}

export async function getUserByStampToken(token: string) {
  const db = await getDb();
  return db.prepare("SELECT * FROM users WHERE stamp_token = ?").get(token) as User | undefined;
}

export async function listRegisteredUsers() {
  const db = await getDb();
  const rows = db
    .prepare(
      "SELECT id, username, stamps, rewards, avatar_url FROM users ORDER BY lower(username) ASC"
    )
    .all() as {
    id: number;
    username: string;
    stamps: number;
    rewards: number;
    avatar_url: string | null;
  }[];

  return rows.map((row) => ({
    id: row.id,
    username: row.username,
    stamps: row.stamps,
    rewards: row.rewards,
    avatarUrl: row.avatar_url,
  }));
}

export async function deleteRegisteredUser(userId: number) {
  return withDbLock(async () => {
    const db = await getDb();

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
    if (!user) {
      return { error: "Usuario no encontrado" as const };
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(userId);

    const avatarsDir = getAvatarsDir();
    for (const ext of ["jpg", "jpeg", "png", "webp", "gif"]) {
      const filepath = path.join(avatarsDir, `${userId}.${ext}`);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

    return { ok: true as const, username: user.username };
  });
}
