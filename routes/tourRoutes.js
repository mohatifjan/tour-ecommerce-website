const express = require('express');
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./reviewRoutes')
const router = express.Router();


// // NESTED ROUTES
  // // POST /:tourId/2541fr7/reviews
  // // Get /:tourId/2541fr7/reviews
  // // Get /:tourId/2541fr7/reviews/45651fg45
  // router
  // .route('/:tourId/reviews')
  // .post(authController.protect, authController.restrictTo('user'), reviewController.createReviews)
  // MergerParams 
router.use('/:tourId/reviews', reviewRouter)

router
.route('/tour-stats')
.get(tourController.getTourStats);
router
.route('/montly-plan/:year')
.get(authController.protect,authController.restrictTo('admin','lead-guide','guide'),tourController.getMonthlyPlan);
router
.route('/top-5-cheap')
.get(tourController.aliasTopTours,tourController.getAllTours);

router.
route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.
route('/distances/:latlng/unit/:unit').get(tourController.getDistances)
// or this /tours-distance?distance=233&center=-40,45&unit=mi  query string
// route /tours-distance/233/center/-40,45/unit/mi



router
  .route('/')
  .get( tourController.getAllTours)
  .post(authController.protect,authController.restrictTo('admin','lead-guide'), tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,authController.restrictTo('admin','lead-guide'),tourController.uploadTourImage,tourController.resizeTourImage,tourController.updateTour)
  .delete(authController.protect, authController.restrictTo('admin','lead-guide'), tourController.deleteTour);


  

module.exports = router;
