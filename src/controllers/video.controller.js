import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import { Video } from '../models/video.model.js';
import { getVideoDurationInSeconds } from 'get-video-duration';


const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "both titlw and description required.");
    }

    console.log(req.files);

    const thumbnailLocalPath = req.files?.thumbnail[0]?.path;
    const videoFileLocalPath = req.files?.videoFile[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required.")
    }

    if (!videoFileLocalPath) {
        throw new ApiError(400, "video file is required.")
    }

    const duration = await getVideoDurationInSeconds(videoFileLocalPath);

    const videoFile = await uploadOnCloudinary(videoFileLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!videoFile) {
        throw new ApiError(400, "video file could not upload to cloudnary.")
    }

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail could not upload to cloudnary.")
    }

    const video = await Video.create(
        {
            title,
            description,
            videoFile: videoFile.url,
            thumbnail: thumbnail.url,
            duration,
            isPublished: true,
            owner: req.user._id
        }
    )

    const createdVideo = await Video.findById(video?._id);

    if (!createdVideo) {
        throw new ApiError(500, "video could not be uploaded.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdVideo,
                "video uploaded successfully."
            )
        )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!videoId) {
        throw new ApiError(400, "video Id is required.");
    }

    if (!title || !description) {
        throw new ApiError(400, "title and description required.");
    }

    const thumbnailLocalPath = req.body?.thumbnail[0]?.path;

    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail is required.");
    }

    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
        throw new ApiError(400, "thumbnail could not upload on cloudnary.");
    }

    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                title,
                description,
                thumbnail
            }
        }
    )

    if (!updatedVideo) {
        throw new ApiError(500, "could not update the video.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedVideo,
                "video updated successfully."
            )
        )
})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video Id is required.");
    }

    const deletedVideo = await Video.findByIdAndDelete(videoId);

    if (!deletedVideo) {
        throw new ApiError(500, "video could not be deleted.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "video deleted successfully."
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video Id is required.");
    }

    const toggledPublishStatus = await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !isPublished
            }
        }
    )

    if (!toggledPublishStatus) {
        throw new ApiError(500, "could not toggle the publish status.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                toggledPublishStatus,
                "toggle status toggled successfully."
            )
        )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!videoId) {
        throw new ApiError(400, "video Id is required.");
    }

    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(500, "could not find the video.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "toggle status toggled successfully."
            )
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query

    if (!userId) {
        throw new ApiError(400, "user Id is required.");
    }

    if (!page || !limit) {
        throw new ApiError(400, "page and limit is required.");
    }

    const result = await Video.aggregatePaginate(
        //aggrigation pipeline
        [
            {
                $match: {
                    owner: userId
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            }
        ],
        //pagination options
        {
            page,
            limit
        }
    )

    if (result.length === 0) {
        throw new ApiError(404, "no videos found.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "all videos fetched successfully."
            )
        )
})


export { publishAVideo, updateVideo, deleteVideo, togglePublishStatus, getVideoById, getAllVideos, }