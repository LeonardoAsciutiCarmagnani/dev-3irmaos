import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import InputMask from "react-input-mask";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { cpf, cnpj } from "cpf-cnpj-validator";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { api } from "@/lib/axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";
import { useZustandContext } from "@/context/cartContext";
import axios from "axios";
import { CheckCircleIcon, CircleXIcon } from "lucide-react";

interface CreateUserProps {
  userName: string;
  userEmail: string;
  userPassword: string;
  CPF: string;
  phone: string;
  IE: string;
  fantasyName: string;
  neighborhood: string;
  cep: string;
  ibge: string;
  complement: string;
  logradouro: string;
  number: number;
}

interface CepData {
  bairro: string;
  ibge: number;
  localidade: string;
  logradouro: string;
  uf: string;
}

export const Register = () => {
  const { priceLists, fetchPriceLists } = useZustandContext();
  const { register, handleSubmit, watch, setValue, getValues } =
    useForm<CreateUserProps>();
  const [selectState, setSelectState] = useState("");
  const [selectPriceList, setSelectPriceList] = useState({ id: "", name: "" });
  const [isCpf, setIsCpf] = useState(true);

  const [endereco, setEndereco] = useState<CepData | null>(null);
  const [cepError, setCepError] = useState<React.ReactNode | null>(null);
  const [cepSucess, setCepSucess] = useState<React.ReactNode | null>(null);
  const [cpfCnpjError, setCpfCnpjError] = useState("");

  const cpfOrCnpjValue = watch("CPF");
  const cepValue = watch("cep");

  const toggleCpfCnpj = () => {
    setIsCpf((prev) => !prev);
  };

  const validateCPFOrCNPJ = (value: string) => {
    if (isCpf) {
      // Validação de CPF
      if (!cpf.isValid(value)) {
        setCpfCnpjError("CPF inválido");
      } else {
        setCpfCnpjError("");
      }
    } else {
      // Validação de CNPJ
      if (!cnpj.isValid(value)) {
        setCpfCnpjError("CNPJ inválido");
      } else {
        setCpfCnpjError("");
      }
    }
  };

  const fetchCEP = async (cep: string) => {
    try {
      setCepError("");
      const response = await axios.post(
        "https://us-central1-server-kyoto.cloudfunctions.net/api/v1/CEP",
        { cep }
      );

      const enderecoData = response.data.endereco;

      if (!enderecoData) {
        setCepError(<CircleXIcon size={30} color="red" />);
        setCepSucess(null);
        setEndereco(null);
        setValue("neighborhood", "");
        setValue("logradouro", "");
        setValue("ibge", "");
      } else {
        setEndereco(enderecoData);
        setCepSucess(<CheckCircleIcon size={30} color="green" />);
        setCepError(null);
        setValue("neighborhood", enderecoData.bairro);
        setValue("logradouro", enderecoData.logradouro);
        setValue("ibge", String(enderecoData.ibge));
      }
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      setCepError("Erro ao buscar o endereço. Tente novamente.");
    }
  };

  const handleFetchCEP = async () => {
    const values = getValues();
    console.log("Valor do cep:" + values.cep);
    const rawCep = cepValue.replace(/[^\d]/g, "");
    console.log("RawCep:", rawCep);
    if (!rawCep || rawCep.length !== 8) {
      setCepError("Insira um CEP válido.");
      setEndereco(null);
      return;
    }
    try {
      await fetchCEP(cepValue);
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      setCepError("Erro ao buscar o endereço.");
    }
  };

  const determineMask = () => {
    return isCpf ? "999.999.999-99" : "99.999.999/9999-99";
  };

  const handleCreateUser = async (data: CreateUserProps) => {
    if (!endereco) {
      setCepError("Por favor, preencha um CEP válido.");
      return;
    }
    let userCredential = null;
    let userId = null;

    try {
      const temporaryPassword = Math.random().toString(36).slice(-10);
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.userEmail,
        temporaryPassword
      );
      const user = userCredential.user;
      userId = user.uid;

      await updateProfile(user, { displayName: data.userName });

      const response = await api.post("/v1/create-user", {
        user_id: userId,
        id_priceList: selectPriceList.id,
        priceListName: selectPriceList.name,
        type_user: selectState,
        user_name: data.userName,
        user_email: data.userEmail,
        user_CPF: data.CPF,
        user_phone: data.phone,
        user_IE: data.IE || "",
        user_fantasyName: data.fantasyName || "",
        user_neighborhood: data.neighborhood,
        user_cep: data.cep,
        user_ibgeCode: data.ibge,
        user_complement: data.complement || "",
        user_logradouro: data.logradouro,
        user_houseNumber: data.number,
      });

      if (response.status !== 200) {
        await deleteUser(userCredential.user);
        throw new Error("Falha ao criar o usuário no back-end.");
      }
      await sendPasswordResetEmail(auth, data.userEmail);
      console.log("Usuário cadastrado com sucesso!");
    } catch (e) {
      console.error("Erro ao criar o usuário", e);
      if (userCredential?.user) {
        await deleteUser(userCredential.user);
      }
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  return (
    <div className="w-screen h-screen flex justify-center items-center p-4 bg-gray-100">
      <div className="flex flex-col w-full max-w-lg border border-gray-300 shadow-lg rounded-lg bg-white p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-700 text-center">
          Cadastro de Usuário
        </h1>
        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-6">
          <Accordion type="multiple" className="space-y-4">
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-700">
                Informações do Usuário
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div>
                  <label htmlFor="userName" className="text-gray-600">
                    Nome do Cliente:
                  </label>
                  <Input
                    id="userName"
                    type="text"
                    placeholder="Digite o nome do usuário"
                    className="w-full mt-1"
                    {...register("userName")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="userEmail" className="text-gray-600">
                    Email:
                  </label>
                  <Input
                    id="userEmail"
                    type="email"
                    placeholder="Digite o email para acesso"
                    className="w-full mt-1"
                    {...register("userEmail")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-gray-600">
                    Telefone:
                  </label>
                  <InputMask
                    mask={"(99) 99999-9999"}
                    id="phone"
                    type="tel"
                    placeholder="Informe o telefone"
                    className="w-full mt-1"
                    {...register("phone")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="CPF" className="text-gray-600">
                    {isCpf ? "CPF" : "CNPJ"}
                  </label>
                  <InputMask
                    mask={determineMask()}
                    maskChar={null}
                    value={cpfOrCnpjValue}
                    {...register("CPF", {
                      onBlur: (e) => {
                        validateCPFOrCNPJ(e.target.value);
                      },
                    })}
                  >
                    {(inputProps) => (
                      <Input
                        {...inputProps}
                        id="CPF"
                        placeholder="Informe o CPF ou CNPJ"
                        className="w-full mt-1"
                        required
                      />
                    )}
                  </InputMask>
                  {cpfCnpjError && (
                    <span className="text-red-600">{cpfCnpjError}</span>
                  )}
                </div>

                {/* Botão para alternar entre CPF e CNPJ */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    type="button"
                    onClick={toggleCpfCnpj}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Alterar para {isCpf ? "CNPJ" : "CPF"}
                  </button>
                </div>
                {isCpf ? null : (
                  <div>
                    <label htmlFor="IE" className="text-gray-600">
                      Inscrição Estadual:
                    </label>
                    <Input
                      id="IE"
                      type="text"
                      placeholder="Inscrição estadual"
                      className="w-full mt-1"
                      {...register("IE")}
                    />
                  </div>
                )}
                {isCpf ? null : (
                  <div>
                    <label htmlFor="fantasyName" className="text-gray-600">
                      Nome Fantasia:
                    </label>
                    <Input
                      id="fantasyName"
                      type="text"
                      placeholder="Digite o Nome Fantasia"
                      className="w-full mt-1"
                      {...register("fantasyName")}
                    />
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-700">
                Endereço
              </AccordionTrigger>
              <AccordionContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <label htmlFor="cep" className="text-gray-600">
                    CEP:
                  </label>
                  <InputMask
                    mask={"99999-999"}
                    id="cep"
                    type="text"
                    placeholder="Informe seu CEP"
                    className="w-min mt-1"
                    {...register("cep", { onBlur: handleFetchCEP })}
                    required
                  />
                  {cepError && (
                    <span className="text-red-600 px-2 text-sx antialiased">
                      {cepError}
                    </span>
                  )}
                  {cepSucess && <span>{cepSucess}</span>}
                </div>
                <div>
                  <label htmlFor="neighborhood" className="text-gray-600">
                    Bairro:
                  </label>
                  <Input
                    id="neighborhood"
                    type="text"
                    placeholder="Informe seu bairro"
                    className="w-full mt-1"
                    {...register("neighborhood")}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="ibge" className="text-gray-600">
                    Código IBGE:
                  </label>
                  <Input
                    id="ibge"
                    type="text"
                    placeholder="Informe o código IBGE"
                    className="w-full mt-1"
                    {...register("ibge")}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <label htmlFor="logradouro" className="text-gray-600">
                    Logradouro:
                  </label>
                  <Input
                    id="logradouro"
                    type="text"
                    placeholder="Informe seu logradouro"
                    className="w-full mt-1"
                    {...register("logradouro")}
                    required
                    readOnly
                  />
                </div>
                <div>
                  <div>
                    <label htmlFor="number" className="text-gray-600">
                      Número:
                    </label>
                    <Input
                      id="number"
                      type="number"
                      placeholder="Informe o número"
                      className="w-full mt-1"
                      {...register("number")}
                      required
                    />
                  </div>
                  <label htmlFor="complement" className="text-gray-600">
                    Complemento:
                  </label>
                  <Input
                    id="complement"
                    type="text"
                    placeholder="Complemento"
                    className="w-full mt-1"
                    {...register("complement")}
                  />
                </div>
              </AccordionContent>
            </AccordionItem>

            <Select onValueChange={(value) => setSelectState(value)}>
              <SelectTrigger className="w-full mt-2 bg-gray-100 rounded-md border border-gray-300">
                <SelectValue placeholder="Permissões de usuário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="adm">Administrador</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>

            {selectState === "cliente" && (
              <Select
                onValueChange={(value) => {
                  const selected = priceLists.find((item) => item.id === value);
                  if (selected) {
                    setSelectPriceList(selected);
                  }
                }}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Lista de preços" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Lista padrão</SelectItem>
                  {priceLists.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </Accordion>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
          >
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
};
