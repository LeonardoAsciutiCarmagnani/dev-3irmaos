import axios from "axios";

interface proposalAcceptedProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const proposalAccepted = async (props: proposalAcceptedProps) => {
  try {
    console.log("Enviando push (proposalAccepted) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/4c9578eb-9080-4d11-b655-0ff61eb0fafa",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalAccepted;
