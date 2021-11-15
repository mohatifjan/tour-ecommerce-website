const crypto = require('crypto')
const mongoose = require('mongoose');
const validator = require('validator')
const bcrypt = require('bcryptjs')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, 'Please tell us your name.']
    },
    email:{
        type: String,
        required:[true, 'Please tell us your email.'],
        unique: true,
        lowerCase: true,
        validate: [validator.isEmail,'Please Provide a valid email']
    },
    photo:{
        type: String,
        default:'default.jpg'
    },
    role:{
        type: String,
        enum:['user','guide','lead-guide','admin'],
        default:'user'
    },
    password:{
        type: String,
        required:[true, 'Please provide a password.'],
        minLength:8,
        select:false
    },
    passwordConfirm:{
        type: String,
        required:[true, 'Please confirm your password.'],
        validate:{
            validator: function(el){
                return el === this.password;
            },
            message:"Password are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
        type: Boolean,
        default: true,
        select:false
    }
    
})

userSchema.pre('save', async function(next){
if(!this.isModified('password')) return next()

this.password =await bcrypt.hash(this.password, 12);

this.passwordConfirm = undefined;
next()
})
userSchema.pre('save',function(next){
if(!this.isModified('password') || this.isNew) return next()

this.passwordChangedAt = Date.now() - 1000; // -1000 it because sometime jwt generate faster
next()
})

userSchema.pre(/^find/, function(next){
    // this points to the current document
    // this.find({active:false})
    this.find({active:{$ne:false}})
    next()
})


userSchema.methods.correctPassword= async function(candidatePassword,userPassword){ // here we use userPassword because the this.password is select false and in the authController we +password
    return await bcrypt.compare(candidatePassword,userPassword);
}

userSchema.methods.changedPasswordAfter = function(JWTTimestamp){
    if(this.passwordChangedAt){
        const changedTimestamp =  parseInt(this.passwordChangedAt.getTime() / 1000 ,10) // the last 10 is base 10 1000 is used to convert millisecond to second
        return JWTTimestamp < changedTimestamp;
     // 100<200 true it means changed //if 200<100 false it means changed
    }

    return false; // means that user did not change the password
}

userSchema.methods.createPasswordRestToken = function(){
    const resetToken = crypto.randomBytes(32).toString('hex');
   this.passwordResetToken= crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() +30 * 60 * 1000; // min*sec*millisecond
    return resetToken; // send in email to user it wi
}

const User = mongoose.model('User',userSchema);

module.exports = User;