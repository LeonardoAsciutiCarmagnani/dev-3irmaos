import axios from "axios";

interface createBudgetADMProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const createBudgetADM = async (props: createBudgetADMProps) => {
  try {
    console.log("Enviando push (createBudgetADM) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/1c81e385-7ee5-45c7-8c24-8084f338d436",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default createBudgetADM;
