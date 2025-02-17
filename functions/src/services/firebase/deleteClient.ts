import { admin, firestore } from "../../firebaseConfig";

const deleteUserData = async (id: string) => {
  try {
    await admin.auth().deleteUser(id);
    await firestore.collection("clients").doc(id).delete();
    return { id, message: "Usuário excluído com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return { success: false, message: "Erro ao excluir usuário.", error };
  }
};

export default deleteUserData;
