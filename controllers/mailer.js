const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true pour le port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "🔑 Réinitialisation de mot de passe QRmyfile",
      html: `
        <h1>Vous avez oublié votre mot de passe ?</h1>
        <p> Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <p><a href="${link}" style="color: #0070f3;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien est valable pendant 1h ⏳</p>
        <p>À tout de suite sur <strong>QRmyfile</strong></p>
      `
    },
    en: {
      subject: "🔑 Reset your password",
      html: `
        <h1> Forgot your password?</h1>
        <p>Click the link below to set a new password:</p>
        <p><a href="${link}" style="color: #0070f3;">Reset my password</a></p>
        <p>This link is valid for 1 hour ⏳</p>
        <p>See you soon on <strong>QRmyfile</strong> 🏃‍♀️💨</p>
      `
    }
  };

  
  const content = translations[locale] || translations.fr;

 await sendMail({
    from: `"QRmyfile" <no_reply@QRmyfile.com>`,
    to,
    subject: content.subject,
    html: content.html,
  });

}


async function sendConfirmationEmail(to, link, locale = "fr") {
  const translations = {
    fr: {
      subject: "Bienvenue sur QRmyfile – Activez votre compte !",
      html: `
        <h1> Bonjour et bienvenue sur QRmyfile !</h1>
        <p>Pour finaliser votre inscription, cliquez sur le lien ci-dessous :</p>
        <p><a href="${link}" style="color: #0070f3;">Activer mon compte</a></p>
        <p>⏳ Ce lien expire dans 24h.</p>
        <p>À très vite sur <strong>QRmyfile</strong></p>
      `,
    },
    en: {
      subject: "Welcome to QRmyfile – Activate your account!",
      html: `
        <h1>Hello, welcome to QRmyfile!</h1>
        <p>To complete your registration, just click the link below:</p>
        <p><a href="${link}" style="color: #0070f3;">Activate my account</a></p>
        <p>⏳ This link expires in 24 hours.</p>
        <p>Catch you soon on <strong>QRmyfile</strong> </p>
      `,
    },
    
  };

  const content = translations[locale] || translations.fr;

 sendMail({
       from: `"QRmyfile" <no_reply@QRmyfile.com>`,
    to,
    subject: content.subject,
    html: content.html,
  });

}

sendMail= async ({from,to,subject,html})=>{
  if(process.env.NODE_ENV ==="development"){
    console.log(" === EMAIL SIMULE ===");
    console.log("From:", from)
    console.log("To:",to);
    console.log("Subject:", subject);
    console.log("Html:", html);
    return ;
  }

  const info = await transporter.sendMail({
    from: from,
    to: to,
    subject,
    html,
  });
  console.log("📨 Mail envoyé :", info.messageId);
}




module.exports = { sendConfirmationEmail, sendResetPasswordMail };
