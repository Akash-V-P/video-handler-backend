import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import { Subscription } from '../models/subscription.model.js';


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params;
    const userId = req.user._id;

    if (!channelId) {
        throw new ApiError(400, "no channel Id found");
    }

    if (!userId) {
        throw new ApiError(400, "user not found");
    }

    if (userId.toString() === channelId.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }

    const alreadySubscribed = await Subscription.findOne({
        subscriber: userId,
        channel: channelId
    });

    if (alreadySubscribed) {
        const unsubscribe = await Subscription.findOneAndDelete({
            subscriber: userId,
            channel: channelId
        });

        if (!unsubscribe) {
            throw new ApiError(500, "could not unsubscribe");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    unsubscribe,
                    "channel successfully unsubscribed."
                )
            )
    }
    else {
        const subscribe = await Subscription.create(
            {
                subscriber: userId,
                channel: channelId
            }
        )

        if (!subscribe) {
            throw new ApiError(500, "could not subscribe the channel");
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    subscribe,
                    "channel subscribed successfully"
                )
            )
    }




})

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new ApiError(400, "channel id not found")
    }

    const userChannelSubscribers = await Subscription.find(
        {
            channel: channelId
        }
    ).populate(
        "subscriber",
        "username fullName avatar"
    )

    // if (userChannelSubscribers.length === 0) {
    //     throw new ApiError(500, "could not get user channel subscribers")
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                userChannelSubscribers,
                "user channel subscribers successfully fetched."
            )
        )
})

const getSubscribedChannels = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    if (!userId) {
        throw new ApiError(400, "user id not found")
    }

    const SubscribedChannels = await Subscription.find(
        {
            subscriber: userId
        }
    ).populate(
        "channel",
        "username fullName avatar"
    )

    // if (SubscribedChannel.length === 0) {
    //     throw new ApiError(500, "could not get Subscribed Channels")
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                SubscribedChannels,
                "Subscribed Channel successfully fetched."
            )
        )
})


export { toggleSubscription, getSubscribedChannels, getUserChannelSubscribers, }
