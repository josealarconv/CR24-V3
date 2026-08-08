import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function askGeminiAssistant(prompt, contextData = {}) {
  if (!navigator.onLine) {
    return {
      success: false,
      error: 'Gemini requiere conexión a Internet. Las funciones de IA se reanudarán al recuperar la conectividad.'
    };
  }

  if (!ai && !import.meta.env.VITE_GEMINI_API_KEY) {
    // Fallback simulation when API key is not configured locally
    return {
      success: true,
      text: `[Asistente Gemini CR24 - Modo Demostración]\n\nRespuesta simulada para: "${prompt}"\n\n- Análisis sugerido: Verificar precios históricos en Proveedor 7aa2ede0 (Electrónica 2000) y 35823124 (USA Computers).\n- Recomendación: En licitaciones aeronáuticas o de minería, requerir certificados de calibración ISO / ANSI.`
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `Eres el Asistente de Inteligencia Artificial de la aplicación CR24 para Suministros Industriales Orión.
Tu objetivo es apoyar la investigación de productos, selección de proveedores, análisis de precios y asistencia operacional para licitaciones.

Contexto actual del sistema:
${JSON.stringify(contextData, null, 2)}

Consulta del operador:
${prompt}`
            }
          ]
        }
      ]
    });

    return {
      success: true,
      text: response.text
    };
  } catch (e) {
    console.error('Error invoking Gemini:', e);
    return {
      success: false,
      error: e.message || 'Error al comunicarse con el modelo Gemini Flash.'
    };
  }
}
