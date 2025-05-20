import axios from "axios";

interface proposalInProductionProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const proposalInProduction = async (props: proposalInProductionProps) => {
  try {
    console.log("Enviando push (proposalInProduction) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/368f4bfc-24e3-4c8b-80d4-39d2da78aa9b",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default proposalInProduction;
