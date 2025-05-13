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

const sendJockeyAppliedMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "👟 Un jockey veut relever ta mission !",
      html: `
        <h1>🔥 Bonne nouvelle !</h1>
        <p>Un jockey a postulé pour accomplir ta mission sur <strong>JogForMe</strong>.</p>
        <p>👉 Clique ici pour voir son profil et accepter sa candidature :</p>
        <p><a href="${link}" style="color: #0070f3;">Voir la mission</a></p>
        <p>Une fois accepté, tu pourras finaliser le paiement et suivre son avancée.</p>
        <p>À très vite sur <strong>JogForMe</strong> 🏃‍♂️💨</p>
      `
    },
    en: {
      subject: "👟 A jockey applied to your mission!",
      html: `
        <h1>🔥 Good news!</h1>
        <p>A jockey has applied to complete your mission on <strong>JogForMe</strong>.</p>
        <p>👉 Click here to view their profile and accept the application:</p>
        <p><a href="${link}" style="color: #0070f3;">View the mission</a></p>
        <p>Once accepted, you’ll be able to finalize payment and track progress.</p>
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
};

const sendMissionAcceptedMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "🎉 Ta mission a été acceptée !",
      html: `
        <h1>🏁 En route !</h1>
        <p>Le créateur de la mission a accepté ta candidature sur <strong>JogForMe</strong>.</p>
        <p>Tu peux maintenant te préparer à courir et suivre les prochaines étapes :</p>
        <p><a href="${link}" style="color: #0070f3;">Voir la mission</a></p>
        <p>Merci d’être un vrai jockey ✨</p>
        <p>À bientôt sur <strong>JogForMe</strong> 👟</p>
      `
    },
    en: {
      subject: "🎉 Your mission was accepted!",
      html: `
        <h1>🏁 Let’s go!</h1>
        <p>The mission creator has accepted your application on <strong>JogForMe</strong>.</p>
        <p>You can now get ready to run and follow the next steps:</p>
        <p><a href="${link}" style="color: #0070f3;">View the mission</a></p>
        <p>Thanks for being a true jockey ✨</p>
        <p>See you soon on <strong>JogForMe</strong> 👟</p>
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
};




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

const sendMissionCompletedMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "✅ Ton jockey a terminé la mission !",
      html: `
        <h1>🎯 Mission accomplie !</h1>
        <p>Le jockey a marqué la mission comme terminée sur <strong>JogForMe</strong>.</p>
        <p>Tu peux maintenant vérifier son activité et valider la mission :</p>
        <p><a href="${link}" style="color: #0070f3;">Voir la mission</a></p>
        <p>Merci d’avoir utilisé JogForMe – la sueur par procuration 😄</p>
        <p>À bientôt 👟</p>
      `
    },
    en: {
      subject: "✅ Your jockey completed the mission!",
      html: `
        <h1>🎯 Mission complete!</h1>
        <p>Your jockey has marked the mission as completed on <strong>JogForMe</strong>.</p>
        <p>You can now check their activity and confirm the mission:</p>
        <p><a href="${link}" style="color: #0070f3;">View the mission</a></p>
        <p>Thanks for using JogForMe – sweating by proxy 😄</p>
        <p>See you soon 👟</p>
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
};

const sendGpxRejectedMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "❌ Fichier GPX refusé",
      html: `
        <h1>🧐 Hmm... ton GPX a été refusé</h1>
        <p>Le client n’a pas validé le fichier que tu as envoyé pour la mission.</p>
        <p>Tu peux vérifier les détails ici et soumettre un nouveau fichier si besoin :</p>
        <p><a href="${link}" style="color: #0070f3;">Voir la mission</a></p>
        <p>Pas de panique, ça arrive à tout le monde 😅</p>
        <p>On est avec toi 💪</p>
      `
    },
    en: {
      subject: "❌ GPX file rejected",
      html: `
        <h1>🧐 Hmm... your GPX was rejected</h1>
        <p>The client did not validate the file you uploaded for the mission.</p>
        <p>You can check the details here and upload a new file if needed:</p>
        <p><a href="${link}" style="color: #0070f3;">View the mission</a></p>
        <p>No worries — it happens to the best! 😅</p>
        <p>We’re rooting for you 💪</p>
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
};

