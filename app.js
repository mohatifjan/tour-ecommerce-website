const express = require('express');
const path= require('path')
const morgan = require('morgan');
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorControlller')
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const rateLimit =require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean')
const hpp = require('hpp') // http params pollutions
const cookieParser = require('cookie-parser')
const app = express();

// Start express app
// views
app.set('view engine','pug')
// set views path
// app.set('views','./views')
app.set('views',path.join(__dirname , 'views') )

// 1) Global MIDDLEWARES
// serving for static files
// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname,'/public')));
// Set Security http headers
app.use(helmet())

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit request from same api
const limiter = rateLimit({
  max:100, // changeable
  windowMs:60*60*1000,
  message:'Too many requests from this IP, please try again in an hour!'
})
app.use('/api',limiter)// all routes start with this /api

// Body parser, reading data from the body into req.body
// app.use(express.json());
app.use(express.json({limit:'10kb'})); // if body larger then 10 kb it will not accept
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieParser())

// Data sanitization against NOSql query injection
app.use(mongoSanitize());
// Data Sanitization against XSS
app.use(xss())
// prevent parameter pollutions
app.use(hpp({
  whitelist:['duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price'] // allow to duplicate
}))
// Serving Static files


// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  
  next();
});

// 3) ROUTES
app.use('/',viewRouter)

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// route that are misspelled or undefined routes
// this middleware will be after all routes mean at end
app.all('*', (req,res,next)=> { // all is for all http methods get patch post delete  
  next(new AppError(`Can't find ${req.originalUrl} on this server!`,404)) // argument of err is to skip all middleware and jump to the global error handling 
})

// error handling middleware
app.use(globalErrorHandler)

module.exports = app;
