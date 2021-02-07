import nodemailer from 'nodemailer';

// async..await is not allowed in global scope, must use a wrapper
export async function sendEmail(to: string, html: string) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    // 1 раз сгенерировал и забрал логин пароль, проблема в том что он протухает, так что если не работает создаю новый
    // и подставляю в креды ниже
    // let testAccount = await nodemailer.createTestAccount();
    // console.log('testAccount ', testAccount);

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        // auth: {
        //     user: testAccount.user, // generated ethereal user
        //     pass: testAccount.pass, // generated ethereal password
        // },
        // чтобы каждый раз не создавать логин пароль исползьзую эти, которые взял 1 раз после создания юзера
        auth: {
            user: 'ldy7noiubsp6wuc6@ethereal.email', // generated ethereal user
            pass: 'R1nKw9yVKRJrbypZ8v', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'Max fullstack <maximprosv@fullstack.com>', // sender address
        to, // list of receivers
        subject: 'Change password', // Subject line
        // text, // plain text body
        html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    // Preview only available when sending through an Ethereal account
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
