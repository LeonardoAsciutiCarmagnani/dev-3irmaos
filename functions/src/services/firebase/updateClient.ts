import { admin, firestore } from "../../firebaseConfig";

const updateUserData = async (id: string, updatedData: any) => {
  try {
    // Atualizar o e-mail e o display name no Firebase Authentication
    const updateFields: any = {};

    if (updatedData.user_email) {
      updateFields.email = updatedData.user_email;
    }

    if (updatedData.user_name) {
      updateFields.displayName = updatedData.user_name; // Atualiza o display name
    }

    if (Object.keys(updateFields).length > 0) {
      await admin.auth().updateUser(id, updateFields);
    }

    // Atualizar os dados do cliente no Firestore diretamente sem criar 'updatedData'
    await firestore
      .collection("clients")
      .doc(id)
      .update({
        user_CPF: updatedData.user_CPF,
        user_IE: updatedData.user_IE || "",
        user_cep: updatedData.user_cep,
        user_complement: updatedData.user_complement || "",
        user_email: updatedData.user_email,
        user_fantasyName: updatedData.user_fantasyName || "",
        user_houseNumber: updatedData.user_houseNumber,
        user_ibgeCode: updatedData.user_ibgeCode,
        user_id: updatedData.user_id,
        user_logradouro: updatedData.user_logradouro,
        user_name: updatedData.user_name,
        user_neighborhood: updatedData.user_neighborhood,
        user_phone: updatedData.user_phone,
      });

    return { id, message: "Dados do usuário atualizados com sucesso." };
  } catch (error) {
    console.error("Erro ao atualizar dados do usuário:", error);
    return {
      success: false,
      message: "Erro ao atualizar dados do usuário.",
      error,
    };
  }
};

export default updateUserData;
