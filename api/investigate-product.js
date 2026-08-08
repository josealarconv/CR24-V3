import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { descripcionProducto, notasDetalle } = req.body;
    if (!descripcionProducto) {
      return res.status(400).json({ error: 'La descripción del producto es requerida.' });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY no está configurada en los secretos de la aplicación.' });
    }

    const client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });

    const systemInstruction = `
Eres un especialista en investigación de mercado industrial y adquisiciones técnicas para la empresa 'Suministros Industriales Orión' en Santiago de Chile.
Tu tarea es analizar el producto solicitado en una licitación minera/industrial y proveer un análisis estructurado en formato JSON.

Analiza:
1. Resumen técnico claro del producto.
2. Especificaciones técnicas clave y normas aplicables (ANSI, IEC, ISO, DIN).
3. Proveedores locales recomendados en Chile.
4. Proveedores internacionales recomendados.
5. Rango estimado de precios de mercado.
`;

    const contents = {
      parts: [
        {
          text: `Producto a investigar: ${descripcionProducto}\nNotas adicionales de la licitación: ${notasDetalle || 'Sin notas adicionaes'}`
        }
      ]
    };

    const responseSchema = {
      type: "OBJECT",
      properties: {
        resumenProducto: { type: "STRING" },
        especificacionesTecnicas: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        proveedoresLocalesChilenos: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        proveedoresInternacionales: {
          type: "ARRAY",
          items: { type: "STRING" }
        },
        precioRangoMercado: { type: "STRING" }
      },
      required: ["resumenProducto", "especificacionesTecnicas", "proveedoresLocalesChilenos", "proveedoresInternacionales", "precioRangoMercado"]
    };

    // Protocol exact from FamFin: gemini-3.5-flash -> gemini-3.1-flash-lite
    const modelsToTry = [
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite"
    ];

    let response = null;
    let lastError = null;
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (const modelName of modelsToTry) {
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        attempts++;
        try {
          response = await client.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              responseMimeType: "application/json",
              responseSchema: responseSchema,
              temperature: 0.2
            }
          });
          if (response && response.text) {
            lastError = null;
            break;
          }
        } catch (err) {
          const errMessage = err.message || String(err);
          lastError = err;
          const isUnavailable = errMessage.includes("503") || errMessage.includes("UNAVAILABLE") || errMessage.includes("high demand") || errMessage.includes("temporary");
          if (isUnavailable && attempts < maxAttempts) {
            await delay(1000 * attempts);
          } else {
            break;
          }
        }
      }
      if (response && response.text) break;
    }

    if (lastError) throw lastError;

    const resultText = response ? response.text : null;
    if (!resultText) throw new Error("Respuesta vacía del servidor Gemini API.");

    return res.status(200).json(JSON.parse(resultText));
  } catch (error) {
    console.error("Error en investigación IA:", error);
    return res.status(500).json({
      error: error.message || "Error interno al procesar la investigación con Gemini IA."
    });
  }
}
