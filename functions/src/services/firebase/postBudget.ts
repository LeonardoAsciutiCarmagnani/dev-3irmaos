import { firestore } from "../../firebaseConfig";
import { OrderData } from "../../controllers/api";

const getLastOrderCode = async (): Promise<string> => {
  const collectionRef = firestore.collection("sales_orders");

  // Consulta ordenada e limitada ao último documento
  const querySnapshot = await collectionRef
    .orderBy("order_code", "desc")
    .limit(1)
    .get();

  let lastOrderNumber = 0;

  if (!querySnapshot.empty) {
    const lastOrder = querySnapshot.docs[0].data();
    const lastOrderCode = lastOrder.order_code || "LV0";

    // Extraindo o número do código (assumindo formato "LV<number>")
    const match = lastOrderCode.match(/LV(\d+)/);
    lastOrderNumber = match ? parseInt(match[1], 10) : 0;
  }

  // Incrementa o número para gerar o próximo código
  const nextOrderCode = `LV${lastOrderNumber + 1}`;
  return nextOrderCode;
};

const storeOrderInFirestore = async (
  order: OrderData,
  userId: string
): Promise<void> => {
  const orderWithClientId = {
    ...order,
    IdClient: userId,
    status_order: 1,
  };

  const docRef = firestore.collection("sales_orders").doc();
  await docRef.set(orderWithClientId);
};

const postBudget = async (
  order: OrderData,
  userId: string
): Promise<OrderData> => {
  // Gera o novo código de pedido
  const newOrderCode = await getLastOrderCode();

  // Adiciona o código gerado à ordem
  const orderToSave: OrderData = {
    ...order,
    order_code: newOrderCode,
  };

  // Armazena a ordem no Firestore
  await storeOrderInFirestore(orderToSave, userId);

  return orderToSave;
};

export default postBudget;
