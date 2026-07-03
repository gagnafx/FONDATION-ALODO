const axios = require('axios');

exports.handler = async (event, context) => {
  // Configurer les en-têtes CORS pour autoriser votre HTML
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Méthode non autorisée' };
  }

  try {
    const { amount, firstname, lastname, email, phone } = JSON.parse(event.body);

    // Appel à l'API FedaPay avec votre clé secrète stockée sur Netlify
    const response = await axios.post('https://api.fedapay.com/v1/transactions', {
      amount: amount,
      currency: { iso: 'XOF' }, // Ou 'USD' selon votre configuration du fichier
      description: 'Don Fondation ALODO',
      callback_url: 'https://votre-site.netlify.app/',
      customer: { firstname, lastname, email, phone }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.FEDAPAY_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token: response.data.v1 / response.data.transaction.token }) 
      // Note : Ajustez selon la structure exacte de la réponse de l'API FedaPay
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
