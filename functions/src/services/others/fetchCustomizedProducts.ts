import { firestore } from "../../firebaseConfig";

interface PriceListItem {
  id: string;
  nome: string;
  preco: number;
  categoria?: string;
}

interface PriceList {
  id: string;
  name?: string;
  products: PriceListItem[];
}

export const fetchClientPriceList = async (
  clientId: string
): Promise<PriceList | null> => {
  // 1. Buscar o documento do cliente na coleção "clients" com base no ID do cliente
  const clientRef = firestore.collection("clients").doc(clientId);
  const clientDoc = await clientRef.get();

  if (!clientDoc.exists) {
    throw new Error("Cliente não encontrado.");
  }

  // 2. Obter o campo id_priceList do documento do cliente
  const clientData = clientDoc.data();
  const idPriceList = clientData?.id_priceList;

  if (!idPriceList || idPriceList === "") {
    const priceListRef = firestore
      .collection("default_prices-list")
      .doc("DEFAULT");

    const priceListDoc = await priceListRef.get();

    const priceListData = priceListDoc.data() as PriceList;

    return { ...priceListData, id: priceListDoc.id };
  }

  // 3. Buscar a lista de preços usando o idPriceList
  const priceListRef = firestore.collection("prices_lists").doc(idPriceList);
  const priceListDoc = await priceListRef.get();

  // 4. Obter os dados da lista de preços
  const priceListData = priceListDoc.data() as PriceList;

  // 5. Retornar a lista de preços com o ID
  return { ...priceListData, id: priceListDoc.id };
};
