import User from "../models/User.js";

const escapeRx = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function searchUsersByUsername(query, limit = 10) {
  const raw = (query ?? "").trim();
  if (!raw) return [];

  const q = escapeRx(raw.toLowerCase());

  const primary = await User.find(
    { username: { $regex: `^${q}` } },   
    { username: 1, avatar: 1 }
  ).limit(limit).lean();

  let users = [...primary];

  if (users.length < limit) {
    const more = await User.find(
      { username: { $regex: q }, _id: { $nin: users.map(u => u._id) } },
      { username: 1, avatar: 1 }
    ).limit(limit - users.length).lean();
    users.push(...more);
  }

  return users; 
}
