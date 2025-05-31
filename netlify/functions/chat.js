// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // 1) Parseamos el body que viene desde el frontend
    const { messages } = JSON.parse(event.body);
    console.log('Received messages:', JSON.stringify(messages));

    // 2) Llamamos a OpenRouter con la variable de entorno OPENROUTER_API_KEY
    const apiResponse = await fetch(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
        },
        body: JSON.stringify({
          model:    'deepseek/deepseek-r1-0528-qwen3-8b:free',
          messages: messages
        })
      }
    );

    console.log('OpenRouter status:', apiResponse.status);

    // 3) Convertimos la respuesta de OpenRouter a JSON
    const data = await apiResponse.json();
    console.log('OpenRouter replied:', JSON.stringify(data));

    // 4) devolvemos el JSON al frontend, FORZANDO application/json
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    console.error('Error en la función chat:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
