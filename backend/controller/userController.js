import error from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import handleAsyncError from "../middleware/handleAsyncError.js";
import User from "../models/userModel.js"
import HandleError from "../utils/handleError.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";


export const registerUser = handleAsyncError(async (req, res, next) => {
    const { name, email, password } = req.body;

    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "This is temp id",
            url: "This is temp url"
        }
    })
       sendToken(user, 201, res)


})


export const loginUser = handleAsyncError(async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new HandleError("Email or Password field cannot be empty", 400))
    }
    const user = await User.findOne({ email }).select("+password")
    if (!user) {
        return next(new HandleError("Invalid email or password ", 400))
    }
    const isPasswordValid = await user.verifyPassword(password)
    if (!isPasswordValid) {
        return next(new HandleError("Invalid email or password ", 400))
    }

    sendToken(user, 200, res)

})

export const logout  = handleAsyncError(async (req,res,next)=>{
    return res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly: true
    }).status(200).json({
        success:true,
        message:"successfully logged out"
    })
    
})

export const requestPasswordReset = handleAsyncError(async(req,res,next)=>{
    const {email} = req.body;
    const user=await User.findOne({email})
    if(!user){
       return next(new HandleError("User doesn't exist",400))
    }
    let resetToken;
    try {
        resetToken = user.generatePasswordResetToken()
          await user.save({ validateBeforeSave: false });

        // send resetToken to user's email here

        res.status(200).json({
            success: true,
            message: "Reset token generated successfully",
            token :resetToken
        });
        
    } catch (error) {
        console.error("Error saving reset token:", error);
       return next(new HandleError("Could not save reset token,Please try again later",500))
    }

    const resetPasswordURL = `http://localhost/api/vi/reset/${resetToken}`
    const message = `Use the following lik to reset your password : ${resetPasswordURL}. \n\n
    This lik will be expired in 30 minutes.\n\n
    If you didn't request for a password reset, please ignore this message`

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Reset Request`,
            message,
        })
        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
    } catch (error) {
        user.resetPasswordToken=undefined,
        user.resetPasswordExpire=undefined,
        await user.save({validateBeforeSave:false})
        return next(new HandleError("Email couldn't be sent ,Please try again later",500))
    }
})