module.exports = fn => {
    return (req,res,next)=>{
  
      fn(req,res,next).catch(next); // next or err => next(err) same in .catch()
    }
  }