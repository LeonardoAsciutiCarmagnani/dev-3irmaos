import { admin } from "../../firebaseConfig";

export const updateProductAvailability = async (
  productId: string,
  disponivel: boolean
) => {
  try {
    const disponibilityRef = admin.firestore().collection("productsConfig");

    await disponibilityRef.doc(productId).set(
      {
        disponivel,
        ultimaAtualizacao: new Date(),
      },
      { merge: true }
    );

    return { success: true, message: "Disponibilidade atualizada com sucesso" };
  } catch (error) {
    console.error("Erro ao atualizar disponibilidade", error);
    return {
      success: false,
      message: "Falha ao alterar a disponibilidade do produto",
    };
  }
};
