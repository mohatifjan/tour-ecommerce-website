
process.on('uncaughtException',err=>{
  console.log(err.name,err.message)
  console.log('uncaughtException. shutdown....')
  // server.close(()=>{
    process.exit(1)
  // })
})

const mongoose = require('mongoose')
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.DATABASE_LOCAL
mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false
}).then(con=>console.log("DB connection successfull"));

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});


// promise rejection like database wrong password or name etc
process.on('unhandledRejection',err=>{
  console.log(err.name,err.message)
  console.log('unhandleRejection. shutdown....')
  // server.close(()=>{
    process.exit(1)
// )}
})


// console.log(x)