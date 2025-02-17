import { firestore } from "../../firebaseConfig";

const deletePriceList = async (id: string) => {
  try {
    const priceListsRef = firestore.collection("prices_lists").doc(id);
    const doc = await priceListsRef.get();

    if (!doc.exists) {
      console.error("Documento não encontrado para exclusão:", id);
      return { error: "Documento não encontrado para exclusão." };
    }

    // Verificar se há clientes vinculados a essa lista de preços
    const clientsRef = firestore.collection("clients");
    const clientsQuery = await clientsRef.where("id_priceList", "==", id).get();

    if (!clientsQuery.empty) {
      const clientNames = clientsQuery.docs.map((doc) => doc.data().user_name);
      const clientNamesList = clientNames.join(", ");
      return {
        error: `A lista de preços não pode ser excluída porque está vinculada aos seguintes clientes: ${clientNamesList}.`,
      };
    }

    // Caso não haja clientes vinculados, procede com a exclusão
    await priceListsRef.delete();
    return { id, message: "Lista de preços excluída com sucesso." };
  } catch (error) {
    console.error("Erro ao excluir lista de preços:", error);
    return { error: "Erro ao excluir lista de preços." };
  }
};

export default deletePriceList;
