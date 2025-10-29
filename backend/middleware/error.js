import HandleError from "../utils/handleError.js";


export default (err,req,res,next)=>{
    err.statuscode = err.statuscode || 500;
    err.message  = err.message || 'Internal server error';
    // cast error
    if(err.name === 'CastError'){
        const message = `this is invalid resource ${err.path}`
        err = new HandleError(message , 404)
    }
    
    if(err.code===11000){
        const message = `This ${Object.keys(err.keyValue)} already registered ,Please login again`
        err = new HandleError(message , 400)

    }

    res.status(err.statuscode).json({
        success : false,
        message : err.message
    })
}