const BookModel = require("../model/BookModel");
const BorrowModel = require("../model/BorrowModel");
const { setCache, getCache } = require("../utils/cache");

const homeController = {};

homeController.getHomeData = async (req, res) => {
  try {
    // Check cache first
    const cachedData = getCache("homeData");
    if (cachedData) {
      return res.status(200).json({
        error: false,
        message: "Homepage data fetched from cache",
        ...cachedData
      });
    }

    // Total books
    const totalBooks = await BookModel.countDocuments();

    // Top 4 categories
    const categories = await BookModel.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 }, coverImage: { $first: "$coverImage" } } },
      { $sort: { count: -1 } },
      { $limit: 4 }
    ]).then(data =>
      data.map(item => ({
        category: item._id || "Uncategorized",
        count: item.count,
        coverImage: item.coverImage || "/images/default-subject.jpg"
      }))
    );

    // Total unique categories
    const totalCategories = await BookModel.distinct("category").then(c => c.length);

    // New arrivals
    const newArrivals = await BookModel.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .select("title author category coverImage");

    // Active students = users who have issued books
    const issuedBooks = await BorrowModel.find({ status: "issued" }).select("userId");
    const activeStudentsSet = new Set(issuedBooks.map(issue => issue.userId.toString()));
    const totalActiveStudents = activeStudentsSet.size;

    // Response
    const responseData = {
      stats: {
        totalBooks,
        totalCategories,
        totalActiveStudents
      },
      categories,
      newArrivals
    };

    // Cache for next requests
    setCache("homeData", responseData);

    res.status(200).json({
      error: false,
      message: "Homepage data fetched successfully",
      ...responseData
    });

  } catch (error) {
    console.error("Home data error:", error);
    res.status(500).json({
      error: true,
      message: "Internal Server Error",
      details: error.message
    });
  }
};

module.exports = { homeController };
