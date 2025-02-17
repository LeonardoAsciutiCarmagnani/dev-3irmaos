import { firestore } from "../../firebaseConfig";
interface PriceListItem {
  id: string;
  nome: string;
  preco: number;
}

interface PriceList {
  id: string;
  name: string;
  products: PriceListItem[];
}

export const fetchPriceListById = async (id: string): Promise<PriceList> => {
  const priceListRef = firestore.collection("prices_lists").doc(id);
  const doc = await priceListRef.get();

  if (!doc.exists) {
    throw new Error("Lista de preços não encontrada.");
  }

  // Tipando explicitamente o retorno como PriceList com o 'id'
  const data = doc.data() as PriceList;

  return { ...data, id: doc.id };
};
