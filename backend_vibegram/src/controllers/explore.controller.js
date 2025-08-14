import Post from "../models/Post.js";

export const getExploreFeed = async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 60, 100);

    const items = await Post.aggregate([
      { $match: { imageUrl: { $exists: true, $ne: "" } } },
      { $sample: { size: limit } }, // случайный порядок
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          as: "author",
          pipeline: [{ $project: { username: 1, avatar: 1 } }],
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          _id: 1,
          image: "$imageUrl", // фронту возвращаем как image
          caption: 1,
          createdAt: 1,
          "author._id": 1,
          "author.username": 1,
          "author.avatar": 1,
        },
      },
    ]);

    res.json({ items });
  } catch (err) {
    next(err);
  }
};
