import { firestore } from "../../firebaseConfig";

export const fetchPricesLists = async () => {
  try {
    const priceListsRef = firestore.collection("prices_lists");
    const snapshot = await priceListsRef.get();

    if (snapshot.empty) {
      return { success: false, message: "Nenhuma lista de preços encontrada." };
    }

    const pricesLists = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return pricesLists;
  } catch (error) {
    console.error("Erro ao buscar listas de preços:", error);
    return { success: false, message: "Erro ao buscar listas de preços." };
  }
};
