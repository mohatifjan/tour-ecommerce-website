class AppError extends Error{ //built in error class
    constructor(message,statusCode){
        super(message); // built in Error class just accepts message
        
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail': 'error'
        this.isOperational = true;

        Error.captureStackTrace(this,this.constructor)
    }
}
module.exports = AppError;