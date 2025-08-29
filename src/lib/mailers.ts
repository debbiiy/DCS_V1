import nodemailer from 'nodemailer'

export const sendEmail = async (to: string, subject: string, html: string) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_SENDER,
      pass: process.env.EMAIL_PASSWORD,
    },
  })
  console.log('📤 Sending email to:', to)
  console.log('📤 Subject:', subject)
  console.log('📤 Body:', html)

  const mailOptions = {
    from: `"Document System" <${process.env.EMAIL_SENDER}>`,
    to,
    subject,
    html,
  }

  return transporter.sendMail(mailOptions)
}
