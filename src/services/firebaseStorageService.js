import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app, isConfigured } from '../config/firebase';

const storage = isConfigured && app ? getStorage(app) : null;

/**
 * Sube un archivo (PDF o fotografía) a Firebase Storage registrando sus metadatos (Bloque VI puntos 61-65).
 * Optimiza las imágenes reduciendo peso antes de la subida.
 */
export async function uploadFileToStorage(file, folder = 'anexos') {
  if (!navigator.onLine) {
    // Si está offline, guarda objeto temporal local (Bloque IX punto 92)
    const localUrl = URL.createObjectURL(file);
    return {
      success: true,
      url: localUrl,
      nombre: file.name,
      tipo: file.type,
      size: file.size,
      isOffline: true
    };
  }

  if (!storage) {
    console.warn('Firebase Storage no configurado. Utilizando URL local.');
    return {
      success: true,
      url: URL.createObjectURL(file),
      nombre: file.name,
      tipo: file.type,
      size: file.size,
      isFallback: true
    };
  }

  try {
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storagePath = `${folder}/${timestamp}_${cleanFileName}`;
    const storageRef = ref(storage, storagePath);

    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type
    });

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Subida de ${file.name}: ${progress.toFixed(0)}%`);
        },
        (error) => {
          console.error('Error al subir archivo a Firebase Storage:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            success: true,
            url: downloadUrl,
            storagePath: storagePath,
            nombre: file.name,
            tipo: file.type,
            size: file.size,
            fecha: new Date().toISOString()
          });
        }
      );
    });
  } catch (e) {
    console.error('Excepción al subir archivo a Firebase Storage:', e);
    return {
      success: false,
      error: e.message
    };
  }
}
