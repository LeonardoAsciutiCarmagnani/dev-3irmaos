import { useEffect } from "react";
import axios from "axios";
import apiBaseUrl from "@/lib/apiConfig";
import ToastNotifications from "../_components/Toasts";

export interface EnderecoData {
  bairro: string;
  ibge: number;
  localidade: string;
  logradouro: string;
  uf: string;
}

interface FetchCEPComponentProps {
  cep: string;
  onCEPDataReceived: (data: EnderecoData | null) => void;
}

export default function FetchCEPComponent({
  cep,
  onCEPDataReceived,
}: FetchCEPComponentProps) {
  const { toastError, toastSuccess } = ToastNotifications();

  useEffect(() => {
    const validateCEP = async () => {
      if (cep) {
        const cepUnmasked = cep.replace(/[-]/g, "");
        try {
          const response = await axios.post(`${apiBaseUrl}/find-CEP`, {
            cep: cepUnmasked,
          });
          if (response.status === 201) {
            toastSuccess(response.data.message);
            onCEPDataReceived(response.data.dataAddress);
          } else {
            toastError(response.data.message);
            onCEPDataReceived(null);
          }
        } catch (error) {
          console.error("Houve um erro inesperado", error);
          toastError("Erro ao validar o CEP.");
        }
      }
    };

    validateCEP();
  }, [cep]);

  return null;
}
