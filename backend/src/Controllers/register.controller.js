import { asyncHandler } from "../utils/asynchandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.models.js"
import { UploadOnCloudinary } from "../utils/cloudinary.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
const generateAccessAndRefreshTokens = async (userId) => {
    try{
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
    }
    catch(error){
        throw new ApiError(500,"Something went wrong generationg tokens")
    }

    
};

const registerUser = asyncHandler(async (req,res)=>{
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    console.log("🟡 Incoming Request Body:", req.body);
    console.log("🟡 Incoming Files:", req.files);
    const {fullname,
      phoneNumber,
      emailId,
      adharNo,
      password,
      department,
      }=req.body


    //basic validation
    if(!fullname || !phoneNumber || !emailId || !adharNo || !password ||!department)
        throw new ApiError(400,"All fieds are required!")
    if (!/^[a-zA-Z ]{3,}$/.test(fullname)) {
      throw new ApiError(400, "Full name must be at least 3 characters and contain only letters.");
    }
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      throw new ApiError(400, "Enter a valid 10-digit phone number.");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailId)) {
      throw new ApiError(400, "Enter a valid email address.");
    }
    if (!/^\d{12}$/.test(adharNo)) {
      throw new ApiError(400, "Aadhaar number must be a 12-digit number.");
    }
    

    //check if user exists
    const existingUser = await User.findOne({ $or: [{ emailId }, { phoneNumber }, { adharNo }] })
    if(existingUser)
        throw new ApiError(409,"Existing User")
    

    //file uploading 
    const AdharUrl = req.files?.Adharphoto[0]?.path
    const govtIdProofUrl = req.files?.govtIdProof[0]?.path
    if(!AdharUrl || !govtIdProofUrl)
        throw new ApiError(502,"Photo required")
    const Adharphoto = await UploadOnCloudinary(AdharUrl);
    const govtIdProof = await UploadOnCloudinary(govtIdProofUrl);
    if(!Adharphoto || !govtIdProof)
        throw new ApiError(500, "File upload failed.")
    const userData = {
      fullname,
      phoneNumber,
      emailId,
      adharNo,
      password,
      department,
      Adharphoto: Adharphoto.url,
      govtIdProof: govtIdProof.url,
    };
    
    
    //for driver specifically
    if (department === "Driver") {
      const {vehicleType,
      vehicleNumber,
      licenseNumber}=req.body
      const licenseDoc = req.files?.licenseDocument?.[0];
      if (!vehicleType || !vehicleNumber || !licenseNumber || !licenseDoc) {
        throw new ApiError(400, "Driver  vehicle details and license document missing");
      }
      const validTypes = ["Box Trucks", "Refrigerated Trucks","Mini-Van","Container Trucks"];
    if (!validTypes.includes(vehicleType)) {
      throw new ApiError(400, "Invalid vehicle type.");
    }
    if (!/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(vehicleNumber)) {
      throw new ApiError(400, "Vehicle number must follow the format: XX00XX0000.");
    }
    if (!/^[A-Z0-9]{15}$/.test(licenseNumber)) {
      throw new ApiError(400, "License number must be 15 alphanumeric characters.");
    }

      const licenseUpload = await UploadOnCloudinary(licenseDoc.path);
      if (!licenseUpload) {
        throw new ApiError(500, "License document upload failed.");
      }

      userData.vehicleType = vehicleType;
      userData.vehicleNumber = vehicleNumber;
      userData.licenseNumber = licenseNumber;
      userData.licenseDocument = licenseUpload.url;
      userData.availabilityStatus = true;
    }
    const user = await User.create(userData);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

// 🚀 Login Controller
const loginUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const phoneNumber = req.body?.phoneNumber;
    const password = req.body?.password;
    
    if (!phoneNumber) {
        throw new ApiError(400, "Email is required");
    }

    const user = await User.findOne({ phoneNumber });

    if (!user) {
        throw new ApiError(404, "User not found. Please register first.");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const cookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "Strict"
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user: loggedInUser, accessToken, refreshToken },
                "Login successful"
            )
        );
});

const logoutUser = asyncHandler(async(req,res)=>{
  User.findByIdAndUpdate(
    req.user._id,{
      $unset: {
          refreshToken: 1 // this removes the field from document
      }
    },
    {
          new: true
    }
  )
  const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})
const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullname, emailId, phoneNumber} = req.body

    if (!fullname || !emailId) {
        throw new ApiError(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullname,
                emailId: emailId,
                phoneNumber:phoneNumber
            }
        },
        {new: true}
        
    ).select("-password")

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"))
});


const getCurrentUser = asyncHandler(async(req, res) => {
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")
            
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessAndRefereshTokens(user._id)
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200, 
                {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

const updateDriverDetails = asyncHandler(async (req, res) => {
  const { vehicleType, vehicleNumber, licenseNumber } = req.body;

  // Basic validation
  if (!vehicleType || !vehicleNumber || !licenseNumber) {
    throw new ApiError(400, "All vehicle fields are required.");
  }

  const validTypes = ["Box Trucks", "Refrigerated Trucks", "Mini-Van", "Container Trucks"];
  if (!validTypes.includes(vehicleType)) {
    throw new ApiError(400, "Invalid vehicle type.");
  }

  if (!/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/.test(vehicleNumber)) {
    throw new ApiError(400, "Vehicle number must follow the format: XX00XX0000.");
  }

  if (!/^[A-Z0-9]{15}$/.test(licenseNumber)) {
    throw new ApiError(400, "License number must be 15 alphanumeric characters.");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        vehicleType,
        vehicleNumber,
        licenseNumber
      }
    },
    { new: true }
  ).select("-password");

  return res.status(200).json(
    new ApiResponse(200, updatedUser, "Driver vehicle details updated successfully")
  );
});


export {registerUser,loginUser,logoutUser,updateAccountDetails,getCurrentUser,changeCurrentPassword,refreshAccessToken,updateDriverDetails} 