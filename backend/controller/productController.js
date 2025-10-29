import express from 'express' 
import Product from '../models/productModel.js'
import HandleError from "../utils/handleError.js";
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';




export const createProduct = handleAsyncError(async(req,res)=>{
    const product = await Product.create (req.body)
    res.status(201).json({
        success:true,
        product
    })
})

export const getAllproducts =handleAsyncError( async(req,res,next)=>{
    const resultPerPage = 3
    const apiFeatures = new APIFunctionality(Product.find(),req.query)
    .search().filter()
    const filteredQuery = apiFeatures.query.clone();
    const productCount = await filteredQuery.countDocuments();

    const totalPages = Math.ceil(productCount/resultPerPage)
    const page = Number(req.query.page) || 1;

    if(page>totalPages && productCount>0){
        return next(new HandleError("This Page Doen't Exist",404))
    }

    apiFeatures.pagination(resultPerPage);
    

    let products = await apiFeatures.query
    if(!products || products.length === 0){
        return  next(new HandleError('Product not found',500))
    }
    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        totalPages,
        currentPage : page
    })
})

export const getSingleproduct =handleAsyncError( async(req,res,next)=>{
     const product = await Product.findById(req.params.id)
     if(!product){
       return  next(new HandleError('Product not found',500))
    }
    res.status(200).json({
            success:true,
            product
        })
})

export const updateProduct =handleAsyncError( async (req,res,next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
      return  next(new HandleError('Product not found',500))
        }
    
   product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true,runValidators:true})
    res.status(200).json({
            success:false,
            product
        })

    })

export const deleteProduct = handleAsyncError( async (req,res,next)=>{
    let product = await Product.findById(req.params.id)
    if(!product){
       return  next(new HandleError('Product not found',500))
    }
    product= await Product.findByIdAndDelete(req.params.id)
    res.status(200).json({
        success:true,
        message:'Product deleted successfully'
    })
})

   



