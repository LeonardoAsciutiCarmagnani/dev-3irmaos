import { useState, useEffect } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";

const categorias = [
  "Antiguidades",
  "Janelas e Esquadrias",
  "Assoalhos, Escadas, Decks e Forros",
  "Portas Sob Medida",
  "Portas Pronta Entrega",
  "Bancadas, Móveis e Painéis",
];

export function RouteSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Recupera o parâmetro 'c' da URL, se existir
  const initialParam = searchParams.get("c") || "Selecione";
  const [value, setValue] = useState<string>(initialParam);

  // Sincroniza o estado do select com o parâmetro da URL
  useEffect(() => {
    const currentCategory = searchParams.get("c") || "Selecione";
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
    <div className="mb-2 flex items-center justify-center w-full md:hidden">
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger className="hover:cursor-default w-full max-w-xs text-center rounded-none font-semibold border-2 border-red-900 shadow-sm shadow-gray-200 text-gray-700 focus:outline-none focus:ring-0 focus:ring-offset-0">
          <SelectValue
            placeholder="Selecione uma categoria"
            className="hover:cursor-default"
          />
        </SelectTrigger>
        <SelectContent className="z-[10000] rounded-none border-none shadow-sm shadow-gray-300 focus:outline-none focus:ring-0 font-semibold text-gray-700">
          {categorias.map((categoria) => (
            <SelectItem key={categoria} value={categoria}>
              {categoria}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
