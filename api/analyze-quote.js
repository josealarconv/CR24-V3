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

    const prompt = `Analiza la siguiente cotización de proveedor y extrae la información en formato JSON.
Necesito que identifiques:
- proveedorNombre: Nombre del proveedor
- moneda: Moneda (CLP o USD)
- precioUnitario: Precio unitario (número)
- cantidad: Cantidad cotizada (número)
- costoFlete: Costo de flete/envío por unidad (número, 0 si no se menciona)
- costoInternacion: Costo de internación/aduanas por unidad (número, 0 si no se menciona)
- costoAfex: Costo administrativo/AFEX por unidad (número, 0 si no se menciona)
- porcentajeImpuesto: Porcentaje de impuesto (número, 19 para IVA en Chile)
- condiciones: Condiciones de pago y entrega
- plazoEntrega: Plazo de entrega
- notas: Cualquier nota adicional importante

Responde SOLO con JSON válido, sin markdown ni texto adicional.`;

    // Build parts array
    const parts = [{ text: prompt }];

    if (textContent) {
      parts.push({ text: `\n\n--- CONTENIDO DE LA COTIZACIÓN ---\n\n${textContent}` });
    } else if (fileData && fileType) {
      parts.push({
        inlineData: {
          mimeType: fileType,
          data: fileData
        }
      });
    }

    // Same models used successfully in fimfan project + older fallbacks
    const modelsToTry = [
      'gemini-3.1-flash-lite',
      'gemini-3.5-flash',
      'gemini-2.0-flash-lite',
      'gemini-2.0-flash'
    ];

    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    let lastError = null;

    for (const model of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        attempts++;
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts }],
                generationConfig: {
                  temperature: 0.1,
                  maxOutputTokens: 4096
                }
              })
            }
          );

          if (response.status === 429 || response.status === 503) {
            const errText = await response.text();
            lastError = `${model}: ${response.status}`;

            // Retry on 503/unavailable, skip model on 429 quota
            if (response.status === 503 && attempts < maxAttempts) {
              await delay(1000 * attempts);
              continue;
            }
            break; // 429 = skip to next model
          }

          if (!response.ok) {
            const errorData = await response.text();
            lastError = `${model}: ${response.status} - ${errorData}`;
            break; // Non-retryable error, try next model
          }

          const data = await response.json();
          const textResponse = data.candidates[0].content.parts[0].text;
          const cleanJsonString = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
          const parsedResult = JSON.parse(cleanJsonString);

          return res.status(200).json(parsedResult);

        } catch (err) {
          lastError = `${model}: ${err.message}`;
          if (attempts < maxAttempts) {
            await delay(1000 * attempts);
          } else {
            break;
          }
        }
      }
    }

    throw new Error(`Todos los modelos fallaron. Último error: ${lastError}`);

  } catch (error) {
    console.error('Error in analyze-quote:', error);
    return res.status(500).json({ error: 'Failed to analyze quote', details: error.message });
  }
}
