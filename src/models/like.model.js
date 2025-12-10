import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        comment: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        tweet: {
            type: Schema.Types.ObjectId,
            ref: "Tweet"
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: "Book"
        },
        likedBy: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
    },
    {
        timestamps: true
    }
);

//for adding unique documents so that user cannot like same video/comment/tweet/book more than once
likeSchema.index({ video: 1, likedBy: 1 }, { unique: true });
likeSchema.index({ comment: 1, likedBy: 1 }, { unique: true });
likeSchema.index({ tweet: 1, likedBy: 1 }, { unique: true });
likeSchema.index({ book: 1, likedBy: 1 }, { unique: true });


export const Like = mongoose.model("Like", likeSchema);