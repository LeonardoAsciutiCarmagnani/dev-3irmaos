import axios from "axios";
import { firestore } from "../../firebaseConfig";
import { fetchToken } from "./fetchToken";
import { BudgetType, OrderType } from "../../controllers/Order/OrderController";

interface OrderProductsProps {
  nome: string;
  quantidade: number;
  altura: number;
  largura: number;
  categoria: string | null;
  preco: number;
  selectedVariation: {
    id: string;
    nomeVariacao: string;
  };
}

export class PostOrderService {
  public static async getLastOrderCode() {
    const collectionRef = firestore.collection("budgets");

    // Consulta ordenada e limitada ao último documento
    const querySnapshot = await collectionRef
      .orderBy("orderId", "desc")
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
  }

  public static async storeOrderInFirestore(
    orderId: number,
    order: OrderType,
    codeHiper: string,
    newOrderStatus: number
  ) {
    console.log("Data chegando na função storeOrderInFireStore => ", order);

    const budgetsRef = firestore.collection("budgets");

    const snapshot = await budgetsRef.where("orderId", "==", orderId).get();

    if (snapshot.empty) {
      console.warn(`Nenhum pedido com orderId ${orderId} encontrado.`);
      return;
    }

    snapshot.forEach(async (doc) => {
      await doc.ref.update({
        ...order,
        codeHiper: codeHiper,
        orderStatus: newOrderStatus,
      });

      console.log(`Documento ${doc.id} atualizado com codeHiper.`);
    });
  }

  public static async fetchOrderSaleData(generatedId: string) {
    let token = await fetchToken();
    try {
      const getOrderSaleHiper = await axios.get(
        `http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/eventos/${generatedId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return getOrderSaleHiper.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Erro ao buscar dados da venda:", error.response.data);
      } else {
        console.error("Erro desconhecido:", error);
      }
      throw error;
    }
  }

  public static async postOrder(data: OrderType, userId: string): Promise<any> {
    let token = await fetchToken();

    const {
      orderId,
      client,
      deliveryAddress,
      billingAddress,
      detailsPropostal,
      products,
      totalValue,
    } = data;

    const adjustedItens = products.map((item) => ({
      produtoId: item?.selectedVariation.id,
      quantidade: item?.quantidade,
      precoUnitarioBruto: item?.preco,
      precoUnitarioLiquido: item?.preco,
    }));

    const dataForHiper = {
      cliente: {
        documento: client.document,
        email: client.email,
        inscricaoEstadual: client.ie || "",
        nomeDoCliente: client.name,
        nomeFantasia: client.name || "",
      },
      enderecoDeCobranca: {
        bairro: billingAddress.neighborhood,
        cep: billingAddress.cep,
        codigoIbge: billingAddress.ibge || "",
        complemento: "",
        logradouro: billingAddress.street,
        numero: String(billingAddress.number),
      },
      enderecoDeEntrega: {
        bairro: deliveryAddress.neighborhood,
        cep: deliveryAddress.cep,
        codigoIbge: deliveryAddress.ibge || "",
        complemento: "",
        logradouro: deliveryAddress.street,
        numero: String(deliveryAddress.number),
      },
      itens: adjustedItens,
      meiosDePagamento: [
        {
          idMeioDePagamento: 1,
          parcelas: 1,
          valor: totalValue,
        },
      ],
      numeroPedidoDeVenda: String(orderId) || "",
      observacaoDoPedidoDeVenda: detailsPropostal?.obs || "",
      valorDoFrete: detailsPropostal?.delivery || 0,
    };

    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));
    try {
      console.log("tentando enviar os dados para a hiper");
      const response = await axios.post(
        "http://ms-ecommerce.hiper.com.br/api/v1/pedido-de-venda/",
        dataForHiper,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      const generatedId = response.data.id;
      const updatedData = { ...data, idOrderHiper: generatedId };

      // Tentativa de buscar o código da venda até que ele não esteja em branco, com limite de 3 tentativas
      let codeOrderHiper = "";
      let attempts = 0;
      const maxAttempts = 10; // Limite de tentativas

      while (
        (codeOrderHiper === "" || codeOrderHiper.trim() === "") &&
        attempts < maxAttempts
      ) {
        const orderSaleData = await this.fetchOrderSaleData(generatedId);
        console.log("Retorno do objeto: ", orderSaleData);
        codeOrderHiper = orderSaleData?.codigoDoPedidoDeVenda || ""; // Garante que pegamos o código ou uma string vazia

        if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
          attempts++;
          console.log(
            `Tentativa ${attempts} de ${maxAttempts}: código vazio. Aguardando 3 segundos...`
          );
          await delay(5000);
        }
      }

      if (codeOrderHiper === "" || codeOrderHiper.trim() === "") {
        console.log(
          "Não foi possível obter o código do pedido de venda. Gerando manualmente..."
        );
        codeOrderHiper = await this.getLastOrderCode();
      }

      console.log(
        "Código do pedido de venda obtido ou gerado:",
        codeOrderHiper
      );

      const newOrderStatus = 5;

      await this.storeOrderInFirestore(
        orderId,
        updatedData,
        codeOrderHiper,
        newOrderStatus
      );
      return {
        generatedId,
        codeOrderHiper: codeOrderHiper,
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        console.error("Erro na resposta:", error.response.data);
      } else {
        console.error("Erro desconhecido:", error);
      }
      throw error;
    }
  }
}
