import {asyncHandler} from '../utils/asyncHandler.js';
import ApiError from "../utils/ApiError.js"
import { User } from '../models/user.model.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser = asyncHandler( async (req, res) => {
    //get user from frontend
    //validation - not empty
    //check if user already exist- email, username
    // check for images/avatar
    //upload them to cloudinary
    //create user object
    //create entry in db
    //remove password and refresh token field from response
    //check for user creation
    //return response

    const { fullName, email, username, password} = req.body;
    console.log("email: ",email)

    if( fullName === ""){
        throw new ApiError(400, "fullname is required");
    }

    //improve this validation
    if(
        [fullName, username, email, password].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required");
    }

    //improve this
    const existedUser = User.findOne({
        $or: [{username}, {email}]
    })
    if( existedUser ){
        throw new ApiError(409, "user with email or username already exist")
    }


    const avatarLocalPath = req.files?.avatar[0]?.path;
    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required");
    }


    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar){
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create(
        {
            username: username.toLowerCase(),
            fullName,
            email,
            password,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
        }
    )

    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500, "Could'nt regester user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User regestered successfully.")
    )
})

export {registerUser};