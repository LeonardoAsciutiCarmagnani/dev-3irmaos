import { Badge } from "@/components/ui/badge";
import { useCallback, useState } from "react";
import { z } from "zod";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { IMaskInput } from "react-imask";
import { Button } from "@/components/ui/button";

import { EyeIcon, EyeOffIcon } from "lucide-react";
import Loader from "../Loader/loader";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../Utils/FirebaseConfig";
import { api } from "@/lib/axios";

import { collection, getDocs, query, where } from "firebase/firestore";
import { useAuthStore } from "@/context/authContext";

const formSchema = z.object({
  Name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
  Email: z.string().email("E-mail inválido").trim().toLowerCase(),
  Document: z.string().refine((value) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.length === 11 ? cpf.isValid(cleaned) : cnpj.isValid(cleaned);
  }, "Documento inválido."),
  Phone: z.string().min(15, "Telefone inválido."),
  IE: z.string().optional(),
  FantasyName: z.string().optional(),
  Address: z.object({
    Cep: z.string().length(9, "CEP inválido."),
    Street: z.string().min(3, "Logradouro inválido."),
    Number: z.coerce.number().min(1, "Número inválido."),
    Neighborhood: z.string().min(2, "Bairro inválido."),
    City: z.string().min(2, "Cidade inválida."),
    State: z.string().length(2, "UF inválida."),
    Ibge: z.string().min(7, "Código IBGE inválido."),
    Complement: z.string().optional(),
  }),
  Password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
  ConfirmPassword: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
});

const formLoginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormLoginSchema = z.infer<typeof formLoginSchema>;
type FormSchema = z.infer<typeof formSchema>;

type Props = {
  open: boolean;
  mode: "login" | "register";
  onModeChange: (m: "login" | "register") => void;
  onClose: () => void;
};

