import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config();

// Para usar em produção, configure a variável de ambiente GOOGLE_APPLICATION_CREDENTIALS
// com o caminho para o seu JSON de conta de serviço.
// Localmente, você pode colocar o serviceAccountKey.json na raiz da pasta api/.

try {
  let serviceAccount;
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
  } else {
    // Fallback para arquivo local na pasta api/
    serviceAccount = require('../../serviceAccountKey.json');
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log("Firebase Admin conectado com sucesso!");
} catch (error) {
  console.error("Erro ao inicializar Firebase Admin:", error);
  console.warn("Certifique-se de ter um arquivo 'serviceAccountKey.json' na pasta api ou a variável GOOGLE_APPLICATION_CREDENTIALS configurada.");
}

export const db = admin.firestore();
export const auth = admin.auth();
