import ClientOrdersTable from "@/_components/Orders/ClientOrders";

const ClientOrdersPage = () => {
  return (
    <div className="h-full w-full bg-gray-50 items-center justify-center md:p-2">
      <ClientOrdersTable />
    </div>
  );
};

export default ClientOrdersPage;
