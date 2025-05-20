import axios from "axios";

interface proposalRejectedProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const proposalRejected = async (props: proposalRejectedProps) => {
  try {
    console.log("Enviando push (proposalRejected) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/c565751a-007d-4327-9152-c923feafbdf6",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalRejected;
