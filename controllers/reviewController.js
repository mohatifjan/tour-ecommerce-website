const Review = require('./../models/reviewModel')
const catchAsync = require('./../utils/catchAsync')
const factory = require('./handlerFactory')

// exports.getAllReviews = catchAsync(async (req,res,next)=>{
//     // // get all reviews on tour
//     // let filter ={};
//     // if(req.params.tourId) filter = {tour: req.params.tourId};
//     // console.log(tour)

//     const reviews = await Review.find(filter)

//     res.status(200).json({
//         status:'success',
//         results: reviews.length,
//         data:{
//             reviews
//         }
//     })
// })

exports.setTourUserIds = (req,res,next)=>{
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id; // this user is come from protect controller/ middleware
    next()
}

// exports.createReviews = catchAsync(async (req,res,next)=>{
//     // Allow nested routes
//     // if(!req.body.tour) req.body.tour = req.params.tourId;
//     // if(!req.body.user) req.body.user = req.user.id; // this user is come from protect controller/ middleware

//     const createReview = await Review.create(req.body)
//     res.status(201).json({
//         status:'success',
//         data:{
//             review:createReview
//         }
//     })
// })
exports.getAllReviews= factory.getAll(Review)
exports.getReview = factory.getOne(Review)
exports.deleteReview = factory.deleteOne(Review); // passing the Model
exports.updateReview = factory.updateOne(Review);
exports.createReviews = factory.createOne(Review)