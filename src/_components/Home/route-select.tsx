import { useState, useEffect, useRef } from "react";
// import {
//   Select,
//   SelectTrigger,
//   SelectValue,
//   SelectContent,
//   SelectItem,
// } from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";

const categorias = [
  "antiguidades",
  "janelas e esquadrias",
  "assoalhos, escadas, decks e forros",
  "portas sob medida",
  "portas pronta entrega",
  "bancadas, móveis e painéis",
];

export function RouteSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Recupera o parâmetro 'c' da URL, se existir
  const initialParam = searchParams.get("c") || "";
  const [value, setValue] = useState<string>(initialParam);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sincroniza o estado do select com o parâmetro da URL
  useEffect(() => {
    const currentCategory = searchParams.get("c") || "";
    if (currentCategory !== value) {
      setValue(currentCategory);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    // Navega para produtos com o parâmetro selecionado
    navigate(`/produtos?c=${encodeURIComponent(newValue)}`);
  };

  return (
    <div className="mb-4 flex items-center justify-center w-full md:hidden">
      <div ref={dropdownRef} className="relative w-full max-w-xs">
        {/* Trigger do dropdown */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white border-b-2 border-red-900 text-gray-800 font-medium transition-all duration-200 focus:outline-none group"
        >
          <span
            className={`capitalize tracking-wide ${
              !value ? "text-gray-500" : "text-gray-900"
            }`}
          >
            {value || "Selecione uma rota"}
          </span>
          <ChevronDown
            size={16}
            className={`transition-transform duration-300 text-red-900 group-hover:text-red-800 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Menu dropdown */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1 bg-white shadow-md z-300 border-t border-gray-100">
            <div className="py-1">
              {categorias.map((categoria) => (
                <button
                  key={categoria}
                  onClick={() => {
                    handleValueChange(categoria);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left transition-all duration-200 capitalize hover:bg-gray-50 ${
                    value === categoria
                      ? "font-medium text-red-900 bg-gray-50 border-l-2 border-red-900"
                      : "text-gray-700 border-l-2 border-transparent"
                  }`}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
