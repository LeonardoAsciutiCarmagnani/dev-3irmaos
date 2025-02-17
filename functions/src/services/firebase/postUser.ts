import { firestore } from "../../firebaseConfig";

// Interface para tipagem dos dados do usuário
interface User {
  user_id: string;
  cpf: string;
  email: string;
  name: string;
  password?: string;
  type_user: string;
}

const saveUserToFirestore = async (user: User) => {
  try {
    const usersRef = firestore.collection("clients");
    const userRef = usersRef.doc(user.user_id);

    const userToSave = { ...user };

    delete userToSave.password;

    await userRef.set(userToSave);

    return {
      success: true,
      message: "Usuário criado no firebase com sucesso.",
      userId: userRef.id,
    };
  } catch (error: any) {
    console.error("Erro ao salvar usuário:", error);
    return {
      success: false,
      message: error.message || "Erro ao salvar usuário.",
    };
  }
};

export default saveUserToFirestore;
