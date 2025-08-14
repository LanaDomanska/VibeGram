import { searchUsersByUsername } from "../services/search.service.js";

export async function getSearch(req, res, next) {
  try {
    const q = (req.query.query ?? "").trim();
    if (!q) return res.json([]);

    const users = await searchUsersByUsername(q, 10);

    const origin = `${req.protocol}://${req.get("host")}`; 
    const toUrl = (p) => {
      if (!p) return null;
      if (p.startsWith("http")) return p;
      const clean = p.replace(/^\/?public/, ""); 
      return `${origin}${clean.startsWith("/") ? "" : "/"}${clean}`;
    };

    const payload = users.map(u => ({
      _id: u._id,
      username: u.username,
      avatarUrl: toUrl(u.avatar),
    }));

    res.json(payload);
  } catch (err) {
    next(err);
  }
}
