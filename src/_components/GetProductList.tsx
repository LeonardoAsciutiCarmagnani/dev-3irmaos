import React, { useEffect, useMemo, useRef, useState } from "react";
import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { ChevronDownIcon, LucideTrash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Product } from "@/context/cartContext";
import { usePostOrderStore } from "@/context/postOrder";

interface ProductSelectorProps {
  onProductSelect: (products: { product: Product; quantity: number }[]) => void;
  selectedProducts: { product: Product; quantity: number }[];
  onRemoveProduct: (productId: string) => void;
  priceListId: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  selectedProducts,
  onRemoveProduct,
  priceListId,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { setTotal } = usePostOrderStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceListName, setPriceListName] = useState("");

  const filteredProducts = products.filter((product) =>
    product.nome.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fetch de produtos da Firestore
  const fetchProducts = async () => {
    console.log("priceListId: ", priceListId);

    try {
      let docRef;

      if (priceListId === "") {
        console.log("Usando a lista de preços padrão.");
        docRef = doc(firestore, "default_prices-list", "DEFAULT");
      } else {
        console.log(`Usando a lista de preços com ID: ${priceListId}`);
        docRef = doc(firestore, "prices_lists", priceListId);
      }

      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const priceListData = docSnap.data()?.products;
        const priceListName = docSnap.data()?.name;
        setPriceListName(priceListName);

        if (priceListData) {
          setProducts(priceListData);
          console.log("Produtos carregados com sucesso:", priceListData);
        } else {
          console.error("Nenhum produto encontrado na lista de preços.");
        }
      } else {
        console.error("Documento não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao recuperar produtos:", error);
    }
  };

  // const handleSelectProduct = (productId: string) => {
  //   setSelectedProductId(productId);
  // };

  const handleAddProduct = (event: React.MouseEvent) => {
    event.preventDefault();
    setSearchQuery("");

    const product = products.find((p) => p.id === selectedProductId);
    if (product && quantity > 0) {
      const newProduct = { product, quantity };
      const updatedProducts = [...selectedProducts, newProduct];
      onProductSelect(updatedProducts);
      console.log("UpdatedProducts: ", updatedProducts);

      const total = updatedProducts.reduce(
        (total, item) => total + item.product.preco * item.quantity,
        0
      );
      setTotal(total);

      setQuantity(1);
      setSelectedProductId("");
    }
  };

  const totalFormatted = useMemo(() => {
    const total = selectedProducts.reduce(
      (total, item) => total + item.product.preco * item.quantity,
      0
    );
    return total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }, [selectedProducts]);

  useEffect(() => {
    const total = selectedProducts.reduce(
      (total, item) => total + item.product.preco * item.quantity,
      0
    );
    setTotal(total);

    fetchProducts();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [priceListId, setTotal]);

  return (
    <div className="p-2 space-y-4">
      {/* Header da Lista de Preços */}
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            Lista de preços:
          </span>
          <span className="font-semibold text-blue-600 text-sm">
            {priceListName?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Área de Seleção de Produtos */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_100px_120px] gap-2">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 text-sm bg-white border rounded-lg transition-colors"
          >
            {selectedProductId
              ? products.find((p) => p.id === selectedProductId)?.nome
              : "Selecione um produto"}
            <ChevronDownIcon className="w-4 h-4 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              <div className="p-2 border-b">
                <input
                  type="text"
                  placeholder="Buscar produto..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full p-2 text-sm border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>

              <div className="divide-y">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(product.id);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full p-3 text-sm text-left hover:bg-blue-50 transition-colors flex items-center justify-between"
                  >
                    <span>{product.nome}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 font-medium">
                        {product.preco.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </span>
                      {product.categoria && (
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {product.categoria}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            min={1}
            className="w-full h-11"
          />
        </div>

        <Button
          onClick={handleAddProduct}
          className="h-11 whitespace-nowrap"
          disabled={!selectedProductId}
        >
          Adicionar
        </Button>
      </div>

      {/* Tabela de Produtos Selecionados */}
      <div className="border rounded-lg overflow-hidden flex flex-col max-h-[10.8rem]">
        {/* Header Fixo */}
        <div className="grid grid-cols-12 bg-gray-50 sticky top-0 p-2 border-b">
          <div className="col-span-6 text-xs font-semibold text-gray-600">
            Produto
          </div>
          <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
            Valor Unitário
          </div>
          <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
            Qtd
          </div>
          <div className="col-span-2 text-center text-xs font-semibold text-gray-600">
            Ações
          </div>
        </div>

        {/* Body com Scroll */}
        <div className="flex-1 overflow-y-auto">
          {selectedProducts.map((item) => (
            <div
              key={item.product.id}
              className="grid grid-cols-12 items-center hover:bg-gray-50/50 p-2 border-b"
            >
              <div className="col-span-6 text-sm font-medium text-gray-900 truncate">
                {item.product.nome}
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">
                {item.product.preco.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
              <div className="col-span-2 text-center text-sm text-gray-600">
                {item.quantity}
              </div>
              <div className="col-span-2 text-center">
                <Button
                  variant="ghost"
                  onClick={() => onRemoveProduct(item.product.id)}
                  className="text-red-600 hover:bg-red-100/50 hover:text-red-700"
                  size="sm"
                >
                  <LucideTrash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Fixo */}
        <div className="grid grid-cols-12 bg-gray-50 sticky bottom-0 p-2 border-t">
          <div className="col-span-10 text-right font-semibold">Total:</div>
          <div className="col-span-2 text-center font-semibold text-blue-600">
            {totalFormatted}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSelector;
