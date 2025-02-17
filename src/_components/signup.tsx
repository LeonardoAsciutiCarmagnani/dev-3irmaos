import { useState } from "react";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  IdCard,
  Phone,
  House,
  MapPinnedIcon,
  CheckIcon,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { useForm, SubmitHandler } from "react-hook-form";
import { useAuthStore } from "../context/authStore";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  updateProfile,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import axios from "axios";
import apiBaseUrl from "../lib/apiConfig";
import { useNavigate } from "react-router-dom";
import ToastNotifications from "../_components/Toasts";
import InputMask from "react-input-mask";
import { FirebaseError } from "firebase/app";
import FetchCEPComponent from "../_components/fetchCEP";
import type { EnderecoData } from "../_components/fetchCEP";
import { cpf } from "cpf-cnpj-validator";

interface FormCreateUser {
  name: string;
  email: string;
  cpf: string;
  password: string;
  confirmPassword: string;
  phoneNumber: string;
  CEP: string;
  numberHouse: string;
  neighborhood: string;
  locality: string;
  IBGE: string;
  uf: string;
  address: string;
}

const SignupForm = () => {
  const [cpfSuccess, setCPFSuccess] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toastError, toastSuccess } = ToastNotifications();
  const { setIsCreatingUser } = useAuthStore();
  const [addressData, setAddessData] = useState<EnderecoData | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    getValues,
  } = useForm<FormCreateUser>({
    mode: "onBlur",
  });

  const validateCPFOrCNPJ = (value: string) => {
    // Validação de CPF
    if (!cpf.isValid(value)) {
      toastError("Por favor, insira um CPF válido.");
      setCPFSuccess(false);
    } else {
      setCPFSuccess(true);
    }
  };

  const handleCreateUser: SubmitHandler<FormCreateUser> = async (data) => {
    console.log("HandleCreateUser chamado");

    if (data.password !== data.confirmPassword) {
      toastError("As senhas não coincidem.");
      return;
    }

    let userCredential = null;
    setError(null);
    setIsCreatingUser(true);

    try {
      console.log("Criando usuário no Firebase...");
      userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      console.log("Usuário criado no Auth, user:", user);

      console.log("Atualizando perfil do usuário no Firebase...");
      await updateProfile(user, { displayName: data.name });

      console.log("Fazendo requisição ao backend...");

      const cpfUnmasked = data.cpf.replace(/[.-]/g, "");
      const cepUnmasked = data.CEP.replace(/[-]/g, "");
      const phoneNumberUnmasked = data.phoneNumber.replace(/[()\s.-]/g, "");
      console.log(phoneNumberUnmasked);
      const response = await axios.post(`${apiBaseUrl}/create-user`, {
        user_id: user.uid,
        name: data.name,
        email: data.email,
        cpf: cpfUnmasked,
        password: data.password,
        numberHouse: data.numberHouse,
        phoneNumber: phoneNumberUnmasked,
        CEP: cepUnmasked,
        IBGE: Number(addressData?.ibge),
        bairro: addressData?.bairro,
        localidade: addressData?.localidade,
        logradouro: addressData?.logradouro,
        uf: addressData?.uf,
        type_user: "common",
      });
      console.log("Dados do form: ", data);
      console.log("Resposta do backend:", response);
      if (response.status === 201) {
        toastSuccess(
          "Cadastro realizado com sucesso. Por favor, entre novamente."
        );
        navigate("/login");
      } else {
        throw new Error(
          `Erro ao registrar no backend. Status: ${response.status}`
        );
      }
    } catch (err) {
      if (err instanceof Error) {
        const firebaseError = err as FirebaseError;
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            setError("Este email já está em uso.");
            toastError("Este email já está em uso.");
            break;
          case "auth/invalid-email":
            setError("O email fornecido é inválido.");
            toastError("O email fornecido é inválido.");
            break;
          case "auth/weak-password":
            setError("A senha é muito fraca.");
            toastError("A senha é muito fraca.");
            break;
          default:
            setError(err.message);
            toastError(err.message);
            console.error("Erro ao criar usuário:", err);
        }
      } else {
        setError("Ocorreu um erro desconhecido");
        toastError("Ocorreu um erro desconhecido");
        console.error("Erro inesperado:", err);
      }
      if (userCredential?.user) {
        try {
          await deleteUser(userCredential.user);
          console.log("Usuário deletado do Firebase:", userCredential.user.uid);
        } catch (deleteError) {
          console.error(
            "Erro ao deletar usuário do Firebase:",
            userCredential.user.uid,
            deleteError
          );
        }
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Criar conta
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Erro!</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form className="space-y-3" onSubmit={handleSubmit(handleCreateUser)}>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Nome completo
              </label>
              <div className="mt-1 relative flex flex-col">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-store-primary" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="João Silva"
                  {...register("name", {
                    required: "Nome é obrigatório",
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.name
                      ? "border-store-primary border-[0.12rem] bg-red-50/60"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                E-mail
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-store-primary" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="seuemail@exemplo.com"
                  {...register("email", {
                    required: "E-mail é obrigatório",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: "Endereço de e-mail inválido",
                    },
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.email
                      ? "border-store-primary border-[0.12rem] bg-red-50/60"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Telefone
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-store-primary" />
                </div>
                <InputMask
                  mask="(99) 99999-9999"
                  id="phone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  {...register("phoneNumber", {
                    required: "Telefone é obrigatório.",
                  })}
                  className={`appearance-none block w-full pl-10 pr-3 py-2 border ${
                    errors.phoneNumber
                      ? "border-store-primary border-[0.12rem] bg-red-50/60"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="cpf"
                className="block text-sm font-medium text-gray-700"
              >
                CPF
              </label>
              <div className="flex items-center gap-x-4">
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <IdCard className="h-5 w-5 text-store-primary" />
                  </div>
                  <InputMask
                    mask="999.999.999-99"
                    id="cpf"
                    {...register("cpf", {
                      required: "O CPF é obrigatório",
                      onBlur: (e) => validateCPFOrCNPJ(e.target.value),
                      validate: (value) => {
                        const cpf = value.replace(/[.-]/g, "");
                        if (cpf.length !== 11) return "CPF inválido";

                        return true;
                      },
                    })}
                    placeholder="123.456.789-00"
                    className="appearance-none block w-[16rem] pl-10 pr-3 py-2 border border-gray-300
                   rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-ptext-store-primary focus:border-store-primary"
                  />
                </div>
                <div>
                  {cpfSuccess && (
                    <span>
                      <CheckIcon className="h-8 w-8 text-green-600" />
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-x-3">
              <div>
                <label
                  htmlFor="CEP"
                  className="block text-sm font-medium text-gray-700"
                >
                  CEP
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinnedIcon className="h-5 w-5 text-store-primary" />
                  </div>
                  <div className="w-full pl-10">
                    <InputMask
                      mask="99999-999"
                      type="text"
                      {...register("CEP", { required: "O CEP é obrigatório" })}
                      onBlur={() => trigger("CEP")}
                      placeholder="CEP"
                      className={`flex text-center text-sm appearance-none w-full pr-3 py-2 border ${
                        errors.CEP
                          ? "border-store-primary border-[0.12rem] bg-red-50/60"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                    />
                    <FetchCEPComponent
                      cep={getValues("CEP")}
                      onCEPDataReceived={(cepData) => setAddessData(cepData)}
                    />
                  </div>
                </div>
              </div>
              <div>
                <label
                  htmlFor="houseNumber"
                  className="block text-nowrap text-sm font-medium text-gray-700"
                >
                  Número da casa
                </label>
                <div className="mt-1 relative">
                  <div>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <House className="h-5 w-5 text-store-primary" />
                    </div>
                    <input
                      id="numberHouse"
                      type="number"
                      placeholder="123"
                      {...register("numberHouse", {
                        required: "Número da casa é obrigatório",
                      })}
                      className={`appearance-none block w-[10rem] pl-10 pr-10 py-2 border justify-center${
                        errors.numberHouse
                          ? "border-store-primary border-[0.12rem] bg-red-50/60"
                          : "border-gray-300"
                      } rounded-md shadow-sm placeholder-gray-400 text-sm focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-store-primary" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  autoComplete="new-password"
                  {...register("password", {
                    required: "A senha é obrigatória",
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.password
                      ? "border-store-primary border-[0.12rem] bg-red-50/60"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-store-primary" />
                  ) : (
                    <Eye className="h-5 w-5 text-store-primary" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirmar senha
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-store-primary" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  autoComplete="new-password"
                  {...register("confirmPassword", {
                    required: "A confirmação de senha é obrigatória",
                    validate: (value) =>
                      value === getValues("password") ||
                      "As senhas não coincidem",
                  })}
                  className={`appearance-none block w-full pl-10 pr-10 py-2 border ${
                    errors.confirmPassword
                      ? "border-store-primary border-[0.12rem] bg-red-50/60"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-store-primary  hover:bg-store-hover-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-primary"
            >
              Registrar
            </button>

            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Já possui uma conta?
                <a
                  href="/login"
                  className="ml-2 font-medium text-store-primary hover:text-store-primary"
                >
                  Entrar
                </a>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
