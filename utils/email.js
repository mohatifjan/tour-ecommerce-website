const nodemailer = require('nodemailer');
const pug = require('pug');
const htmLToText = require('html-to-text')



module.exports = class Email{
  constructor(user,url){
    this.to = user.email
    this.firstName = user.name.split(' ')[0]
    this.url = url
    this.from = `Atif Aryan Khan<${process.env.EMAIL_FROM}>`
  }

  newTransport(){
    
  if(process.env.NODE_ENV === 'production'){
    // sendGrid
    return nodemailer.createTransport({
      host:process.env.SENDINBLUE_HOST,
      port:process.env.SENDINBLUE_PORT,
      auth:{
        user: process.env.SENDINBLUE_NAME,
        pass: process.env.SENDINBLUE_PASSWORD
      }
    })
  }
 return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD
    }
    
})
  }
  // send actual emails
 async send(template, subject){
   // 1) render html based on pug template
   const html= pug.renderFile(`${__dirname}/../views/emails/${template}.pug`,{
     firstName:this.firstName,
     url:this.url,
     subject
   })
   // 2) Define Email options
   const mailOptions={
    from: this.from,
    to: this.to,
    subject,
    html,
    text: htmLToText.fromString(html)
}
  // 3) Create a transporter and send Email
  await this.newTransport().sendMail(mailOptions)

 }
 async sendWelcome(){
  await this.send('welcome',' Welcome to the Natours Family')
 }

 async sendPasswordRest(){
  await this.send('passwordRest','Your password rest token (valid for ten minutes!')
 }
}


