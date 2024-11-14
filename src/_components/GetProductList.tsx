import React, { useEffect, useState } from "react";
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

type Product = {
  id: string;
  name: string;
  value: number;
};

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
  const [selectedProductId, setSelectedProductId] = useState<string>(""); // Produto selecionado
  const [quantity, setQuantity] = useState<number>(1); // Quantidade do produto

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

  useEffect(() => {
    if (priceListId) {
      fetchProducts();
    }
  }, [priceListId]);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId); // Atualiza o ID do produto selecionado
  };

  const handleAddProduct = (event: React.MouseEvent) => {
    event.preventDefault(); // Impede o recarregamento da página

    const product = products.find((p) => p.id === selectedProductId);
    if (product && quantity > 0) {
      const newProduct = { product, quantity };
      const updatedProducts = [...selectedProducts, newProduct];
      onProductSelect(updatedProducts);

      // Limpar o valor do dropdown após adicionar o produto à tabela
      setQuantity(1); // Resetar quantidade após adicionar
      setSelectedProductId(""); // Resetar seleção de produto
    }
  };

  const calculateTotal = () => {
    return selectedProducts.reduce(
      (total, item) => total + item.product.value * item.quantity,
      0
    );
  };

  return (
    <div className="space-y-6">
      {/* Dropdown para selecionar produtos */}
      <div className="flex items-center space-x-2">
        <Select value={selectedProductId} onValueChange={handleSelectProduct}>
          <SelectTrigger className="w-full">
            {selectedProductId
              ? products.find((product) => product.id === selectedProductId)
                  ?.name
              : "Selecione um Produto"}
          </SelectTrigger>
          <SelectContent>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Input para quantidade */}
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min={1}
          className="w-min"
        />

        {/* Botão para adicionar o produto */}
        <Button variant="outline" onClick={handleAddProduct}>
          Adicionar
        </Button>
      </div>

      {/* Tabela para exibir produtos selecionados */}
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Quantidade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedProducts.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell>{item.product.name}</TableCell>
                <TableCell>
                  {item.product.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => onRemoveProduct(item.product.id)} // Usando a função onRemoveProduct diretamente
                  >
                    <LucideTrash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* Rodapé da Tabela */}
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-semibold">
                Total:
              </TableCell>
              <TableCell>
                {calculateTotal().toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
};

export default ProductSelector;
