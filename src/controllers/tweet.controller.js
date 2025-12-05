import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import Tweet from "../models/tweet.model"
import { ApiResponse } from "../utils/ApiResponse";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {

    const { content } = req.body;

    if (!content) {
        throw new ApiError(400, "content is required.");
    }

    const tweet = await Tweet.create(
        {
            content: content,
            owner: req.user._id
        }
    )

    if (!tweet) {
        throw new ApiError(500, "could not create tweet.")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                tweet,
                "tweet successfully created."
            )
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { _id } = req.params;

    if (!_id || !content) {
        throw new ApiError(400, "both tweetId and updatedTweet required");
    }

    const tweet = await Tweet.findById(_id);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if ( !tweet.owner.equals(req.user._id) ) {
        throw new ApiError(403, "users other than owner cannot edit the tweet.");
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        _id,
        {
            $set: {
                content: content
            }
        },
        {
            new: true
        }
    )

    if (!updatedTweet) {
        throw new ApiError(500, "failed to update the tweet.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedTweet,
                "tweet updated successfully."
            )
        )
})

const deleteTweet = asyncHandler(async (req, res) => {
    const { _id } = req.body;

    if (!_id) {
        throw new ApiError(400, "tweet id is required.");
    }

    const tweet = await Tweet.findById(_id);

    if (!tweet) {
        throw new ApiError(404, "Tweet not found");
    }

    if ( !tweet.owner.equals(req.user._id) ) {
        throw new ApiError(403, "users other than owner cannot delete the tweet.");
    }

    const deletedTweet = await Tweet.deleteOne({ _id });

    if (deletedTweet.deletedCount === 0) {
        throw new ApiError(500, "failed to delete the tweet.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "tweet deleted successfully."
            )
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const { id: userId } = req.params;

    if (!userId) {
        throw new ApiError(400, "no user found");
    }

    const userTweets = await Tweet.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        }, 
        {
            $sort: {
                createdAt: -1
            }
        }
    ])

    //this will return error fi no tweet were found
    // if (!userTweets?.length) {
    //     throw new ApiError(404, "no tweets found.")
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userTweets,
                "All tweets for current user fetched."
            )
        )
})


export { createTweet, updateTweet, deleteTweet, getUserTweets }