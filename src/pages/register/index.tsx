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
import { auth, firestore } from "../../firebaseConfig";
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
import { ArrowRightLeftIcon, CheckCircleIcon, CircleXIcon } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";
import ToastNotifications from "@/_components/Toasts";
import Sidebar from "@/_components/Sidebar";
import { useNavigate } from "react-router-dom";
import MaskedInput from "react-text-mask";

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

export default function Register() {
  const { priceLists, fetchPriceLists } = useZustandContext();
  const { toastSuccess, toastError } = ToastNotifications();
  const { register, handleSubmit, watch, setValue, getValues, trigger } =
    useForm<CreateUserProps>({
      defaultValues: {
        userName: "",
        userEmail: "",
        userPassword: "",
        CPF: "",
        phone: "",
        IE: "",
        fantasyName: "",
        neighborhood: "",
        cep: "",
        ibge: "",
        complement: "",
        logradouro: "",
        number: 0,
      },
    });
  const [selectState, setSelectState] = useState("");
  const [selectPriceList, setSelectPriceList] = useState({ id: "", name: "" });
  const [isCpf, setIsCpf] = useState(true);
  const [endereco, setEndereco] = useState<CepData | "">("");
  const [cepError, setCepError] = useState<React.ReactNode | "">("");
  const [cepSucess, setCepSucess] = useState<React.ReactNode | "">("");
  const [cpfCnpjError, setCpfCnpjError] = useState("");
  const [activeItem, setActiveItem] = useState<string | undefined>("item-1");
  const [isSubmitButtonDisabled, setIsSubmitButtonDisabled] = useState(true);

  // const cpfOrCnpjValue = watch("CPF");
  const cepValue = watch("cep");
  const navigate = useNavigate();

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

  const checkUserExistInFirestore = async (cpf: string) => {
    const q = query(
      collection(firestore, "clients"),
      where("user_CPF", "==", cpf)
    );

    try {
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return true; // CPF já existe
      } else {
        return false; // CPF não encontrado
      }
    } catch (error) {
      console.log(error);
      return false; // Caso haja erro na consulta
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
        setEndereco("");
        setValue("neighborhood", "");
        setValue("logradouro", "");
        setValue("ibge", "");
      } else {
        setEndereco(enderecoData);
        setCepSucess(<CheckCircleIcon size={30} color="green" />);
        setCepError(null);
        setValue("neighborhood", enderecoData.bairro ?? "");
        setValue("logradouro", enderecoData.logradouro ?? "");
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
      setCepSucess(null);
      setCepError("O CEP deve conter 8 dígitos.");
      setEndereco("");
      return;
    }
    try {
      await fetchCEP(cepValue);
    } catch (error) {
      console.error("Erro ao buscar o endereço:", error);
      setCepError("Erro ao buscar o endereço.");
    }
  };

  const determineMask = () =>
    isCpf
      ? [
          /\d/,
          /\d/,
          /\d/,
          ".",
          /\d/,
          /\d/,
          /\d/,
          ".",
          /\d/,
          /\d/,
          /\d/,
          "-",
          /\d/,
          /\d/,
        ]
      : [
          /\d/,
          /\d/,
          ".",
          /\d/,
          /\d/,
          /\d/,
          ".",
          /\d/,
          /\d/,
          /\d/,
          "/",
          /\d/,
          /\d/,
          /\d/,
          /\d/,
          "-",
          /\d/,
          /\d/,
        ];

  const handleCreateUser = async (data: CreateUserProps) => {
    const newUser = { ...data };
    const cpf = data.CPF.replace(/\D/g, "");
    const cpfExistente = await checkUserExistInFirestore(cpf);

    if (cpfExistente) {
      toastError("CPF/CNPJ já cadastrado.");
      return;
    }

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
        newUser.userEmail,
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
        user_CPF: data.CPF.replace(/\D/g, ""),
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
      } else {
        await sendPasswordResetEmail(auth, data.userEmail);
        toastSuccess("Usuário criado com sucesso!");
        navigate("/clients");
      }
    } catch (e) {
      console.error("Erro ao criar o usuário", e);
      if (userCredential?.user) {
        await deleteUser(userCredential.user);
      }
    }
  };

  const handleSelectTypeUser = (value: string) => {
    setSelectState(value);

    if (value) {
      setIsSubmitButtonDisabled(false);
    } else {
      setIsSubmitButtonDisabled(true);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  return (
    <div className="w-screen h-screen flex-col items-center place-items-center px-7 bg-gray-50 pt-5">
      <div className="mb-6 justify-self-start">
        <Sidebar />
      </div>
      <div className="flex flex-col w-full max-w-lg border border-gray-300 shadow-lg rounded-lg bg-white p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-gray-700 text-center">
          Cadastro de cliente
        </h1>

        <form onSubmit={handleSubmit(handleCreateUser)} className="space-y-4">
          <Accordion
            value={activeItem}
            onValueChange={(value) => setActiveItem(value)}
            type="single"
            className="space-y-2"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="font-semibold text-base md:text-lg text-gray-700">
                Informações do usuário
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
                    placeholder="Digite o e-mail para acesso"
                    className="w-full mt-1"
                    {...register("userEmail")}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-gray-600">
                    Telefone:
                  </label>
                  <MaskedInput
                    mask={[
                      "(",
                      /\d/,
                      /\d/,
                      ")",
                      " ",
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                      "-",
                      /\d/,
                      /\d/,
                      /\d/,
                      /\d/,
                    ]}
                    id="phone"
                    type="tel"
                    placeholder="Informe o telefone"
                    className="w-full mt-1"
                    {...register("phone")}
                    onChange={(e) => {
                      setValue("phone", e.target.value); // Atualiza o valor
                      trigger("phone"); // Valida e atualiza o estado
                    }}
                    value={watch("phone") || ""}
                    required
                  />
                </div>
                <div>
                  <div className="flex items-end gap-x-3">
                    <label htmlFor="CPF" className="text-gray-600">
                      {isCpf ? "CPF:" : "CNPJ:"}
                    </label>
                    <div className="flex items-center mt-1 w-full justify-end mr-1">
                      <span
                        onClick={toggleCpfCnpj}
                        className="flex items-center gap-x-1 cursor-pointer"
                      >
                        <ArrowRightLeftIcon className="h-4 w-4" color="black" />
                        <span className="text-[0.8rem] text-blue-600 font-bold">
                          {isCpf ? "CNPJ" : "CPF"}
                        </span>
                      </span>
                    </div>
                  </div>
                  <MaskedInput
                    mask={determineMask()}
                    placeholder={isCpf ? "Digite o CPF" : "Digite o CNPJ"}
                    className="w-full mt-1"
                    {...register("CPF", {
                      onBlur: (e) => validateCPFOrCNPJ(e.target.value),
                    })}
                    onChange={(e) => setValue("CPF", e.target.value)}
                    value={watch("CPF") || ""}
                    required
                  />

                  {cpfCnpjError && (
                    <span className="text-red-600">{cpfCnpjError}</span>
                  )}
                </div>

                {/* Botão para alternar entre CPF e CNPJ */}

                {isCpf ? null : (
                  <div>
                    <label htmlFor="IE" className="text-gray-600">
                      Inscrição Estadual:
                    </label>
                    <InputMask
                      id="IE"
                      mask={"999.999.999.999"}
                      placeholder="Inscrição Estadual"
                      alwaysShowMask
                      className="w-full mt-1"
                      {...register("IE")}
                      onChange={(e) => {
                        setValue("IE", e.target.value);
                        trigger("IE");
                      }}
                      value={watch("IE") ?? ""}
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
                      placeholder="Nome fantasia"
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
              <AccordionContent className="space-y-2">
                <div className="flex items-center space-x-2  justify-around">
                  <div className="flex flex-1 items-center justify-start">
                    <label htmlFor="cep" className="text-gray-600">
                      CEP:
                    </label>
                    <MaskedInput
                      mask={[
                        /\d/,
                        /\d/,
                        /\d/,
                        /\d/,
                        /\d/,
                        "-",
                        /\d/,
                        /\d/,
                        /\d/,
                      ]}
                      id="cep"
                      type="text"
                      placeholder="Informe o CEP"
                      className="w-[6rem] text-center rounded-md p-1 mt-1 text-xs"
                      {...register("cep", { onBlur: handleFetchCEP })}
                      onChange={(e) => {
                        setValue("cep", e.target.value);
                        trigger("cep");
                      }}
                      value={watch("cep") || ""}
                      required
                    />
                    <a
                      href="https://buscacepinter.correios.com.br/app/endereco/index.php"
                      target="_blank"
                      className="text-wrap text-xs relative left-10 pb-[0.1rem] border-b-[0.1rem] text-blue-300 border-outset border-blue-500 cursor-pointer hover:text-blue-700"
                    >
                      Ajuda com CEP ?
                    </a>
                  </div>
                  <div>
                    {cepError && (
                      <span className="text-red-600 px-2 text-sx antialiased">
                        {cepError}
                      </span>
                    )}
                    {cepSucess && <span>{cepSucess}</span>}
                  </div>
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
                </div>
                <div>
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

            <Select onValueChange={(value) => handleSelectTypeUser(value)}>
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
            disabled={isSubmitButtonDisabled}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-4"
          >
            Cadastrar
          </Button>
        </form>
      </div>
    </div>
  );
}
