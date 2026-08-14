import { getDb, type User, toPublicUser } from "./db";
import { TOTAL_STAMPS } from "./constants";

export { TOTAL_STAMPS };

export async function addStampToUser(userId: number) {
  const db = await getDb();

  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User | undefined;
  if (!user) {
    return { error: "Usuario no encontrado" as const };
  }

  if (user.stamps >= TOTAL_STAMPS) {
    return { error: "Este cliente ya completó sus 10 sellos. Canjea el premio antes de seguir." as const };
  }

  let stamps = user.stamps + 1;
  let rewards = user.rewards;
  let earnedReward = false;

  if (stamps >= TOTAL_STAMPS) {
    rewards += 1;
    stamps = 0;
    earnedReward = true;
  }

  db.prepare("UPDATE users SET stamps = ?, rewards = ? WHERE id = ?").run(stamps, rewards, userId);

  const updated = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as User;

  return {
    user: toPublicUser(updated),
    earnedReward,
  };
}

export async function getUserByStampToken(token: string) {
  const db = await getDb();
  return db.prepare("SELECT * FROM users WHERE stamp_token = ?").get(token) as User | undefined;
}
