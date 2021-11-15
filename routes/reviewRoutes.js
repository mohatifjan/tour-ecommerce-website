const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')
const router = express.Router({mergeParams:true})

// // POST /:tourId/2541fr7/reviews      with mergeParams the '/' this will becomes this route and we will access to tourId by merge params
// // POST /reviews
router.use(authController.protect)
router
.route('/')
// .post(authController.protect,authController.restrictTo('user'),reviewController.createReviews)
.post(authController.restrictTo('user'),reviewController.setTourUserIds,reviewController.createReviews)

router
.route('/')
.get( reviewController.getAllReviews)

router
.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('admin','user'),reviewController.updateReview)
.delete(authController.restrictTo('admin','user'),reviewController.deleteReview)
// authController.protect,authController.restrictTo('user'),

module.exports = router;