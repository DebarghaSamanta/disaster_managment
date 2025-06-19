import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynchandler.js";
const isavailable = asyncHandler(async(req,res)=>{
    //LEARNING : FOR GET REQUEST NO NEED TO CHECK FOR ERRORS IF I AM NOT SENING AND DETAILS
    // const {department,availabilityStatus}=req.body
    /*if(department !== "Driver" || availabilityStatus !== true){
        throw new ApiError(401,"Driver not found ")
    }*/
    const availableDriver = await User.find({department: "Driver",
    availabilityStatus: true,})
    return res.status(200).json(
    new ApiResponse(200,availableDriver,"Driver found")
  );
})
export default isavailable