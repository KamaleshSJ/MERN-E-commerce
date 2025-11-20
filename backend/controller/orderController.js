import Order from "../models/orderModel.js"
import Product from '../models/productModel.js'
import User from "../models/userModel.js"
import HandleError from "../utils/handleError.js";
import handleAsyncError from '../middleware/handleAsyncError.js';
import { syncIndexes } from "mongoose";

export const createNewOrder = handleAsyncError(async(req,res,next)=>{
    const {shippingInfo,orderItems,paymentInfo,itemPrice,taxPrice,shippingPrice,totalPrice} =  req.body;

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id
    })
    res.status(201).json({
        success:true,
        order
    })
})

export const getSingleOrder = handleAsyncError (async(req,res,next)=>{
    const {id} = req.params
    const order = await Order.findById(id).populate("user","name email")
    if(!order){
        return next(new HandleError("Order not found",404))
    }
    res.status(200).json({
        success:true,
        order
    })
})

export const allMyOrders = handleAsyncError(async(req,res,next)=>{
    
    const orders = await Order.find({user:req.user._id})
    if(!orders){
        return next(new HandleError("Order not found",404))
    }

    res.status(200).json({
        success:true,
        orders
    })
})

export const getAllOrders = handleAsyncError(async(req,res,next)=>{
    const orders = await Order.find()
     if(!orders){
        return next(new HandleError("Order not found",404))
    }
    let sum = 0;
    orders.map(orders=>{
        sum += orders.totalPrice
    })
    res.status(200).json({
        success:true,
        orders,
        totalAmount : sum
    })
})

export const updateOrderStatus = handleAsyncError(async(req,res,next)=>{
   const order =  await Order.findById(req.params.id)
   if(!order){
    return next(new HandleError("Order not found",404))
   }
   if(order.orderStatus == "Delivered"){
    return next(new HandleError("This order has already been delivered",404))
   }
   await Promise.all(order.orderItems.map(items => updateQuantity(items.product,items.quantity )
   ))
   order.orderStatus = req.body.orderStatus
   if(order.orderStatus == "Delivered"){
      order.deliveredAt = Date.now()
   }

   order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,
        order
    })
})

async function updateQuantity(id,quantity) {
    const product = await Product.findById(id)
    if(!product){
        return next(new HandleError("Product not found",404))
    }
    product.stock -= quantity
    await product.save({validateBeforeSave:false})
}

export const deleteOrder =handleAsyncError(async(req,res,next)=>{
    const order = await Order.findById(req.params.id)
    if(!order){
    return next(new HandleError("Order not found",404))
   }
   if(order.orderStatus !== "Delivered"){
    return next(new HandleError("Order is under processing and cannot be deleted ",404))

   }
   await Order.deleteOne({_id:req.params.id})
   res.status(200).json({
    success:true,
    message:"Order deleted successfully",
    order
   })
})