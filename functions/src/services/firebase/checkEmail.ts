import { getAuth, FirebaseAuthError } from "firebase-admin/auth";

const auth = getAuth();

export const checkEmailExists = async (email: string) => {
  try {
    if (!email) {
      return { success: false, message: "O email é obrigatório" };
    }

    // Verificar se o usuário existe, usando getUserByEmail()
    await auth.getUserByEmail(email);
    return { success: true, message: "Email enviado com sucesso!" };
  } catch (error) {
    // Lidar com erros
    if (error instanceof FirebaseAuthError) {
      switch (error.code) {
        case "auth/user-not-found":
          return { success: false, message: "E-mail não encontrado." };
        case "auth/invalid-email":
          return { success: false, message: "E-mail inválido." };
        default:
          return {
            success: false,
            message: "Erro ao processar a recuperação de senha.",
          };
      }
    } else {
      console.error("Erro ao processar a recuperação de senha:", error);
      return {
        success: false,
        message: "Ocorreu um erro ao processar sua solicitação.",
      };
    }
  }
};
