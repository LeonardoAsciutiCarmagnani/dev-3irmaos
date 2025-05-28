import { useState, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useAuthStore } from "@/context/authContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import { cpf, cnpj } from "cpf-cnpj-validator";
import { Badge } from "@/components/ui/badge";
import axios from "axios";
import logo from "@/assets/logo_3irmaos.png";
import { api } from "@/lib/axios";
import Loader from "@/_components/Loader/loader";
import PasswordRecovery from "@/_components/ForgotPassword/forgotPassword";

// Schemas
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

const registerSchema = z
  .object({
    name: z.string().min(3, "Nome deve ter pelo menos 3 caracteres."),
    email: z.string().email("E-mail inválido").trim().toLowerCase(),
    document: z.string().refine((value) => {
      const cleaned = value.replace(/\D/g, "");
      return cleaned.length === 11
        ? cpf.isValid(cleaned)
        : cnpj.isValid(cleaned);
    }, "Documento inválido."),
    phone: z.string().min(15, "Telefone inválido."),
    ie: z.string().optional(),
    fantasyName: z.string().optional(),
    address: z.object({
      cep: z.string().length(9, "CEP inválido."),
      street: z.string().min(3, "Logradouro inválido."),
      number: z.coerce.number().min(1, "Número inválido."),
      neighborhood: z.string().min(2, "Bairro inválido."),
      city: z.string().min(2, "Cidade inválida."),
      state: z.string().length(2, "UF inválida."),
      ibge: z.string().min(7, "Código IBGE inválido."),
    }),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres."),
    confirmPassword: z
      .string()
      .min(6, "Senha deve ter pelo menos 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

type LoginData = z.infer<typeof loginSchema>;
type RegisterData = z.infer<typeof registerSchema>;

const Auth: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isIndividual, setIsIndividual] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      document: "",
      phone: "",
      ie: "",
      fantasyName: "",
      address: {
        cep: "",
        street: "",
        number: 0,
        neighborhood: "",
        city: "",
        state: "",
        ibge: "",
      },
      password: "",
      confirmPassword: "",
    },
  });

  const fetchAddress = useCallback(
    async (cep: string) => {
      try {
        const { data } = await axios.get(
          `https://viacep.com.br/ws/${cep}/json/`
        );
        if (data.erro) toast.error("CEP inválido ou não encontrado");

        registerForm.setValue("address.street", data.logradouro);
        registerForm.setValue("address.neighborhood", data.bairro);
        registerForm.setValue("address.city", data.localidade);
        registerForm.setValue("address.state", data.uf);
        registerForm.setValue("address.ibge", data.ibge);
        registerForm.setValue("address.cep", data.cep);

        toast.success("Endereço encontrado com sucesso!");
      } catch (error) {
        toast.error("CEP inválido ou não encontrado");
        console.error(error);
        registerForm.resetField("address.cep");
      }
    },
    [registerForm]
  );

  const handleLogin = async (data: LoginData) => {
    try {
      setIsLoading(true);
      await login(data.email.trim(), data.password.trim());

      navigate("/");
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterData) => {
    try {
      // Adapt this to your API implementation
      await api.post("/create-client", {
        name: data.name,
        email: data.email,
        document: data.document,
        phone: data.phone,
        ie: data.ie,
        fantasyName: data.fantasyName,
        address: {
          cep: data.address.cep,
          street: data.address.street,
          number: data.address.number,
          neighborhood: data.address.neighborhood,
          city: data.address.city,
          state: data.address.state,
          ibge: data.address.ibge,
        },
        password: data.password,
      });

      toast.success("Registro realizado com sucesso!", { id: "reg-success" });
      setMode("login");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao registrar usuário.", { id: "reg-error" });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-xs shadow-lg flex flex-col max-h-[90vh] overflow-y-auto">
      {mode === "login" && (
        <div className="w-full flex justify-center">
          <img src={logo} alt="" className="mb-[1rem] w-[60%]" />
        </div>
      )}
      <div className="flex justify-center mb-6 space-x-4">
        <Button
          variant={mode === "login" ? "default" : "ghost"}
          onClick={() => setMode("login")}
          className="rounded-xs"
        >
          Entrar
        </Button>
        <Button
          variant={mode === "register" ? "default" : "ghost"}
          onClick={() => setMode("register")}
          className="rounded-xs"
        >
          Registrar
        </Button>
      </div>

      {mode === "login" && (
        <Form {...loginForm}>
          <form
            onSubmit={loginForm.handleSubmit(handleLogin)}
            className="space-y-4"
          >
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="seu@exemplo.com"
                      className="rounded-xs"
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
                  <FormLabel>Senha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        {...field}
                        placeholder="••••••••"
                        className="pr-10 rounded-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        aria-label={
                          showPassword ? "Ocultar senha" : "Mostrar senha"
                        }
                      >
                        {showPassword ? (
                          <EyeOffIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full rounded-xs">
              Entrar
            </Button>
            <div className="mt-2 ">
              <h1>
                Esqueceu sua senha? Clique{" "}
                <span>
                  <PasswordRecovery />
                </span>{" "}
                para recuperar.
              </h1>
            </div>
          </form>
        </Form>
      )}

      {mode === "register" && (
        <>
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

          <Form {...registerForm}>
            <form
              onSubmit={registerForm.handleSubmit(handleRegister)}
              className="space-y-4"
            >
              <FormField
                control={registerForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isIndividual ? "Nome Completo *" : "Razão Social *"}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          isIndividual
                            ? "Seu nome completo"
                            : "Razão social da empresa"
                        }
                        className="rounded-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="seu@exemplo.com"
                        className="rounded-xs"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <IMaskInput
                        mask="(00) 00000-0000"
                        placeholder="(00) 00000-0000"
                        value={field.value}
                        onAccept={(value) => field.onChange(value)}
                        className="flex h-10 w-full rounded-xs border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={registerForm.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{isIndividual ? "CPF *" : "CNPJ *"}</FormLabel>
                    <FormControl>
                      <IMaskInput
                        mask={
                          isIndividual ? "000.000.000-00" : "00.000.000/0000-00"
                        }
                        placeholder={
                          isIndividual ? "000.000.000-00" : "00.000.000/0000-00"
                        }
                        value={field.value}
                        onAccept={(value) => field.onChange(value)}
                        className="flex h-10 w-full rounded-xs border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    name="ie"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inscrição estadual</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Inscrição estadual" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={registerForm.control}
                    name="fantasyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome Fantasia *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Nome fantasia da empresa"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h3 className="font-medium mb-3">Endereço</h3>

                <FormField
                  control={registerForm.control}
                  name="address.cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP *</FormLabel>
                      <div className="flex space-x-2">
                        <FormControl>
                          <IMaskInput
                            mask="00000-000"
                            placeholder="00000-000"
                            value={field.value}
                            onAccept={(value) => field.onChange(value)}
                            className="flex h-10 w-full rounded-xs border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            const cleaned = field.value.replace(/\D/g, "");
                            if (cleaned.length === 8) {
                              fetchAddress(field.value);
                            } else {
                              toast.error("CEP inválido");
                            }
                          }}
                          className="h-10 rounded-xs hover:bg-red-900 hover:text-white"
                        >
                          Buscar
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={registerForm.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Logradouro *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="rounded-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min="0"
                            className="rounded-xs"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={registerForm.control}
                    name="address.neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="rounded-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={registerForm.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade *</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly className="rounded-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            placeholder="••••••••"
                            className="pr-10 rounded-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center rounded-xs"
                            aria-label={
                              showPassword ? "Ocultar senha" : "Mostrar senha"
                            }
                          >
                            {showPassword ? (
                              <EyeOffIcon className="h-5 w-5" />
                            ) : (
                              <EyeIcon className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Confirmar Senha *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            {...field}
                            placeholder="••••••••"
                            className="pr-10 rounded-xs"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-6 rounded-xs bg-red-900"
              >
                Registrar
              </Button>
            </form>
          </Form>
        </>
      )}
      {isLoading && <Loader />}
    </div>
  );
};

export default Auth;
