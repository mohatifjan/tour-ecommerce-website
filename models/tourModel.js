const mongoose = require('mongoose')
const slugify = require('slugify')
// const User = require('./userModel')
const tourSchema = new mongoose.Schema({
    name:{
        type: String,
        reqiured: [true,"A tour must have a name"],
        unique: true,
        trim: true,
        // validate:[validator.isAlpha, 'A tour name must contains characters only'],
        maxLength: [40,'A tour must have less or equal then 40 characters!'], // validators
        minLength: [10,'A tour must have greater or equal then 10 characters!']
    },
    slug:String,
    duration:{
        type: Number,
        required:[true,'A tour must have a duration']
    },
    maxGroupSize:{
        type: Number,
        required: [true,'A tour must have a group size']
    },
    difficulty:{
        type: String,
        required:[true,'A tour must have a difficulty'],
        enum:{
            values:['easy','medium','difficult'],
            message:'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage:{
        type: Number,
      default: 4.5,
      min:[1,'A rating must be above 1.0'],
      max:[5,'A rating must be below 5.0'],
      set:val=> Math.round(val *10)/10  // 4.66666 , 46.66666 ,47,4.7
    },
    ratingsQuantity:{
        type: Number,
        default: 0
    },
      price:{
        type: Number,
        required: [true,'A tour must have a price']
      },
      priceDiscount: {
          type:Number,
           validate:{
               validator:function(val){ // val is input by user and the this.price is from document
                return val <this.price;
            },
            message:'Discount Price ({VALUE}) should be below then regular Price!'
           }
        },
      summary:{
          type: String,
          trim: true,
          required: [true,'A tour must have a summary']
      },
      description:{
          type: String,
          trim: true
      },
      imageCover:{
          type: String,
          required: [true,'A tour must have a cover image']
      },
      images: [String],
      createdAt:{
          type: Date,
          default: Date.now(),
          select: false
      },
      startDates:[Date],
      secretTour:{
          type:Boolean,
          default:false
      },
      // location embedded into tour model os this is an object 
      startLocation:{ // these brackets are not for schema type options this time but an embedded object
          // GeoJSON is Geospatial data 
          type:{// sub fields are represents the schema type options here like upper
            type:String,
            default: 'Point', // there are multi like polygon lines etc but start location should be point
            enum:['Point']  // it means it should be point like in a case of difficulty easy , medium, difficult 
          },
          coordinates:[Number], // latitude and longitude
          address: String,
          description:String
      },
      locations:[ // this is an embedded document and it should be an array "this will create new document inside parent document"
        {type:{// sub fields are represents the schema type options here like upper
            type:String,
            default: 'Point', // there are multi like polygon lines etc but start location should be point
            enum:['Point']  // it means it should be point like in a case of difficulty easy , medium, difficult 
          },
          coordinates:[Number], // latitude and longitude
          address: String,
          description:String,
          day:Number}
      ],
      guides:[// child referencing
          {
              type:mongoose.Schema.ObjectId,
              ref:'User' // don't need to import the User
          }
      ]
},{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
});
///// VIRTUAL POPULATE
tourSchema.virtual('reviews',{ // reviews name will be a virtual document
    ref:'Review',        // dataset
    foreignField:'tour', // this
    localField:'_id'       // and this required to connect datasets
})
tourSchema.virtual('durationWeeks').get(function(){ // these are not stored in database
    return this.duration /7;
})

// DOCUMENT MIDDLEWARE: it runs before .save() or .create() except insertMany
tourSchema.index({price:1,ratingsAverage:-1}) // compound index 
tourSchema.index({slug:1})  // 1 is for asc and -1 if for desc

tourSchema.index({startLocation:'2dsphere'}) // real point on earth
//// pre save hook or pre save middleware
tourSchema.pre('save', function(next){
this.slug = slugify(this.name,{lower:true});
next();
} );
// tourSchema.post('save',function(doc,next){ // doc because it just stored to the database
// console.log(doc);
// next()
// })

// QUERY MIDDLEWARE 
// tourSchema.pre('find',function(next){
    tourSchema.pre(/^find/,function(next){
this.find({secretTour:{$ne:true}})
    next();
})

// AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secretTour:{$ne:true}}}) // unshift because pipeline is an array look in tourSchema in aggregation
//     next();
// })
tourSchema.pre(/^find/, function(next){
    this.populate({
        path:'guides',
        select:'-__v -passwordChangedAt'
      })
      next()
})
// // embedding for creating new documents
// tourSchema.pre('save', async function(next){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises)
//     next()
// })
const Tour = mongoose.model('Tour',tourSchema);
module.exports = Tour;