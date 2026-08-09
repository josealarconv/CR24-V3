export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { fileData, fileType, fileName } = req.body;

    if (!fileData || !fileType) {
      return res.status(400).json({ error: 'fileData and fileType are required' });
    }

    const prompt = `Analiza el siguiente documento de licitación y extrae la información en formato JSON.
Necesito que identifiques:
- numeroLicitacion: El número o referencia de la licitación
- clienteNombre: El nombre de la empresa o institución que licita
- fechaRecepcion: La fecha de publicación o recepción (formato YYYY-MM-DD)
- fechaLimite: La fecha límite para presentar ofertas (formato YYYY-MM-DD)
- moneda: La moneda (CLP, USD, o UF)
- observaciones: Resumen general del requerimiento
- items: Array de productos/servicios requeridos, cada uno con:
  - descripcion: Nombre o descripción del producto/servicio
  - cantidad: Cantidad requerida (número)
  - unidad: Unidad de medida
  - especificaciones: Especificaciones técnicas o detalles

Responde SOLO con JSON válido, sin markdown ni texto adicional.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: fileType,
                data: fileData
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting if the model didn't follow the instruction perfectly
    const cleanJsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsedResult = JSON.parse(cleanJsonString);

    return res.status(200).json(parsedResult);

  } catch (error) {
    console.error('Error in analyze-document:', error);
    return res.status(500).json({ error: 'Failed to analyze document', details: error.message });
  }
}
