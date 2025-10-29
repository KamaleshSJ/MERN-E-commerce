import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'Please Enter Product Name'],
        trim:true
    },
    description :{
        type : String,
        required:[true,'Please Enter Product Description'],
    },
    price : {
        type: Number,
        required:[true,'Please Enter Product Price'],
        maxlength : [7,'Price cannot exceeds 7 digits']
    },
    ratings : {
        type:Number ,
        default:0
    },
    image :[
        {
            public_id:{
                type:String , 
                required :true
            },
            url:{
                type:String , 
                required :true
            }
        }
    ],
    category:{
         type : String,
        required:[true,'Please Enter Product Category'],
    },
    stock:{
        type: String,
        required:[true,'Please Enter Product Stock'],
        maxlength : [5,'Product Stock cannot exceeds 5 digits'],
        default:1
    },
    noOfReviews :{
        type:Number ,
        default:1
    },
    reviews :[
        {
            name:{
                type: String,
                required :true
            },
            rating:{
                type:Number ,
                required :true
            },
            comment:{
                type: String,
                required :true
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})

export default mongoose.model('Product',productSchema);