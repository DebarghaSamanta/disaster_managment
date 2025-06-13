import  {registerUser,loginUser,logoutUser,updateAccountDetails,getCurrentUser,changeCurrentPassword,updateDriverDetails  } from "../Controllers/register.controller.js";
import { Router } from "express";
import { upload } from "../middlewares/multer.js";
import { verifyJWT, allowOnlyDrivers } from "../middlewares/auth.middleware.js";

const router = Router()
router.route("/register").post(upload.fields([
    {
        name:"Adharphoto",//Same feild name should be there in frontend label
        maxCount:1
    },
    {
        name:"govtIdProof",//Same feild name should be there in frontend label
        maxCount:1
    },
    {
        name:"licenseDocument",//Same feild name should be there in frontend label
        maxCount:1
    }
    ]),
    registerUser)
router.route("/login").post(loginUser)

//secured routes
router.route("/logout").post(verifyJWT,  logoutUser)
router.route("/updateaccountdetails").patch(verifyJWT,  updateAccountDetails)
router.route("/getcurrentuser").get(verifyJWT,  getCurrentUser)
router.route("/changepassword").post(verifyJWT,  changeCurrentPassword)
router.route("/updatedriverdetails").patch(verifyJWT,allowOnlyDrivers,updateDriverDetails)

export default router