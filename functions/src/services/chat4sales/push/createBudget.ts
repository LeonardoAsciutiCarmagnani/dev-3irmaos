import axios from "axios";

interface createBudgetProps {
  orderCode: number;
  clientName: string;
  clientPhone: string;
  createdAt: string;
  orderStatus: number;
}

const createBudget = async (props: createBudgetProps) => {
  try {
    console.log("Enviando push (createBudget) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/b91f44f6-52c0-4f8a-b3c1-cc733810c136",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default createBudget;
