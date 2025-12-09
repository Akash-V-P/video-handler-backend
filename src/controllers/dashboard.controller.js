import mongoose from "mongoose"
import { Video } from "../models/video.model.js"
import { Subscription } from "../models/subscription.model.js"
import { Like } from "../models/like.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { Tweet } from "../models/tweet.model.js"
import { Book } from "../models/book.model.js"
import { View } from "../models/view.model.js"
import e from "express"

const getChannelStats = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    const totalVideos = await Video.countDocuments({ owner: channelId });

    const totalTweets = await Tweet.countDocuments({ owner: channelId });

    const totalBooks = await Book.countDocuments({ owner: channelId });

    const totalComments = await Comment.countDocuments({ owner: channelId });


    const totalVideoViewsAggregation = await View.aggregate(
        [
            {
                $match: {
                    video: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $lookup: {
                    form: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video"
                }
            },
            {
                $unwind: "$video"
            },
            {
                $match: {
                    "video.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalViews"
            }
        ]
    )
    const totalVideoViews = totalVideoViewsAggregation[0]?.totalViews || 0;

    const totalTweetViewsAggregation = await View.aggregate(
        [
            {
                $match: {
                    tweet: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $lookup: {
                    form: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweet"
                }
            },
            {
                $unwind: "$tweet"
            },
            {
                $match: {
                    "tweet.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalViews"
            }
        ]
    )
    const totalTweetViews = totalTweetViewsAggregation[0]?.totalViews || 0;

    const totalBookViewsAggregation = await View.aggregate(
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
                $lookup: {
                    form: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            },
            {
                $match: {
                    "book.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalViews"
            }
        ]
    )
    const totalBookViews = totalBookViewsAggregation[0]?.totalViews || 0;

    const channelTotalViews = totalTweetViews + totalBookViews + totalVideoViews


    const totalVideoLikeAggregation = await Like.aggregate(
        [
            {
                $match: {
                    video: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $lookup: {
                    form: "videos",
                    localField: "video",
                    foreignField: "_id",
                    as: "video"
                }
            },
            {
                $unwind: "$video"
            },
            {
                $match: {
                    "video.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalLikes"
            }
        ]
    )
    const totalVideoLikes = totalVideoLikeAggregation[0]?.totalLikes || 0;

    const totalTweetLikeAggregation = await Like.aggregate(
        [
            {
                $match: {
                    tweet: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $lookup: {
                    form: "tweets",
                    localField: "tweet",
                    foreignField: "_id",
                    as: "tweet"
                }
            },
            {
                $unwind: "$tweet"
            },
            {
                $match: {
                    "tweet.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totallikes"
            }
        ]
    )
    const totalTweetLikes = totalTweetLikeAggregation[0]?.totalLikes || 0;

    const totalBookLikeAggregation = await Like.aggregate(
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
                $lookup: {
                    form: "books",
                    localField: "book",
                    foreignField: "_id",
                    as: "book"
                }
            },
            {
                $unwind: "$book"
            },
            {
                $match: {
                    "book.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalLikes"
            }
        ]
    )
    const totalBookLikes = totalBookLikeAggregation[0]?.totalLikes || 0;

    const totalCommentLikeAggregation = await Like.aggregate(
        [
            {
                $match: {
                    comment: {
                        $exists: true,
                        $ne: null
                    }
                }
            },
            {
                $lookup: {
                    form: "comment",
                    localField: "comment",
                    foreignField: "_id",
                    as: "comments"
                }
            },
            {
                $unwind: "$comments"
            },
            {
                $match: {
                    "comments.owner": new mongoose.Types.ObjectId(channelId)
                }
            },
            {
                $count: "totalLikes"
            }
        ]
    )
    const totalCommentLikes = totalCommentLikeAggregation[0]?.totalLikes || 0;

    const channelTotalLikes = totalVideoLikes + totalTweetLikes + totalBookLikes + totalCommentLikes;

    const stats = {
        totalVideos,
        totalTweets,
        totalBooks,
        totalComments,
        totalVideoViews,
        totalTweetViews,
        totalBookViews,
        totalVideoLikes,
        totalBookLikes,
        totalTweetLikes,
        totalCommentLikes,
        channelTotalViews,
        channelTotalLikes
    }

    return res
    .status(200 )
    .json(
        new ApiResponse(
           200,
           stats,
           "channel stats fetched successfully"
        )
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!mongoose.isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id");
    }

    const videos = await Video.find({ uploadedBy: channelId });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                videos,
                "Channel videos fetched successfully"
            )
        )
})

export {
    getChannelStats,
    getChannelVideos
}