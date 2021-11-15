const AppError = require('./../utils/appError')

const handleCastErrorDB = err=>{
const message = `Invalid ${err.path}: ${err.value}.`;
return new AppError(message,400)
}
const handleDuplicateFieldsDB = err =>{
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate Fields Values: ${value}. Please use another value!`;
  return new AppError(message,400)
}
const handleValidationErrorDB = err=>{
  const errors = Object.values(err.errors).map(el => el.message)
  const message =`Invalid Input data! ${errors.join(". ")}`;
  return new AppError(message,400)
}


const handleJWTError = () => new AppError('Invalid token! Please log in again.',401)
const handleJWTExpiredError = ()=> new AppError('Your token has expired! please log in again.',401)

const sendErrorDev= (err,req,res)=>{
  //A) Api
  if(req.originalUrl.startsWith('/api')){

   return res.status(err.statusCode).json({
      status: err.status,
      error:err,
      message: err.message,
      stack:err.stack
    })
  }// B) render website
  console.log('Error',err)
  return  res.status(err.statusCode).render('error',{
      title:'Something went wrong!',
      msg:err.message
    })
  }


const sendErrorProd= (err,req,res)=>{
 // A) Api
  if(req.originalUrl.startsWith('/api')){
    if(err.isOperational){
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    // B) Programming or other unknown error: don't leak error details
    console.log('Error',err)
      // logged to the console
      // console.log('Error',err)
      // send generic message
      return res.status(500).json({
        status:'fail',
        message:'Something went very wrong'
      })
  }
    // b) render website
    if(err.isOperational){
     return res.status(err.statusCode).render('error',{
        title:'Something went wrong!',
        msg:err.message
      })
    }
    // Programming or other unknown error: don't leak error details
    
      // logged to the console
      console.log('Error',err)
      // send generic message
      return res.status(err.statusCode).render('error',{
        title:'Something went wrong!',
        msg:'Please try again later.'
      })
    
  
  
}

module.exports = (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

if(process.env.NODE_ENV ==='development'){
  sendErrorDev(err,req,res);
}else if(process.env.NODE_ENV==='production'){
  let error = {...err}
  error.message = err.message;
  if(err.name === 'CastError') error = handleCastErrorDB(err)
  if(err.code ===11000) error = handleDuplicateFieldsDB(err)
  if(err.name ==='ValidationError') error = handleValidationErrorDB(err)
  if(err.name ==='JsonWebTokenError') error = handleJWTError(err)
  if(err.name ==='TokenExpiredError') error = handleJWTExpiredError(err)
  sendErrorProd(error,req,res);
}
    
}