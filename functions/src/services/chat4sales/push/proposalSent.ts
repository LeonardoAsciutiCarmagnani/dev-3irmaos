import axios from "axios";

interface proposalSentProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
}

const proposalSent = async (props: proposalSentProps) => {
  try {
    console.log("Enviando push (proposalSent) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/94aa3529-2a62-4447-91c0-a65140279ae4",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalSent;
