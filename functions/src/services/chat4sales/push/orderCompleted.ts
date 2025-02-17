import axios from "axios";

interface orderCompletedProps {
  orderCode: string;
  customerName: string;
  phoneNumber: number;
}

const fetchOrderCompleted = async (props: orderCompletedProps) => {
  try {
    console.log("Enviando push (OrderCompleted) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/42d9bc92-b7d2-46cd-8b24-4f029708116a",
      props
    );
    return response;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default fetchOrderCompleted;
