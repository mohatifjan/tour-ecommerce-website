 const Tour = require('./../models/tourModel')
 const multer =require('multer');
const sharp = require('sharp')
// const APIFeatures = require('./../utils/apiFeatures')
const catchAsync = require('./../utils/catchAsync')
const AppError = require('./../utils/appError')
const factory = require('./handlerFactory')

///////////////////////////////////////////////////////////
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
})

exports.uploadTourImage = upload.fields([{
  name:'imageCover',maxCount:1},
 { name:'images',maxCount:3}
])
// upload.single(image)
// upload.array(images,5) 


exports.resizeTourImage =catchAsync( async (req,res,next)=>{

  if(!req.files.imageCover || !req.files.images) return next()

  // 1) ImageCover
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
  await sharp(req.files.imageCover[0].buffer).resize(2000,1333).toFormat('jpeg').jpeg({quality:90}).toFile(`public/img/tours/${req.body.imageCover}`)
  // 2) Images
  req.body.images =[];
  await Promise.all(req.files.images.map(async (file,i)=>{
    const filename = `tour-${req.params.id}-${Date.now()}-image-${i+1}.jpeg`
    await sharp(file.buffer).resize(2000,1333).toFormat('jpeg').jpeg({ quality: 50}).toFile(`public/img/tours/${filename}`)
    req.body.images.push(filename)
  }));
  next()
})
////////////////////////////////////////////////////////////


exports.aliasTopTours =(req,res,next)=>{
  req.query.limit ='5';
  req.query.sort='-ratingsAverage,price';
  req.query.fields ='name,difficulty,ratingsAverage,price,summary';
  next();
}
exports.getAllTours = factory.getAll(Tour)
// exports.getAllTours = catchAsync( async (req, res,next) => {
//    // Execute the query
//    const features = new APIFeatures(Tour.find(), req.query)
//    .filter()
//    .sort()
//    .limitFields()
//    .paginate();
   
//    const tours = await features.query;
//    // 3) Send Response
//     res.status(200).json({
//       status: 'success',
//       requestedAt: req.requestTime,
//       results: tours.length,
//       data: {
//         tours
//       }
//     });
    
// });
exports.getTour =factory.getOne(Tour,{path:'reviews'})
// exports.getTour =catchAsync( async (req, res,next) => {
//   // const tour = await Tour.findById(req.params.id).populate('guides') // to fill the fields of guides by embedding data form user collection or document
//   const tour = await Tour.findById(req.params.id).populate('reviews')
//   // .populate({
//   //   path:'guides',
//   //   select:'-__v -passwordChangedAt'
//   // })
//   if(!tour){
//     return next(new AppError('No tour found with that Id:', 404))
//   }
//     // const tour = tours.find(el => el.id === id);
  
//     res.status(200).json({
//       status: 'success',
//       data: {
//         tour
//       }
//     });
    
// });
exports.createTour = factory.createOne(Tour)
// exports.createTour =catchAsync( async (req, res, next) => {
//   // const newTour = new Tour({})
//   // newTour.save()
//   const newTour = await Tour.create(req.body)
//   // console.log(req.body);
//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour
//     }
//   });
  
// });
exports.updateTour = factory.updateOne(Tour)
// exports.updateTour =catchAsync( async (req, res,next) => {
//   const tour = await Tour.findByIdAndUpdate(req.params.id, req.body,{
//     new : true,
//     runValidators: true
//   })
//   if(!tour){
//     return next(new AppError('No tour found with that Id:', 404))
//   }
//   res.status(200).json({
//     status: 'success',
//     data: {
//       tour
//     }
//   });

// });
exports.deleteTour =factory.deleteOne(Tour);
// exports.deleteTour =catchAsync( async (req, res,next) => {
//  const tour= await Tour.findByIdAndDelete(req.params.id)
//   if(!tour){
//     return next(new AppError('No tour found with that Id:', 404))
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null
//   });

// });


exports.getTourStats=catchAsync( async (req,res,next)=>{
   // Aggregation pipeline
   const stats =await Tour.aggregate([
    {
    $match:{ ratingsAverage: {$gte: 4.5}}
   },
  {
    $group:{
      // _id:null,
      // _id:'$difficulty',
      _id:{$toUpper:'$difficulty'},
      numTours:{$sum:1},
      numRatings:{$sum:'$ratingsQuantity'},
      avgRating:{$avg:'$ratingsAverage'},
      avgPrice:{$avg:'$price'},
      minPrice:{$min:'$price'},
      maxPrice:{$max:'$price'}
    }
},
{
  $sort:{avgPrice:-1}
},
// {
  // $match:{_id:{$ne:'EASY'}}
// }
]);
  res.status(200).json({
    status:'success',
    data:{stats}
  })
  
});

exports.getMonthlyPlan =catchAsync( async (req,res,next)=>{
  const year = req.params.year *1;
    const plan = await Tour.aggregate([
      {
        $unwind:'$startDates'
      },
      {
        $match:{
          startDates:{
            $gte:new Date(`${year}-01-01`),
            $lte:new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group:{
          _id:{$month:'$startDates'},
          numTourStarts:{$sum:1},
          tours:{$push:'$name'}
        }
      },
      {
        $addFields:{month:'$_id'}
      },
      {
        $project:{
          _id:0
        }
      },
      {
        $sort:{numTourStarts:1}
      }
      // ,{
      //   $limit:6
      // }
    ]);
    res.status(200).json({
      status:'success',
      data:{plan}
    })
    
});

exports.getToursWithin =catchAsync(async (req,res,next)=>{
  // /tours-within/:distance/center/:latlng/unit/:unit
  // /tours-distance/233/center/-40,45/unit/mi
  const {distance,latlng,unit}= req.params;
  const [lat,lng]= latlng.split(','); //split will generate array

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude in the format of lat,lng',400))
  }
  // console.log(distance, lat,lng , unit)
const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // radius of the earth in mile 3963 and radius of the earth in kilometer 6378.1
  const tours = await Tour.find({
    startLocation:{$geoWithin:{$centerSphere:[[lng,lat],radius]}} // here distance not because it should be in radians
  })
  res.status(200).json({
    status: "success",
    results: tours.length,
    data:{
      data:tours
    }
  })
}) 

exports.getDistances = catchAsync(async (req,res,next)=>{
  const {latlng,unit}= req.params;
  const [lat,lng]= latlng.split(','); //split will generate array

  if(!lat || !lng){
    next(new AppError('Please provide latitude and longitude in the format of lat,lng',400))
  }
const multiplier = unit ==='mi'? 0.000621371 :0.001;  // 1 meter= 0.0006..mile and 1 meter if kilo then it will be 1000

  const distances = await Tour.aggregate([
    {
       $geoNear:{  // this required one field should be index or if multiple indexes then we use key and values to define and calc
        near:{
          type: 'Point',
          coordinates:[lng*1,lat*1]      // calc distance will be stored in this field
        },
          distanceField:'distance',
          distanceMultiplier: multiplier // to kilometer like divide by 1000
        }                
  },
  {
    $project :{
    distance:1,
    name:1
  }
}

])
res.status(200).json({
  status: "success",
  
  data:{
    data:distances
  }
})
})