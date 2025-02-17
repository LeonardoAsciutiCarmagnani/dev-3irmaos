import axios from "axios";

interface paymentLinkAddedProps {
  orderCode: string;
  customerName: string;
  phoneNumber: number;
  paymentLink: string;
}

const fetchPaymentLinkAdded = async (props: paymentLinkAddedProps) => {
  try {
    console.log("Enviando push (paymentLinkAdded) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/f72a077a-801d-4235-94e7-a2b0a0873d46",
      props
    );
    return response;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default fetchPaymentLinkAdded;
