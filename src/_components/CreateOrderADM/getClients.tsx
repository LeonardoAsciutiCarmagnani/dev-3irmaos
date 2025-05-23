import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, FileText, Mail, MapPin, Phone, User } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { Client } from "@/interfaces/Client";
import { collection, onSnapshot, query } from "firebase/firestore";
import { db } from "../Utils/FirebaseConfig";

interface GetClientsProps {
  selectedClient: Client | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
}

const GetClients = ({ selectedClient, setSelectedClient }: GetClientsProps) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const collectionRef = collection(db, "clients");
    const q = query(collectionRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const updatedData = snapshot.docs.map((doc) => ({
        ...(doc.data() as Client),
      }));
      setClients(updatedData);
    });

    return () => unsubscribe();
  }, []);

  const label = selectedClient ? selectedClient.name : "Selecione...";

  return (
    <div className="flex items-start rounded-xs p-4 w-[120vh] justify-start gap-x-10 border border-gray-200 shadow-md shadow-gray-200 h-fit">
      <div>
        <div>
          <h1 className="text-md font-semibold text-red-900">Cliente</h1>
        </div>
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[15rem] justify-between rounded-xs font-normal text-base"
              >
                {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[30rem] p-0 rounded-xs">
              <Command>
                <CommandInput placeholder="Busque pelo nome" />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup className="">
                    {clients.map((client) => {
                      const searchValue = client.name.toLowerCase();

                      return (
                        <CommandItem
                          key={client.Id}
                          value={searchValue}
                          onSelect={(currentValue) => {
                            const client =
                              clients.find(
                                (c) => c.name.toLowerCase() === currentValue
                              ) || null;

                            setSelectedClient(client);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4 text-red-900",
                              selectedClient?.Id === client.Id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {client.name} - {client.phone}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 px-2 items-start place-items-center ">
          {/* Informações Pessoais */}
          <div className="space-y-1 flex flex-col items-start">
            <div className="flex items-center">
              <User className="text-red-900 mr-2" size={25} />
              <h3 className="text-red-900 font-semibold">Dados pessoais</h3>
            </div>

            <div className="pl-1 space-y-1">
              {/* <p className="font-medium text-lg text-gray-800">
                {selectedClient.name}
              </p> */}

              <div className="flex items-center text-gray-600">
                <Phone size={20} className="mr-2 flex-shrink-0 text-gray-900" />
                <p>{selectedClient.phone}</p>
              </div>

              <div className="flex items-center text-gray-600">
                <Mail size={20} className="mr-2 flex-shrink-0 text-gray-900" />
                <p className="break-all max-w-[16rem] text-nowrap truncate">
                  {selectedClient.email}
                </p>
              </div>

              <div className="flex items-center text-gray-600">
                <FileText
                  size={20}
                  className="mr-2 flex-shrink-0 text-gray-900"
                />
                <p>{selectedClient.document}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="flex flex-col items-start">
            <div className="flex items-center mb-2">
              <MapPin className="text-red-900 mr-2" size={25} />
              <h3 className="text-red-900 font-semibold">Endereço</h3>
            </div>

            <div className="pl-1 space-y-0.5 text-gray-600">
              <p>
                {selectedClient.address.street}, {selectedClient.address.number}
              </p>
              <p>{selectedClient.address.neighborhood}</p>
              <p>
                {selectedClient.address.city} - {selectedClient.address.state}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetClients;
