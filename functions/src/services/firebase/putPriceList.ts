import { firestore } from "../../firebaseConfig";

const putPriceListInFirestore = async (id: string, priceListData: any) => {
  try {
    const priceListsRef = firestore.collection("prices_lists");
    const priceListRef = priceListsRef.doc(id);

    await priceListRef.update(priceListData);

    return { message: "Lista de preços atualizada com sucesso." };
  } catch (error) {
    console.error("Erro ao atualizar lista de preços:", error);
    return { error: "Erro ao atualizar lista de preços." };
  }
};

export default putPriceListInFirestore;
