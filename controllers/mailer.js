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
      subject: "🔑 Réinitialise ton mot de passe",
      html: `
        <h1>🙈 Petit trou de mémoire ?</h1>
        <p>Pas de panique ! Clique sur le lien ci-dessous pour choisir un nouveau mot de passe :</p>
        <p><a href="${link}" style="color: #0070f3;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien est valable pendant 1h ⏳</p>
        <p>À tout de suite sur <strong>JogForMe</strong> 🏃‍♂️💨</p>
      `
    },
    en: {
      subject: "🔑 Reset your password",
      html: `
        <h1>🙈 Forgot your password?</h1>
        <p>No worries! Click the link below to set a new password:</p>
        <p><a href="${link}" style="color: #0070f3;">Reset my password</a></p>
        <p>This link is valid for 1 hour ⏳</p>
        <p>See you soon on <strong>JogForMe</strong> 🏃‍♀️💨</p>
      `
    }
  };

  
  const content = translations[locale] || translations.fr;

 await sendMail({
    from: `"JogForMe" <no_reply@Jogforme.com>`,
    to,
    subject: content.subject,
    html: content.html,
  });

}


async function sendConfirmationEmail(to, link, locale = "fr") {
  const translations = {
    fr: {
      subject: "🚀 Bienvenue sur JogForMe – Active ton compte !",
      html: `
        <h1>🎉 Salut et bienvenue sur JogForMe !</h1>
        <p>Tu viens de rejoindre la communauté la plus déjantée de runners… ou de ceux qui préfèrent déléguer 😉</p>
        <p>Pour finaliser ton inscription, clique sur le lien ci-dessous :</p>
        <p><a href="${link}" style="color: #0070f3;">Activer mon compte</a></p>
        <p>⏳ Ce lien expire dans 24h, alors ne traîne pas trop !</p>
        <p>À très vite sur <strong>JogForMe</strong> 🏃‍♂️📱</p>
      `,
    },
    en: {
      subject: "🚀 Welcome to JogForMe – Activate your account!",
      html: `
        <h1>🎉 Hey there, welcome to JogForMe!</h1>
        <p>You just joined the craziest running crew – whether you're here to run or to relax 😉</p>
        <p>To complete your registration, just click the link below:</p>
        <p><a href="${link}" style="color: #0070f3;">Activate my account</a></p>
        <p>⏳ This link expires in 24 hours, so don’t wait too long!</p>
        <p>Catch you soon on <strong>JogForMe</strong> 🏃‍♀️📱</p>
      `,
    },
    
  };

  

  

  const content = translations[locale] || translations.fr;

 sendMail({
    from: `"JogForMe" <no_reply@Jogforme.com>`,
    to,
    subject: content.subject,
    html: content.html,
  });

}

const sendContactEmail = async ({ name, email, message }) => {
  const subject = `📬 Nouveau message de contact`;
  const html = `
    <h2>💌 Nouveau message reçu via le formulaire de contact</h2>
    <p><strong>Nom :</strong> ${name || "Non précisé"}</p>
    <p><strong>Email :</strong> ${email}</p>
    <p><strong>Message :</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
    <hr/>
    <p style="font-size: 0.9em; color: #888;">Ce message a été envoyé depuis le site JogForMe.</p>
  `;
   sendMail({
    from: `"JogForMe" <no_reply@jogforme.com>`,
    to: `contact@jogforme.com`,
    subject,
    html,
  });

};

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


module.exports = { sendConfirmationEmail, sendResetPasswordMail,sendContactEmail };
