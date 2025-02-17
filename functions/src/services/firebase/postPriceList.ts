import { firestore } from "../../firebaseConfig";

const postPricesList = async (priceListData: any) => {
  try {
    const priceListsRef = firestore.collection("prices_lists");
    const docRef = await priceListsRef.add(priceListData);

    return { id: docRef.id, message: "Lista de preços criada com sucesso." };
  } catch (error) {
    console.error("Erro ao criar lista de preços:", error);
    return { error: "Erro ao criar lista de preços." };
  }
};

export default postPricesList;
