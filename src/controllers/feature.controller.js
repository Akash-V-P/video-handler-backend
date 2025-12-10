import { Like } from "../models/like.model"
import { View } from "../models/view.model"


const getTopTenLikedBooks = asyncHandler(async (req, res) => {
    const topTenLikedBooks = await Like.aggregate(
        [
            {
                $match: {
                    book: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: "$book",
                    totalLikes: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalLikes: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            }
        ]
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                topTenLikedBooks,
                "top ten liked books successfully fetched."
            )
        )
})

const getTopHundredLikedBooks = asyncHandler(async (req, res) => {
    const topHundredLikedBooks = await Like.aggregate(
        [
            {
                $match: {
                    book: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: "$book",
                    totalLikes: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalLikes: -1
                }
            },
            {
                $limit: 100
            },
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            }
        ]
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                topHundredLikedBooks,
                "top ten liked books successfully fetched."
            )
        )
})

const getTopTenViewedBooks = asyncHandler(async (req, res) => {
    const topTenViewedBooks = await View.aggregate(
        [
            {
                $match: {
                    book: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: "$book",
                    totalViews: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalViews: -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            }
        ]
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                topTenViewedBooks,
                "top ten viewed books successfully fetched."
            )
        )
})

const getTopHundredViewedBooks = asyncHandler(async (req, res) => {
    const topHundredViewedBooks = await View.aggregate(
        [
            {
                $match: {
                    book: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $group: {
                    _id: "$book",
                    totalViews: { $sum: 1 }
                }
            },
            {
                $sort: {
                    totalViews: -1
                }
            },
            {
                $limit: 100
            },
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            }
        ]
    )

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                topHundredViewedBooks,
                "top ten viewed books successfully fetched."
            )
        )
})

const getTopTenViewedAuthors = asyncHandler(async (req, res) => {
    //top tex author is calculated based on total views on author books, tweet, videos.
    // for aggregation, lookup video, tweet and books, the add owner field in all of them
    //based on owner field use group and count the doc
    const topTenViewedAuthors = await View.aggregate(
        [
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "bookData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweetData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    author: {
                        $ifNull: [
                            { $first: "$bookData.owner" },
                            {
                                $ifNull: [
                                    { $first: "$videoData.owner" },
                                    { $first: "$tweetData.owner" },
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $match: {
                    author: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$author",
                    totalViews: { $sum: 1 }
                }
            },
            {
                $limit: 10
            },
            {
                $sort: { totalViews: -1 }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id", //after groupping =>{_id: "$author" }, _id is replaced with author id
                    foreignField: "_id",
                    as: "authorDetails",
                    pipeline: [
                        { $project: { username: 1, fullName: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $unwind: "$authorDetails"
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
           200,
           topTenViewedAuthors,
           "top ten most viewed author fetched."
        )
    )
})

const getTopTenLikedAuthors = asyncHandler(async (req, res) => {
    //top tex author is calculated based on total views on author books, tweet, videos.
    // for aggregation, lookup video, tweet and books, the add owner field in all of them
    //based on owner field use group and count the doc
    const topTenLikedAuthors = await Like.aggregate(
        [
            {
                $lookup: {
                    from: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "bookData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "videoData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $lookup: {
                    from: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweetData",
                    pipeline: [
                        {
                            $project: { owner: 1 }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    author: {
                        $ifNull: [
                            { $first: "$bookData.owner" },
                            {
                                $ifNull: [
                                    { $first: "$videoData.owner" },
                                    { $first: "$tweetData.owner" },
                                ]
                            }
                        ]
                    }
                }
            },
            {
                $match: {
                    author: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$author",
                    totalLikes: { $sum: 1 }
                }
            },
            {
                $limit: 10
            },
            {
                $sort: { totalLikes: -1 }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id", //after groupping =>{_id: "$author" }, _id is replaced with author id
                    foreignField: "_id",
                    as: "authorDetails",
                    pipeline: [
                        { $project: { username: 1, fullName: 1, avatar: 1 } }
                    ]
                }
            },
            {
                $unwind: "$authorDetails"
            }
        ]
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
           200,
           topTenLikedAuthors,
           "top ten most liked author fetched."
        )
    )
})


export { getTopTenLikedAuthors, getTopTenViewedAuthors, getTopTenLikedBooks, getTopHundredLikedBooks, getTopTenViewedBooks, getTopHundredViewedBooks }