const Tour = require('../models/tourModel')

const Booking = require('../models/bookingModel')
const AppError = require('../utils/appError')

const catchAsync = require('../utils/catchAsync')

exports.getOverview =catchAsync(async (req,res,next)=>{
    // 1) Get tour data from collection
    const tours = await Tour.find()
    // 2) Build template

    // 3) Render that template using tour data from 1)
    res.status(200).render("overview",{
      title:'All Tours',
      tours
    })
  })

  exports.getTour =catchAsync(async (req,res,next)=>{
    //   1) Get the data, for the requested tour {including reviews and guides}
    const tour = await Tour.findOne({slug: req.params.slug})
    .populate({
        path: 'reviews',
        fields: 'rating review user'
    });

    if(!tour){
      return next(new AppError('There is no tour with that name',404))
    }
    // 3) Render template using from 1)
    // .set(
      //   'Content-Security-Policy',
      //   "default-src 'self' https://*.mapbox.com ;base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src https://cdnjs.cloudflare.com https://api.mapbox.com 'self' blob: ;script-src-attr 'none';style-src 'self' https: 'unsafe-inline';upgrade-insecure-requests;"
      // )
      res.status(200)
    .render('tour', {
      title: `${tour.name} Tour`,
      tour
    });
});

exports.getLoginForm =  (req,res)=>{

  res.status(200)
  .render('login',{
    title:'Log in to your account'
  })
}
exports.getMyTours =catchAsync( async (req,res,next)=>{
  // 1) Find all Booking
  // also work with populate method
  // but here lets do manually
   const booking = await Booking.find({user: req.user.id})
  // 2) Find Tours with return IDs
  const tourIDs = booking.map(el => el.tour)  // array of tours id
  const tours = await Tour.find({_id:{$in:tourIDs}})
  res.status(200).render('overview',{
    title:'My Tours',
    tours
  })
 }
 )

exports.getAccount = (req,res) =>{
  res.status(200).render('account',{
    title:'account'
  })
}
/*
//if not uses of API
exports.updateUserData =catchAsync(async (req,res,next)=>{
  const UpdatedUser = await User.findByIdAndUpdate(req.user.id,{
    name:req.body.name,
    email:req.body.email
  },{
    new:true,
    runValidators:true
  })
  res.status(200).render('account',{
    title:'Your account',
    user:UpdatedUser
  })
}) 
*/