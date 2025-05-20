import axios from "axios";

interface proposalCompletedProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const proposalCompleted = async (props: proposalCompletedProps) => {
  try {
    console.log("Enviando push (proposalCompleted) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/733d48fd-542a-41c9-ab46-beb97eba4ceb",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalCompleted;
