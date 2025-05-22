import { ProductsInOrderProps } from "@/interfaces/Order";
import { useState, useEffect } from "react";

type Props = {
  orderId: number;
  product: ProductsInOrderProps;
  onChange: (
    orderId: number,
    productId: string,
    altura?: string,
    largura?: string,
    comprimento?: string
  ) => void;
};

export function ProductDimensionInput({ orderId, product, onChange }: Props) {
  const [altura, setAltura] = useState(product.altura?.toString() || "");
  const [largura, setLargura] = useState(product.largura?.toString() || "");
  const [comprimento, setComprimento] = useState(
    product.comprimento?.toString() || ""
  );

  const productId = product.selectedVariation.id;

  // atualiza localmente se mudar fora (ex: reset global)
  useEffect(() => {
    setAltura(product.altura?.toString() || "");
    setLargura(product.largura?.toString() || "");
    setComprimento(product.comprimento?.toString() || "");
  }, [product]);

  const handleBlur = () => {
    onChange(orderId, productId, altura, largura, comprimento);
  };

  return (
    <div className="flex flex-col gap-1 items-start justify-center text-sm text-gray-500">
      <div className="flex items-center gap-1">
        Altura:
        <input
          value={altura}
          onChange={(e) => setAltura(e.target.value)}
          onBlur={handleBlur}
          className="w-[3rem] border text-center"
        />
        m
      </div>

      <div className="flex items-center gap-1">
        Largura:
        <input
          value={largura}
          onChange={(e) => setLargura(e.target.value)}
          onBlur={handleBlur}
          className="w-[3rem] border text-center"
        />
        m
      </div>

      <div className="flex items-center gap-1">
        {[
          "Janelas e Esquadrias",
          "Portas Pronta Entrega",
          "Portas Sob Medida",
        ].includes(product.categoria)
          ? "Batente (Espessura da parede)"
          : "Comprimento"}
        <input
          value={comprimento}
          onChange={(e) => setComprimento(e.target.value)}
          onBlur={handleBlur}
          className="w-[3rem] border text-center"
        />
        m
      </div>
    </div>
  );
}
