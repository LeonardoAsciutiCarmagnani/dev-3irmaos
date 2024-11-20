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
import { Product } from "@/context/cartContext";

interface ProductSelectorProps {
  onProductSelect: (products: { product: Product; quantity: number }[]) => void;
  selectedProducts: { product: Product; quantity: number }[];
  onRemoveProduct: (productId: string) => void;
  onTotalChange: (total: number) => void;
  priceListId: string;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  selectedProducts,
  onRemoveProduct,
  priceListId,
  onTotalChange,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

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
    setSelectedProductId(productId);
  };

  const handleAddProduct = (event: React.MouseEvent) => {
    event.preventDefault();

    const product = products.find((p) => p.id === selectedProductId);
    if (product && quantity > 0) {
      const newProduct = { product, quantity };
      const updatedProducts = [...selectedProducts, newProduct];
      onProductSelect(updatedProducts);

      const total = calculateTotal();
      onTotalChange(total);

      setQuantity(1);
      setSelectedProductId("");
    }
  };

  const calculateTotal = () => {
    const total = selectedProducts.reduce(
      (total, item) => total + item.product.preco * item.quantity,
      0
    );
    console.log("total calculado no filho", total.toFixed(2));
    return total;
  };

  return (
    <div className="p-4">
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
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/4 p-1 text-center">Produto</TableHead>
              <TableHead className="w-1/4 p-1 text-center">Valor</TableHead>
              <TableHead className="w-1/4 p-1 text-center">
                Quantidade
              </TableHead>
              <TableHead className="w-1/4 p-1 text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="">
            {selectedProducts.map((item) => (
              <TableRow key={item.product.id}>
                <TableCell className="p-1 text-xs text-center">
                  {item.product.nome}
                </TableCell>
                <TableCell className="p-1 text-xs">
                  {item.product.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </TableCell>
                <TableCell className="p-1 text-center">
                  {item.quantity}
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    onClick={() => onRemoveProduct(item.product.id)}
                  >
                    <LucideTrash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={3} className="text-right font-bold p-1">
                Total:
              </TableCell>
              <TableCell className="p-1">
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