const AuthModal = ({ open, mode, onModeChange, onClose }: Props) => {
  const [isIndividual, setIsIndividual] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuthStore();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const loginForm = useForm<FormLoginSchema>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Name: "",
      Email: "",
      Document: "",
      Phone: "",
      IE: "",
      FantasyName: "",
      Address: {
        Cep: "",
        Street: "",
        Number: 0,
        Neighborhood: "",
        City: "",
        State: "",
        Ibge: "",
        Complement: "",
      },
      Password: "",
      ConfirmPassword: "",
    },
  });

  const fetchAddress = useCallback(
    async (cep: string) => {
      try {
        const { data } = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (data.erro) toast.error("CEP inválido ou não encontrado");

        registerForm.setValue("Address.Street", data.logradouro);
        registerForm.setValue("Address.Neighborhood", data.bairro);
        registerForm.setValue("Address.City", data.localidade);
        registerForm.setValue("Address.State", data.uf);
        registerForm.setValue("Address.Ibge", data.ibge);
        registerForm.setValue(
          "Address.Complement",
          data.complemento || "Não informado"
        );
        toast.success("Endereço encontrado com sucesso!", {
          id: "address-found",
          duration: 1900,
        });
      } catch (error) {
        toast.error("CEP inválido ou não encontrado");
        console.error(error);
        registerForm.resetField("Address.Cep");
      }
    },
    [registerForm]
  );

  const onSubmit = async (values: FormSchema) => {
    setIsSubmitting(true);

    try {
      const clientsRef = collection(db, "clients");

      const queryDocument = query(
        clientsRef,
        where("document", "==", values.Document)
      );
      const querySnapshotDocument = await getDocs(queryDocument);

      const queryEmail = query(clientsRef, where("email", "==", values.Email));
      const querySnapshotEmail = await getDocs(queryEmail);

      if (!querySnapshotEmail.empty) {
        toast.error("Já existe um usuário cadastrado com este e-mail.");
        return;
      }

      if (!querySnapshotDocument.empty) {
        toast.error("Já existe um usuário cadastrado com este documento.");
        return;
      }

      if (values.Password !== values.ConfirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }

      const createdUser = await api.post("/create-client", {
        name: values.Name,
        email: values.Email,
        document: values.Document,
        phone: values.Phone,
        ie: values.IE,
        fantasyName: values.FantasyName,
        address: {
          cep: values.Address.Cep,
          street: values.Address.Street,
          number: values.Address.Number,
          neighborhood: values.Address.Neighborhood,
          city: values.Address.City,
          state: values.Address.State,
          ibge: values.Address.Ibge,
          complement: values.Address.Complement,
        },
        password: values.Password,
      });

      const { data } = createdUser.data;

      await signInWithEmailAndPassword(auth, data.email, values.Password);

      registerForm.reset();

      toast.success("Conta criada com sucesso!", {
        id: "reg-success",
        description: `Bem vindo (a) ${data.name}! Agora você pode prosseguir com seu orçamento.`,
        duration: 10000,
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      toast.error("Erro ao cadastrar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUserLogin = async (data: FormLoginSchema) => {
    try {
      await login(data.email.trim(), data.password.trim());
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toast.error("E-mail ou senha incorretos.", {
        id: "login-error",
      });
    }
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/50" onClick={onClose} />

          {/* Modal Content */}
          <div className="relative bg-white w-[calc(100vw-3rem)] md:w-[calc(100vw-40rem)] rounded-xs shadow-lg max-h-fit overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b-1 bg-whitesticky top-0 w-full rounded-t-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    {mode === "login"
                      ? "Entre com sua conta"
                      : "Crie sua conta"}
                  </h2>
                  <div className="text-sm text-gray-600 mt-1">
                    {mode === "login" ? (
                      <div className="flex flex-col items-start justify-between">
                        <div>
                          Para continuar, precisamos que entre com sua conta
                        </div>
                        <div className="flex items-center gap-x-1 w-full justify-start">
                          <h1>Ainda não possui uma conta?</h1>
                          <Button
                            variant="link"
                            className="px-1 py-0 text-red-900 font-bold"
                            onClick={() => onModeChange("register")}
                          >
                            Criar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-start justify-between">
                        <div>
                          Para continuar, precisamos que crie uma conta.
                        </div>
                        <div className="flex items-center gap-x-1 w-full justify-start font-semibold">
                          <h1>Já possui uma conta?</h1>
                          <Button
                            variant="link"
                            className="px-1 py-0 text-red-900 font-bold"
                            onClick={() => onModeChange("login")}
                          >
                            Entrar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-120px)]">
              {mode === "login" && (
                <div className="space-y-4">
                  <Form {...loginForm}>
                    <form
                      onSubmit={loginForm.handleSubmit(handleUserLogin)}
                      className="space-y-4"
                    >
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha *</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input
                                  {...field}
                                  type={showPassword ? "text" : "password"}
                                  className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                                />
                              </FormControl>
                              <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                              >
                                {showPassword ? (
                                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                ) : (
                                  <EyeIcon className="h-5 w-5 text-gray-500" />
                                )}
                              </button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="w-full flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="rounded-xs"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Entrando..." : "Entrar"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {mode === "register" && (
                <>
                  {/* Badges de seleção - apenas no registro */}
                  <div className="flex items-center justify-center gap-x-2 mb-4">
                    <Badge
                      variant={"secondary"}
                      onClick={() => setIsIndividual(true)}
                      className={`hover:cursor-pointer ${
                        isIndividual ? "bg-red-900 text-white" : ""
                      } rounded-xs`}
                    >
                      Pessoa Física
                    </Badge>
                    <Badge
                      variant={"secondary"}
                      onClick={() => setIsIndividual(false)}
                      className={`hover:cursor-pointer ${
                        !isIndividual ? "bg-red-900 text-white" : ""
                      } rounded-xs`}
                    >
                      Pessoa Jurídica
                    </Badge>
                  </div>

                  {/* Formulário de Registro */}
                  <Form {...registerForm}>
                    <form
                      className="space-y-3"
                      onSubmit={registerForm.handleSubmit(onSubmit)}
                    >
                      <FormField
                        control={registerForm.control}
                        name="Name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {isIndividual
                                ? "Nome Completo *"
                                : "Razão Social *"}
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="Email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail *</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="email"
                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="Phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone *</FormLabel>
                            <FormControl>
                              <IMaskInput
                                mask="(00) 00000-0000"
                                placeholder="(00) 00000-0000"
                                value={field.value}
                                onAccept={(value) => field.onChange(value)}
                                className="input border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm px-2.5 py-1.5 rounded-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="Document"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {isIndividual ? "CPF *" : "CNPJ *"}
                            </FormLabel>
                            <FormControl>
                              <IMaskInput
                                mask={
                                  isIndividual
                                    ? "000.000.000-00"
                                    : "00.000.000/0000-00"
                                }
                                placeholder={
                                  isIndividual
                                    ? "000.000.000-00"
                                    : "00.000.000/0000-00"
                                }
                                value={field.value}
                                onAccept={(value) => field.onChange(value)}
                                className="input border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm px-2.5 py-1.5 rounded-sm"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!isIndividual && (
                        <>
                          <FormField
                            control={registerForm.control}
                            name="IE"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Inscrição estadual</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={registerForm.control}
                            name="FantasyName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome Fantasia *</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm"
                                    required
                                  />
                                </FormControl>
                                <FormMessage className="mt-0 pt-2" />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <div className="flex flex-col space-y-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Endereço
                        </h2>
                        <div className="bg-white rounded-lg">
                          <FormField
                            control={registerForm.control}
                            name="Address.Cep"
                            render={({ field }) => (
                              <FormItem>
                                <div className="flex flex-col space-y-2">
                                  <FormLabel>CEP *</FormLabel>
                                  <div className="flex items-center space-x-2">
                                    <IMaskInput
                                      mask="00000-000"
                                      placeholder="00000-000"
                                      value={field.value}
                                      onAccept={(value) =>
                                        field.onChange(value)
                                      }
                                      className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-fit rounded p-2"
                                    />
                                    <Badge
                                      onClick={() => {
                                        const cleaned = field.value.replace(
                                          /\D/g,
                                          ""
                                        );
                                        if (cleaned.length === 8) {
                                          fetchAddress(field.value);
                                        }
                                      }}
                                      className="bg-red-900 text-white cursor-pointer text-xs rounded-xs"
                                    >
                                      Buscar
                                    </Badge>
                                  </div>
                                  <FormMessage />
                                </div>

                                <div className="mt-4 space-y-3">
                                  <FormField
                                    control={registerForm.control}
                                    name="Address.City"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Cidade *</FormLabel>
                                        <FormControl>
                                          <Input
                                            readOnly
                                            {...field}
                                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="Address.Neighborhood"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Bairro *</FormLabel>
                                        <FormControl>
                                          <Input
                                            readOnly
                                            {...field}
                                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={registerForm.control}
                                    name="Address.Street"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Logradouro *</FormLabel>
                                        <FormControl>
                                          <Input
                                            readOnly
                                            {...field}
                                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                                    <div className="flex items-center gap-x-2">
                                      <FormField
                                        control={registerForm.control}
                                        name="Address.Number"
                                        render={({ field }) => (
                                          <FormItem className="flex-1">
                                            <FormLabel>Número *</FormLabel>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                type="number"
                                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-[5rem] rounded p-2"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={registerForm.control}
                                        name="Address.Complement"
                                        render={({ field }) => (
                                          <FormItem className="flex-1">
                                            <FormLabel>Complemento</FormLabel>
                                            <FormControl>
                                              <Input
                                                {...field}
                                                type="text"
                                                className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-[14rem] rounded p-2"
                                              />
                                            </FormControl>
                                            <FormMessage />
                                          </FormItem>
                                        )}
                                      />
                                    </div>

                                    <FormField
                                      control={registerForm.control}
                                      name="Address.State"
                                      render={({ field }) => (
                                        <FormItem className="w-full sm:w-1/4">
                                          <FormLabel>UF *</FormLabel>
                                          <FormControl>
                                            <Input
                                              readOnly
                                              {...field}
                                              maxLength={2}
                                              className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="flex flex-col space-y-4">
                        <FormField
                          control={registerForm.control}
                          name="Password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Senha *</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    maxLength={20}
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  onClick={togglePasswordVisibility}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                  )}
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="ConfirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirmar Senha *</FormLabel>
                              <div className="relative">
                                <FormControl>
                                  <Input
                                    {...field}
                                    type={showPassword ? "text" : "password"}
                                    maxLength={20}
                                    className="border-gray-300 focus:border-red-500 focus:ring-red-500 text-sm w-full rounded p-2"
                                  />
                                </FormControl>
                                <button
                                  type="button"
                                  onClick={togglePasswordVisibility}
                                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                  {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5 text-gray-500" />
                                  ) : (
                                    <EyeIcon className="h-5 w-5 text-gray-500" />
                                  )}
                                </button>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="w-full flex justify-end pt-4">
                        <Button
                          type="submit"
                          className="rounded-xs"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? "Criando conta..." : "Criar conta"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </>
              )}
            </div>

            {/* Loader - renderizado condicionalmente */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Loader />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default AuthModal;
