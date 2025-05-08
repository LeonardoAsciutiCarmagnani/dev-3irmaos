// src/components/Login.tsx
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/context/authContext";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema de validação de formulário
const formSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

type FormSchema = z.infer<typeof formSchema>;

type LoginProps = {
  onSwitchToRegister: () => void;
};

const Login: React.FC<LoginProps> = () => {
  const { login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleUserLogin = async (data: FormSchema) => {
    try {
      await login(data.email.trim(), data.password.trim());
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toast.error("Login ou senha incorretos.", {
        id: "login-error",
      });
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center w-full p-4">
        {/* Formulário de login */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleUserLogin)}
            className="space-y-4"
          >
            {/* Campo E-mail */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="seu@exemplo.com"
                      className="w-full text-sm"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Campo Senha com toggle de visibilidade */}
            <FormField
              control={form.control}
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
                        className="w-full pr-10 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
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
                </FormItem>
              )}
            />

            {/* Botões de ação */}
            <div className="flex flex-col space-y-2">
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
};

export default Login;
