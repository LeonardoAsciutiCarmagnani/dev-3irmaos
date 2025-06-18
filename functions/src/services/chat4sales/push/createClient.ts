import axios from "axios";

interface createClientProps {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientPassword: string;
}

const createClient = async (props: createClientProps) => {
  try {
    console.log("Enviando push (createClient) ", props);
    const response = await axios.post(
      "https://enterprise-112api.chat4sales.com.br/w/40b8072a-b558-4975-a096-ceaae16707f9",
      props
    );
    return response.data;
  } catch (error) {
    console.error("Erro ao enviar push:", error);
    return null;
  }
};

export default createClient;
