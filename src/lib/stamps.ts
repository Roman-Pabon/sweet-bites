import fs from "fs";
import path from "path";
import { getDb, type User, toPublicUser } from "./db";
import { TOTAL_STAMPS } from "./constants";
import { getAvatarsDir } from "./paths";
import { notifyStampMilestone } from "./telegram";

export { TOTAL_STAMPS };

export async function addStampToUser(userId: number) {
  const db = await getDb();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!user) {
    return { error: "Usuario no encontrado" as const };
  }

  if (user.stamps >= TOTAL_STAMPS) {
    return {
      error: "Este cliente ya completó sus 10 sellos. Entrega el premio y reinicia la tarjeta antes de seguir." as const,
    };
  }

  let stamps = user.stamps + 1;
  let rewards = user.rewards;
  let earnedReward = false;

  if (stamps >= TOTAL_STAMPS) {
    rewards += 1;
    earnedReward = true;
  }

  db.prepare("UPDATE users SET stamps = ?, rewards = ? WHERE id = ?").run(stamps, rewards, userId);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;

  // No bloquea el marcado si Telegram falla o no está configurado.
  void notifyStampMilestone(updated.username, updated.stamps).catch((error) => {
    console.error("[telegram] Error al notificar hito:", error);
  });

  return {
    user: toPublicUser(updated),
    earnedReward,
  };
}

export async function removeStampFromUser(userId: number) {
  const db = await getDb();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!user) {
    return { error: "Usuario no encontrado" as const };
  }

  if (user.stamps <= 0) {
    return { error: "Este cliente no tiene sellos para quitar" as const };
  }

  let stamps = user.stamps - 1;
  let rewards = user.rewards;
  let removedReward = false;

  // Si se deshace el 10.º sello, también se quita el premio pendiente de esa tarjeta.
  if (user.stamps >= TOTAL_STAMPS && rewards > 0) {
    rewards -= 1;
    removedReward = true;
  }

  db.prepare("UPDATE users SET stamps = ?, rewards = ? WHERE id = ?").run(stamps, rewards, userId);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;

  return {
    user: toPublicUser(updated),
    removedReward,
  };
}

export async function redeemPrizeAndResetCard(userId: number) {
  const db = await getDb();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!user) {
    return { error: "Usuario no encontrado" as const };
  }

  if (user.stamps < TOTAL_STAMPS) {
    return { error: "La tarjeta aún no está completa" as const };
  }

  if (user.rewards < 1) {
    return { error: "Este cliente no tiene un premio para canjear" as const };
  }

  db.prepare("UPDATE users SET stamps = ?, rewards = ? WHERE id = ?").run(
    0,
    user.rewards - 1,
    userId
  );

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;

  return { user: toPublicUser(updated) };
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
}
