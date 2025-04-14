const axios = require('axios');
require('dotenv').config();

const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Pour production : https://api-m.paypal.com
const clientId = process.env.PAYPAL_CLIENT_ID;
const secret = process.env.PAYPAL_SECRET;

const getAccessToken = async () => {
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const res = await axios.post(`${PAYPAL_API}/v1/oauth2/token`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    auth: {
      username: clientId,
      password: secret
    }
  });

  return res.data.access_token;
};

const createOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { price, description } = req.body;

    const order = await axios.post(`${PAYPAL_API}/v2/checkout/orders`, {
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: price
        },
        description: description || 'Mission JogForMe'
      }]
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.status(200).json({ orderID: order.data.id });
  } catch (err) {
    console.error('Erreur création commande PayPal :', err.response?.data || err.message);
    res.status(500).json({ message: 'Erreur lors de la création de la commande PayPal.' });
  }
};

const captureOrder = async (req, res) => {
  try {
    const accessToken = await getAccessToken();
    const { orderID } = req.body;

    const capture = await axios.post(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {}, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    // Ici tu pourrais mettre à jour ta base de données : mission.status = 'paid'
    res.status(200).json({ success: true, details: capture.data });
  } catch (err) {
    console.error('Erreur capture PayPal :', err.response?.data || err.message);
    res.status(500).json({ message: 'Erreur lors de la capture du paiement.' });
  }
};

const paypalWebhook = async (req, res) => {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    const transmissionId = req.headers['paypal-transmission-id'];
    const timestamp = req.headers['paypal-transmission-time'];
    const webhookEventBody = JSON.stringify(req.body);
    const certUrl = req.headers['paypal-cert-url'];
    const authAlgo = req.headers['paypal-auth-algo'];
    const transmissionSig = req.headers['paypal-transmission-sig'];
  
    try {
      // Vérification via l'API PayPal
      const { data: verification } = await axios.post(
        'https://api-m.paypal.com/v1/notifications/verify-webhook-signature',
        {
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: timestamp,
          webhook_id: webhookId,
          webhook_event: req.body,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_SECRET}`).toString('base64')}`
          }
        }
      );
  
      if (verification.verification_status !== 'SUCCESS') {
        return res.status(400).send('Échec de vérification de la signature');
      }
  
      // Traitement de l'événement
      const event = req.body;
  
      if (event.event_type === 'CHECKOUT.ORDER.COMPLETED') {
        const orderId = event.resource.id;
  
        // Tu peux ici associer ce paiement à une mission par exemple
        console.log(`✅ Paiement reçu pour Order ID ${orderId}`);
  
        // TODO : Mettre à jour la mission correspondante dans la base
      }
  
      res.status(200).send('Webhook reçu');
    } catch (err) {
      console.error('Erreur webhook PayPal:', err.response?.data || err.message);
      res.status(500).send('Erreur webhook');
    }
  };

module.exports = {
    createOrder,
    captureOrder,
    paypalWebhook
  };
