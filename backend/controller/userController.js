import error from "../middleware/error.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
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

export const resetPassword = handleAsyncError(async(req,res,next)=>{
    const resetToken =req.params.token
    const resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    //   res.status(200).json({
    //     success:true,
    //     resetToken
    //   })
    const user =await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()}
    })
    if (!user){
        return next(new HandleError("Reset password token is invalid or expired",400))
    }

    const {password,confirmPassword} = req.body;
    if(password!==confirmPassword){
        return next(new HandleError("Password doesn't match",400))
    }
    user.password=password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;
    await user.save()
    sendToken(user,200,res)
})

export const getUserDetails = handleAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success:true,
        user
    })
})

export const updatePassword = handleAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword,confirmPassword} = req.body;
    const user = await User.findById(req.user.id).select("+password");
    const checkPassword = await user.verifyPassword(oldPassword);
    if(!checkPassword){
        return next(new HandleError("Old Password is incorrect",400))
    }
    if (newPassword!== confirmPassword){
         return next(new HandleError("Password doesn't match",400))
    }
    user.password=newPassword;
    await user.save()
    sendToken(user,200,res)
})

export const updateProfile = handleAsyncError(async(req,res,next)=>{
    const {name,email}=req.body;
    const updateUserDetails = {
        name,
        email
    }
    const user = await User.findByIdAndUpdate(req.user.id,updateUserDetails,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        success:true,
        message:"Profile Updated Successfully",
        user
    })
})

export const getUsersList = handleAsyncError(async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({
        success:true,
        users
    }) 
})

export const getSingleUser = handleAsyncError (async(req,res,next)=>{
    const user = await User.findById(req.params.id)
    if(!user){
        return next(new HandleError(`User doesn't Exists with this id : ${req.params.id}`,400))
    }

    res.status(200).json({
        success:true,
        user
    })
})

export const updateUserRole = handleAsyncError (async(req,res,next)=>{
    const {role} = req.body;
    const newUserData={role}
    const user = await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true
    })
    if(!user){
        return next(new HandleError("User doesn't exist",404))
    }
    res.status(200).json({
        success:true,
        user
    })
})

export const deleteUser = handleAsyncError (async(req,res,next)=>{
   const user = await User.findById(req.params.id)
   if(!user){
    return next(new HandleError("User doesn't exist",404))
   }
   await User.findByIdAndDelete(req.params.id,{new:true});
   res.status(200).json({
    success:true,
    message:"User Deleted Successfully"
   })
})