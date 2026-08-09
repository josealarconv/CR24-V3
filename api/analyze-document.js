export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { fileData, fileType, fileName, textContent } = req.body;

    if (!textContent && !fileData) {
      return res.status(400).json({ error: 'textContent or fileData is required' });
    }

    const prompt = `Analiza el siguiente documento de licitación y extrae la información en formato JSON.
Necesito que identifiques:
- numeroLicitacion: El número o referencia de la licitación (si no se encuentra, genera uno con formato LIC-YYYY-NNN)
- clienteNombre: El nombre de la empresa o institución que licita
- fechaRecepcion: La fecha de publicación o recepción (formato YYYY-MM-DD)
- fechaLimite: La fecha límite para presentar ofertas (formato YYYY-MM-DD)
- moneda: La moneda (CLP, USD, o UF)
- observaciones: Resumen breve del requerimiento general
- items: Array de productos/servicios/materiales requeridos. Cada elemento del array DEBE tener:
  - descripcion: Nombre completo del producto/material/servicio
  - cantidad: Cantidad requerida (número entero)
  - unidad: Unidad de medida (Unidades, Cajas, Metros, etc.)
  - especificaciones: Todas las especificaciones técnicas disponibles (marca, modelo, dimensiones, voltaje, etc.)

IMPORTANTE: Extrae TODOS los ítems/productos/materiales del documento. Cada línea de producto diferente debe ser un elemento separado en el array items.

Responde SOLO con JSON válido, sin markdown ni texto adicional.`;

    // Build parts array
    const parts = [{ text: prompt }];

    if (textContent) {
      // Text mode: append document text as a second text part
      parts.push({ text: `\n\n--- CONTENIDO DEL DOCUMENTO ---\n\n${textContent}` });
    } else if (fileData && fileType) {
      // File mode: send as inline data (multimodal)
      parts.push({
        inlineData: {
          mimeType: fileType,
          data: fileData
        }
      });
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 4096
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    // Clean up potential markdown formatting
    const cleanJsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedResult = JSON.parse(cleanJsonString);

    return res.status(200).json(parsedResult);

  } catch (error) {
    console.error('Error in analyze-document:', error);
    return res.status(500).json({ error: 'Failed to analyze document', details: error.message });
  }
}
