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
} from "@/components/ui/table";
import { LucideTrash2 } from "lucide-react";

type Product = {
  id: string;
  name: string;
  value: number;
};

interface ProductSelectorProps {
  onProductSelect: (product: Product) => void;
  selectedProducts: Product[];
  onRemoveProduct: (productId: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  onProductSelect,
  selectedProducts,
  onRemoveProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);

  const fetchProducts = async () => {
    try {
      const docRef = doc(firestore, "default_prices-list", "DEFAULT");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const priceListData = docSnap.data()?.products;
        setProducts(priceListData || []);
      } else {
        console.error("Documento não encontrado");
      }
    } catch (error) {
      console.error("Erro ao recuperar produtos:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSelectProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      onProductSelect(product);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dropdown para selecionar produtos */}
      <Select onValueChange={handleSelectProduct}>
        <SelectTrigger className="w-full">Selecione um Produto</SelectTrigger>
        <SelectContent>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Table para exibir produtos selecionados */}
      <div className="mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {selectedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.value}</TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    onClick={() => onRemoveProduct(product.id)}
                  >
                    <LucideTrash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ProductSelector;
