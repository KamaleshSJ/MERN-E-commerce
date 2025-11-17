import express from 'express' 
import Product from '../models/productModel.js'
import HandleError from "../utils/handleError.js";
import handleAsyncError from '../middleware/handleAsyncError.js';
import APIFunctionality from '../utils/apiFunctionality.js';




export const createProduct = handleAsyncError(async(req,res)=>{
    req.body.user = req.user.id;
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
       return  next(new HandleError('Product not found',404))
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

export const getAdminProducts = handleAsyncError(async (req,res,next)=>{
    const products = await Product.find()
    res.status(200).json({
        success:true,
        products
    })
})

export const createReviewForProduct  = handleAsyncError(async(req,res,next)=>{
    const {rating,comment,productId} = req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating:Number(rating),
        comment
    }
    const product =await Product.findById(productId)
    const reviewExists = product.reviews.find(
        review=>review.user.toString() === req.user._id.toString())

        if (reviewExists) {
            product.reviews.forEach(review=>{
                if(review.user.toString() === req.user._id.toString()){
                    review.rating = review,
                    review.comment = comment
                }
            })
        } else {
            product.reviews.push(review)
            product.noOfReviews= product.reviews.length
        }
        let sum = 0;
        product.reviews.forEach(review=>{
            sum += review.rating
        })
        product.ratings =product.reviews.length>0 ? sum/product.reviews.length : 0
        await product.save({validateBeforeSave:false})
   

    res.status(200).json({
        success:true,
        message:"review done successfully",
        product
        
    })
})

export const getProductReviews = handleAsyncError(async(req,res,next)=>{
    const product = await Product.findById(req.query.id);
    if(!product){
        return next(new HandleError("Product not found",400))
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})

export const deleteProductReview = handleAsyncError(async (req, res, next) => {
  const { productId, reviewId } = req.query;

  const product = await Product.findById(productId);
  if (!product) {
    return next(new HandleError("Product not found", 400));
  }

  // Filter out the review to delete
  const filteredReviews = product.reviews.filter(
    (review) => review._id.toString() !== reviewId.toString()
  );

  // Optional: handle “review not found”
  if (filteredReviews.length === product.reviews.length) {
    return next(new HandleError("Review not found", 400));
  }

  // Recalculate rating
  const noOfReviews = filteredReviews.length;
  const sum = filteredReviews.reduce((acc, review) => acc + review.rating, 0);
  const ratings = noOfReviews > 0 ? sum / noOfReviews : 0;

  // Update and get the updated product back
  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      reviews: filteredReviews,
      ratings,
      noOfReviews,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Review Deleted Successfully",
    product: updatedProduct,
  });
});