const sendNearbyMissionNotification = async (to, missionLink, locale = "fr") => {
  const translations = {
    fr: {
      subject: "📍 Nouvelle mission proche de toi !",
      html: `
        <h1>👋 Hey toi,</h1>
        <p>Une mission vient d'être créée non loin de ta position sur <strong>JogForMe</strong>.</p>
        <p>Elle n'attend que toi pour être réalisée 💪</p>
        <p><a href="${missionLink}" style="color: #0070f3; font-weight: bold;">Voir la mission</a></p>
        <p>Tu peux l'accepter en un clic et te dépenser...</p>
        <p>On t'attend sur <strong>JogForMe</strong> 🏃‍♂️🚀</p>
      `
    },
    en: {
      subject: "📍 New mission near you!",
      html: `
        <h1>👋 Hey you,</h1>
        <p>A mission was just created close to your location on <strong>JogForMe</strong>.</p>
        <p>It’s waiting for someone like you to crush it 💪</p>
        <p><a href="\${missionLink}" style="color: #0070f3; font-weight: bold;">Check out the mission</a></p>
        <p>You can accept it in one click and get moving...</p>
        <p>We’re waiting for you on <strong>JogForMe</strong> 🏃‍♀️🚀</p>
      `
    },
    bn: {
      subject: "📍 আপনার কাছাকাছি একটি নতুন মিশন এসেছে!",
      html: `
        <h1>👋 হেই তুমি,</h1>
        <p><strong>JogForMe</strong>-তে তোমার অবস্থানের কাছে একটি নতুন মিশন তৈরি হয়েছে।</p>
        <p>এটা শুধু তোমার জন্য অপেক্ষা করছে 💪</p>
        <p><a href="\${missionLink}" style="color: #0070f3; font-weight: bold;">মিশনটি দেখো</a></p>
        <p>এক ক্লিকে এটি গ্রহণ করো এবং শুরু করো...</p>
        <p>তোমার জন্য অপেক্ষা করছে <strong>JogForMe</strong> 🏃‍♂️🚀</p>
      `
    }       
  };

  const content = translations[locale] || translations.fr;

  await sendMail({
    from: `"JogForMe" <no_reply@Jogforme.com>`,
    to,
    subject: content.subject,
    html: content.html
  });
};

const sendGpxAcceptedMail = async (to, link, locale = "fr") => {
  const translations = {
    fr: {
      subject: "✅ GPX validé !",
      html: `
        <h1>👏 Bien joué !</h1>
        <p>Le client a validé ton fichier GPX pour la mission.</p>
        <p>Tu peux consulter les détails ici :</p>
        <p><a href="${link}" style="color: #0070f3;">Voir la mission</a></p>
        <p>Merci d’avoir couru pour JogForMe 🏃‍♂️💨</p>
        <p>À bientôt pour une nouvelle mission !</p>
      `
    },
    en: {
      subject: "✅ GPX approved!",
      html: `
        <h1>👏 Nice work!</h1>
        <p>The client has approved your GPX file for the mission.</p>
        <p>You can check the details here:</p>
        <p><a href="${link}" style="color: #0070f3;">View the mission</a></p>
        <p>Thanks for running with JogForMe 🏃‍♀️💨</p>
        <p>See you soon for your next mission!</p>
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




module.exports = { sendConfirmationEmail, sendResetPasswordMail,sendContactEmail, sendJockeyAppliedMail, sendMissionAcceptedMail,sendMissionCompletedMail, sendGpxRejectedMail, sendGpxAcceptedMail,sendNearbyMissionNotification };
