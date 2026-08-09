/**
 * Analiza un documento de licitación usando AI (Gemini).
 * Soporta dos modos:
 * 1. textContent: Texto pegado directamente (más confiable, sin límite de tamaño de archivo)
 * 2. file: Archivo subido (Word, PDF, imagen) — se envía como base64
 *
 * @param {Object} options
 * @param {File} [options.file] - Archivo a analizar
 * @param {string} [options.textContent] - Texto del documento (preferido)
 * @returns {Promise<{success: boolean, data: Object, isDemo?: boolean, error?: string}>}
 */
export async function analizarDocumentoLicitacion({ file, textContent }) {
  try {
    const body = {};

    if (textContent && textContent.trim().length > 20) {
      // Text mode (preferred - no size limits, more reliable)
      body.textContent = textContent.trim();
    } else if (file) {
      // File mode (base64 - may hit Vercel body size limits)
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
      });
      body.fileData = base64Data;
      body.fileType = file.type;
      body.fileName = file.name;
    } else {
      throw new Error('Se requiere texto o archivo para analizar.');
    }

    const response = await fetch('/api/analyze-document', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.details || errData.error || `API error: ${response.status}`);
    }

    const result = await response.json();
    return { success: true, data: result };

  } catch (error) {
    console.error('Error analyzing document:', error);

    // Return error info instead of silent fallback
    return {
      success: false,
      error: error.message || 'Error desconocido al analizar el documento.',
      data: null
    };
  }
}
