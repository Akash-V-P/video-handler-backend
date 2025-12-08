import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from '../utils/ApiResponse.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import mongoose from 'mongoose';
import { Book } from '../models/book.model.js';

const publishABook = asyncHandler(async (req, res) => {
    const { title, description, price, pages } = req.body;

    if (!title || !description) {
        throw new ApiError(400, "both titlw and description required.");
    }

    console.log(req.files);

    const coverImageLocalPath = req.files?.coverImage[0]?.path;
    const BookFileLocalPath = req.files?.bookFile[0]?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "cover image is required.")
    }

    if (!BookFileLocalPath) {
        throw new ApiError(400, "book file is required.")
    }

    const bookFile = await uploadOnCloudinary(BookFileLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!bookFile) {
        throw new ApiError(400, "book file could not upload to cloudnary.")
    }

    if (!coverImage) {
        throw new ApiError(400, "cover image could not upload to cloudnary.")
    }

    const book = await Book.create(
        {
            title,
            description,
            bookFile: bookFile.url,
            coverImage: coverImage.url,
            pages: pages || 0,
            price: price || 0,
            isPublished: true,
            owner: req.user?._id
        }
    )

    const createdBook = await Book.findById(book?._id);

    if (!createdBook) {
        throw new ApiError(500, "book could not be uploaded.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdBook,
                "book uploaded successfully."
            )
        )
})

const updateBook = asyncHandler(async (req, res) => {
    const { BookId } = req.params;
    const { title, description, price } = req.body;

    if (!videoId) {
        throw new ApiError(400, "book Id is required.");
    }

    if (!title && !description && !price) {
        throw new ApiError(400, "no fields to update.");
    }
    const updateData = {};

    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (price) updateData.price = price;

    const coverImageLocalPath = req.body?.coverImage[0]?.path;

    if (coverImageLocalPath) {
        const coverImage = await uploadOnCloudinary(coverImageLocalPath);

        if (!coverImage) {
            throw new ApiError(400, "thumbnail could not upload on cloudnary.");
        }

        updateData.coverImage = coverImage.url;
    }

    if (Object.keys(updateData).length === 0) {
        throw new ApiError(400, "no fields to update")
    }

    const updatedBook = await Book.findByIdAndUpdate(
        BookId,
        {
            $set: updateData
        },
        { new: true }
    )

    if (!updatedBook) {
        throw new ApiError(500, "could not update the video.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedBook,
                "video updated successfully."
            )
        )
})

const deleteBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        throw new ApiError(400, "book Id is required.");
    }

    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
        throw new ApiError(500, "book could not be deleted.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "book deleted successfully."
            )
        )
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        throw new ApiError(400, "book Id is required.");
    }

    const toggledPublishStatus = await Book.findByIdAndUpdate(
        bookId,
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


const getBookById = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    if (!bookId) {
        throw new ApiError(400, "Book Id is required.");
    }

    const book = await Book.findById(bookId);

    if (!book) {
        throw new ApiError(500, "could not find the book.");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                book,
                "book fetched successfully."
            )
        )
})

const getAllBooks = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query

    if (!userId) {
        throw new ApiError(400, "user Id is required.");
    }

    if (!page || !limit) {
        throw new ApiError(400, "page and limit is required.");
    }

    const result = await Book.aggregatePaginate(
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

    // if (result.length === 0) {
    //     throw new ApiError(404, "no books found.");
    // }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                result,
                "all books fetched successfully."
            )
        )
})


export { publishABook, updateBook, deleteBook, togglePublishStatus, getBookById, getAllBooks };