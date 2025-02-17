import axios from "axios";

interface adminOrderCompletedProps {
  orderCode: string;
  phoneNumer: number;
  totalValue: number;
  createdAt: string;
  customerName: string;
}

const fetchAdminOrderCompleted = async (props: adminOrderCompletedProps) => {
  try {
    console.log("Enviando push (adminOrderCompleted) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/a14f4536-ce06-4a38-821b-869e1d4fadf3",
      props
    );
    return response;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default fetchAdminOrderCompleted;
