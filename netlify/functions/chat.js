// netlify/functions/chat.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    // 1) Parsear el body que viene del frontend
    const { messages } = JSON.parse(event.body || '{}');

    // Si no hay messages, devolvemos un error claro
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'El campo "messages" no es válido o está vacío.' })
      };
    }

    // 2) Llamar a OpenRouter
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

    // 3) Si la respuesta no es OK (200), devolvemos el error en JSON
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text().catch(() => null);
      // Tratar de parsear JSON de OpenRouter (por si viene JSON), sino enviar texto
      let errorData;
      try {
        errorData = errorText ? JSON.parse(errorText) : null;
      } catch {
        errorData = { error: errorText || 'Error al llamar a OpenRouter' };
      }
      return {
        statusCode: apiResponse.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      };
    }

    // 4) Convertir la respuesta de OpenRouter a JSON
    const data = await apiResponse.json();

    // 5) Devolver el JSON final con Content-Type: application/json
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };

  } catch (error) {
    // En caso de cualquier excepción, devolvemos JSON con el mensaje de error
    console.error('Error en Netlify Function chat:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Error desconocido en la función' })
    };
  }
};
