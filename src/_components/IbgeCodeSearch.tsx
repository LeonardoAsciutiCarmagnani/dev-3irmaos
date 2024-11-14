import React, { useState } from "react";
import axios from "axios";

// Definindo as interfaces para os tipos de dados da API
interface Municipio {
  id: number;
  nome: string;
}

interface Estado {
  nome: string;
  municipios: Municipio[];
}

const IbgeCodeSearch: React.FC = () => {
  const [estado, setEstado] = useState<string>("");
  const [cidade, setCidade] = useState<string>("");
  const [codigoIbge, setCodigoIbge] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>(""); // Tipando o estado do erro como string

  const IbgeCodeSearch = async (): Promise<void> => {
    setLoading(true);
    setError("");

    try {
      // Fazendo a requisição à API do IBGE
      const estadosResponse = await axios.get<Estado[]>(
        `https://servicodados.ibge.gov.br/api/v2/censos/municipios`
      );
      const estados = estadosResponse.data;

      // Encontrando o estado pelo nome
      const estadoEncontrado = estados.find(
        (estado) =>
          estado.nome.toLowerCase() === estado.nome.toLocaleLowerCase()
      );

      if (estadoEncontrado) {
        // Encontrando a cidade dentro do estado encontrado
        const cidadeEncontrada = estadoEncontrado.municipios.find(
          (municipio) => municipio.nome.toLowerCase() === cidade.toLowerCase()
        );

        if (cidadeEncontrada) {
          setCodigoIbge(cidadeEncontrada.id);
        } else {
          setError("Cidade não encontrada.");
        }
      } else {
        setError("Estado não encontrado.");
      }
    } catch (error: unknown) {
      // Tipando o error como unknown
      // Verificando se o erro é uma string ou um objeto com mensagem
      if (axios.isAxiosError(error)) {
        setError(
          error.response?.data?.message || "Erro ao buscar código IBGE."
        );
      } else if (error instanceof Error) {
        setError(error.message); // Caso o erro seja uma instância de Error
      } else {
        setError("Erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Digite o estado"
        value={estado}
        onChange={(e) => setEstado(e.target.value)}
      />
      <input
        type="text"
        placeholder="Digite a cidade"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
      />
      <button onClick={IbgeCodeSearch}>Buscar Código IBGE</button>

      {loading && <p>Carregando...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {codigoIbge && <p>Código IBGE: {codigoIbge}</p>}
    </div>
  );
};

export default IbgeCodeSearch;
