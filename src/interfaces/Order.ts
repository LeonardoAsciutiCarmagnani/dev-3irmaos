export interface ProductsInOrderProps {
  id: number;
  nome: string;
  quantidade: number;
  preco: number;
  altura: number;
  largura: number;
  comprimento: number;
  listImages: { imagem: string }[];
  selectedVariation: { id: string; nomeVariacao: string };
}

export interface SellerProps {
  id: number;
  name: string;
}

export interface IClient {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface IDeliveryAddress {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  ibge: string;
}

interface IPaymentMethod {
  id: string;
  name: string;
}
interface DetailsPropostalProps {
  obs: string;
  payment: string;
  time: string;
  delivery: number;
}
export interface Order {
  id: number;
  client: IClient;
  deliveryAddress: IDeliveryAddress;
  products: ProductsInOrderProps[];
  orderId: number;
  codeHiper: string;
  idOrderHiper: string;
  orderStatus: number;
  totalValue: number;
  createdAt: string;
  paymentMethod?: IPaymentMethod;
  detailsPropostal: DetailsPropostalProps;
  imagesUrls: string[];
  clientImages: string[];
}
