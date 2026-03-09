// Utilitário centralizado para tratamento de erros em português

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Firebase Auth errors
    if ('code' in error) {
      const code = (error as any).code as string;
      const firebaseMessage = FIREBASE_ERROR_MESSAGES[code];
      if (firebaseMessage) return firebaseMessage;
    }

    // Network errors
    if (error.message.includes('network') || error.message.includes('Network')) {
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    }

    if (error.message.includes('timeout') || error.message.includes('Timeout')) {
      return 'A operação demorou muito. Tente novamente.';
    }

    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Ocorreu um erro inesperado. Tente novamente.';
}

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Auth
  'auth/email-already-in-use': 'Este email já está em uso.',
  'auth/invalid-email': 'Email inválido.',
  'auth/wrong-password': 'Senha incorreta.',
  'auth/user-not-found': 'Usuário não encontrado.',
  'auth/weak-password': 'A senha deve ter pelo menos 6 caracteres.',
  'auth/too-many-requests': 'Muitas tentativas. Aguarde um momento.',
  'auth/user-disabled': 'Esta conta foi desativada.',
  'auth/invalid-credential': 'Credenciais inválidas. Verifique email e senha.',
  'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
  // Firestore
  'permission-denied': 'Você não tem permissão para esta ação.',
  'not-found': 'Recurso não encontrado.',
  'already-exists': 'Este registro já existe.',
  'resource-exhausted': 'Limite de requisições atingido. Tente mais tarde.',
  'unavailable': 'Serviço temporariamente indisponível.',
  'deadline-exceeded': 'A operação demorou muito. Tente novamente.',
  // Storage
  'storage/unauthorized': 'Sem permissão para fazer upload.',
  'storage/canceled': 'Upload cancelado.',
  'storage/unknown': 'Erro desconhecido no upload.',
  'storage/object-not-found': 'Arquivo não encontrado.',
  'storage/quota-exceeded': 'Limite de armazenamento atingido.',
};

// Retry com backoff exponencial
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  baseDelay: number = 1000,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Não faz retry para erros que não são transientes
      if (error instanceof Error && 'code' in error) {
        const code = (error as any).code as string;
        const nonRetryable = [
          'auth/email-already-in-use',
          'auth/invalid-email',
          'auth/wrong-password',
          'auth/user-not-found',
          'auth/weak-password',
          'auth/user-disabled',
          'permission-denied',
          'not-found',
          'already-exists',
        ];
        if (nonRetryable.includes(code)) {
          throw error;
        }
      }

      if (attempt < maxAttempts - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
