import Orders from "@/_components/Orders/Orders";
import ClientOrdersTable from "@/_components/Orders/ClientOrders";
import { useAuthStore } from "@/context/authContext";

const OrdersPage = () => {
  const { user } = useAuthStore();

  console.log(user);
  return (
    <div className="h-full w-full bg-gray-50 items-center justify-center md:p-2">
      {user?.role !== "admin" ? <Orders /> : <ClientOrdersTable />}
    </div>
  );
};

export default OrdersPage;
