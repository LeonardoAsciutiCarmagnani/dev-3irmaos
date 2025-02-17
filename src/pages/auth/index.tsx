import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import logo from "../../assets/logo.jpeg";
import ForgotPassword from "../../_components/forgotpassword";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import ToastNotifications from "../../_components/Toasts";
import { useAuthStore } from "../../context/authStore";
import { useForm } from "react-hook-form";
import { Input } from "../../components/ui/input";
import useUserStore from "../../context/UserStore";

interface FormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const { handleSubmit, register } = useForm<FormData>();
  const [showPassword, setShowPassword] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toastSuccess, toastError } = ToastNotifications();
  const { setUser } = useAuthStore();
  const { fetchUserName } = useUserStore();

  const handleUserLogin = async (data: FormData) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      const user = userCredential.user;
      const userCredentials = {
        uid: user.uid,
        email: user.email,
        accessToken: await user.getIdToken(),
      };
      setUser(userCredentials);
      localStorage.setItem("loggedUser", JSON.stringify(userCredentials));
      const username = await fetchUserName();
      localStorage.setItem("username", username?.toString() || "");

      setError("");
      navigate("/");
      toastSuccess("Login realizado com sucesso!");
    } catch (error) {
      console.error("Erro de autenticação:", error);
      toastError("Login ou senha incorretos.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src={logo}
            alt="exata"
            className="size-[9rem] rounded-full object-cover border-[0.1rem] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 antialiased transform-gpu"
          />
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-6">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 rounded-md">
          <form className="space-y-6" onSubmit={handleSubmit(handleUserLogin)}>
            <h2 className="text-center text-3xl font-extrabold text-gray-900">
              Entrar
            </h2>
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
                <Input
                  id="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary"
                  placeholder="seuemail@exemplo.com"
                  {...register("email", { required: "E-mail é obrigatório." })}
                />
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
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-store-primary focus:border-store-primary"
                  placeholder="********"
                  {...register("password", {
                    required: "Senha é obrigatória.",
                  })}
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
              <div className="mt-2 flex items-center justify-end">
                <div className="text-sm">
                  <ForgotPassword />
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-store-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-store-primary"
              >
                Entrar
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Não tem uma conta?
                    <a
                      href="/signup"
                      className="ml-2 font-medium text-store-primary hover:text-store-hover-primary"
                    >
                      Registre-se
                    </a>
                  </span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
