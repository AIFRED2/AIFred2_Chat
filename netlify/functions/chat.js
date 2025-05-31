// netlify/functions/chat.js

/**
 * Este archivo define una función Lambda para Netlify.
 * Recibe en el body un JSON con { messages: [...] },
 * agrega tu API Key (desde variable de entorno) y reenvía a OpenRouter.
 */

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // 1) Parsear el body (esperamos { messages: [...] })
    const { messages } = JSON.parse(event.body);

    // 2) Construir la petición a OpenRouter incluyendo la API key desde la variable de entorno
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // OPENROUTER_API_KEY la configuraremos en Netlify Dashboard
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
        messages: messages
      })
    });

    // 3) Leer el resultado y devolverlo tal cual al cliente
    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error en la función chat:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
