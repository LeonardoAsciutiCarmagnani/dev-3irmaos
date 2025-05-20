import axios from "axios";

interface proposalDispatchedProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
  deliveryDate?: string;
}

const proposalDispatched = async (props: proposalDispatchedProps) => {
  try {
    console.log("Enviando push (proposalDispatched) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/06af158c-b04a-40ed-92e8-731a1765090e",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalDispatched;
