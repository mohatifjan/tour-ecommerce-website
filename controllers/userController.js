const User = require('./../models/userModel')
const multer =require('multer');
const sharp = require('sharp')
const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')
/////////////////////////////////////////////////////



// Multer

// multer is used to handle  multi form data which is a form in coding thats uses to upload a file from a form
/* STORES IN FILE
const multerStorage = multer.diskStorage(
  {
    destination: (req,file,cb)=>{ // cb is like next in express cb known as call back function
      cb(null, 'public/img/users')
    },
    filename: (req,file,cb)=>{
      const ext = file.mimetype.split('/')[1] // this mimetype is come from by console.log(file) = images/jpeg
      cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
    }
  }
); */
// STORES IN BUFFER (MEMORY)
const multerStorage = multer.memoryStorage()
/////////////////////////////////////
const multerFilter =(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError('Not an image! please upload images only.',400),false)
  }
}

const upload = multer({ 
storage:multerStorage,
fileFilter: multerFilter
})  // dest means destination
exports.uploadUserPhoto = upload.single('photo');
// images customization
exports.resizeUserPhoto =catchAsync(async (req, res, next)=>{
  if(!req.file) return next()

  
  req.file.filename =`user-${req.user.id}-${Date.now()}.jpeg`; // because in buffer the filename was empty and it actually need it in filteredBody middleware
  
 await sharp(req.file.buffer).resize(500,500).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/users/${req.file.filename}`)
  next()
}) 

///////////////////////////////////////////////
///////////////////////////////////////////////
const filterObj = (obj , ...allowedFields)=>{
  const newObj ={};
  Object.keys(obj).forEach(el =>{
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  })
  return newObj;
}


exports.getMe = (req,res,next) =>{
  req.params.id = req.user.id ;
  next();
}
// exports.getAllUsers = catchAsync( async (req, res,next) => {
   
    
//     const users = await User.find();
//     // 3) Send Response
//      res.status(200).json({
//        status: 'success',
//        requestedAt: req.requestTime,
//        results: users.length,
//        data: {
//          users
//        }
//      });
     
     
//  });
 
 exports.updateMe =catchAsync( async (req,res,next)=>{
  // 1) Create error if user posts password data
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('The route is not for password update! Please use /updateMyPassword',400))
  }
  // 2) Filtered out unwanted fields names that are not allowed to be updated
  // body.role : 'admin'
  const filteredBody = filterObj(req.body, 'name','email')
  if (req.file) filteredBody.photo = req.file.filename;
  // 3) Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody ,{new: true, runValidators: true}); // x because we did not want to update every thing thats why we did not use res like if some one change the role to admin then...
 
 
  res.status(200).json({
    status:'success ',
    data:{
      user:updatedUser
    }
  })
})


exports.deleteMe =catchAsync( async (req,res,next)=>{
  await User.findByIdAndUpdate(req.user.id, {active: false});
 
  res.status(204).json({
    status:'success ',
    data:null
  })
})
exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
// Do not change password with this update
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)

