import nodemailer from "nodemailer"

export const sendEmail = async(options)=>{
    const transporter = nodemailer.createTransport({
        service: process.env.SMTP_SERVICE,
        auth:{
            user:process.env.SMTP_MAIL,
            pass:process.env.SMTP_PASSWORD
        }
    })
    const mailoptions = {
        from:"",
        to:options.email,
        subject : options.subject,
        text: options.message
    }
    await transporter.sendMail(mailoptions)
}