import React, { useEffect, useMemo, useState } from "react";
import { firestore } from "@/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  TableFooter,
} from "@/components/ui/table";
import { LucideTrash2 } from "lucide-react";
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
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { setTotal } = usePostOrderStore();

  // Fetch de produtos da Firestore
  const fetchProducts = async () => {
    try {
      const docRef = doc(firestore, "prices_lists", priceListId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const priceListData = docSnap.data()?.products;
        if (priceListData) {
          setProducts(priceListData);
        } else {
          console.error("Nenhum produto encontrado na lista de preços.");
        }
      } else {
        console.error("Documento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao recuperar produtos:", error);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
  };

  const handleAddProduct = (event: React.MouseEvent) => {
    event.preventDefault();

    const product = products.find((p) => p.id === selectedProductId);
    if (product && quantity > 0) {
      const newProduct = { product, quantity };
      const updatedProducts = [...selectedProducts, newProduct];
      onProductSelect(updatedProducts);

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
    if (priceListId) {
      fetchProducts();
    }
  }, [priceListId, setTotal]);

  return (
    <div className="p-[0.45rem]">
      {/* Dropdown para selecionar produtos */}
      <div className="mb-4">
        <Select onValueChange={handleSelectProduct} value={selectedProductId}>
          <SelectTrigger className="w-full md:w-1/2 lg:w-1/3">
            {selectedProductId
              ? products.find((product) => product.id === selectedProductId)
                  ?.nome
              : "Selecione um Produto"}
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Input para quantidade */}
      <div className="mb-4">
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
          className="w-full md:w-20"
        />
      </div>

      {/* Botão para adicionar o produto */}
      <div className="mb-4">
        <Button onClick={handleAddProduct} className="w-full md:w-auto">
          Adicionar
        </Button>
      </div>

      {/* Tabela para exibir produtos selecionados */}
      <div>
        <Table className="w-full max-w-full overflow-x-hidden">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 p-2 text-center text-xs text-gray-700">
                Produto
              </TableHead>
              <TableHead className="w-1/4 p-2 text-center text-xs text-gray-700">
                Valor
              </TableHead>
              <TableHead className="w-[1rem] p-1 text-center text-xs text-gray-700">
                Qtd
              </TableHead>
              <TableHead className="w-1/4 p-1 text-center text-xs text-gray-700">
                Ações
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedProducts.map((item) => (
              <TableRow key={item.product.id} className="hover:bg-gray-50">
                <TableCell className="p-2 text-xs text-center font-medium text-gray-800 whitespace-wrap">
                  {item.product.nome}
                </TableCell>
                <TableCell className="p-2 text-xs text-center font-medium text-gray-800 whitespace-nowrap">
                  {item.product.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell className="p-2 text-center font-medium text-gray-800">
                  {item.quantity}
                </TableCell>
                <TableCell className="p-2 text-center">
                  <Button
                    variant="outline"
                    onClick={() => onRemoveProduct(item.product.id)}
                    className="text-red-500 hover:bg-red-100"
                  >
                    <LucideTrash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell
                colSpan={3}
                className="text-right font-bold p-3 text-gray-800"
              >
                Total:
              </TableCell>
              <TableCell className="p-3 text-xs font-medium text-gray-800">
                {totalFormatted}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default ProductSelector;
