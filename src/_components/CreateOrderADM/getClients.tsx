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

const GetClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client>();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

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

  return (
    <div className="flex items-start gap-x-[7rem] rounded-xs p-2 w-full justify-evenly">
      <div>
        <div>
          <h1 className="text-md text-red-900">Cliente</h1>
        </div>
        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-[30rem] justify-between rounded-xs font-normal text-base"
              >
                {value
                  ? clients.find((client) => client.Id === value)?.name
                  : "Selecione..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[30rem] p-0 rounded-xs">
              <Command>
                <CommandInput placeholder="Busque pelo nome" />
                <CommandList>
                  <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
                  <CommandGroup className="">
                    {clients.map((client) => (
                      <CommandItem
                        key={client.Id}
                        value={client.Id}
                        onSelect={(currentValue) => {
                          setValue(currentValue === value ? "" : currentValue);
                          setSelectedClient(
                            clients.find((client) => client.Id === currentValue)
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4 text-red-900",
                            value === client.Id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {client.name} - {client.phone}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedClient && (
        <div className="grid grid-cols-1 md:grid-cols-2 px-2 py-2 items-start place-items-center shadow-md">
          {/* Informações Pessoais */}
          <div className="space-y-3 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <User className="text-red-800 mr-2" size={20} />
              <h3 className="text-red-800 font-semibold">
                Informações Pessoais
              </h3>
            </div>

            <div className="pl-7 space-y-2">
              <p className="font-medium text-gray-800">{selectedClient.name}</p>

              <div className="flex items-center text-gray-600">
                <Phone size={16} className="mr-2 flex-shrink-0" />
                <p>{selectedClient.phone}</p>
              </div>

              <div className="flex items-center text-gray-600">
                <Mail size={16} className="mr-2 flex-shrink-0" />
                <p className="break-all truncate">{selectedClient.email}</p>
              </div>

              <div className="flex items-center text-gray-600">
                <FileText size={16} className="mr-2 flex-shrink-0" />
                <p>{selectedClient.document}</p>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-3 flex flex-col items-start">
            <div className="flex items-center mb-2">
              <MapPin className="text-red-800 mr-2" size={20} />
              <h3 className="text-red-800 font-semibold">Endereço</h3>
            </div>

            <div className="pl-7 space-y-2 text-gray-600">
              <p>
                {selectedClient.address.street}, {selectedClient.address.number}
              </p>
              <p>{selectedClient.address.neighborhood}</p>
              <p>{selectedClient.address.city}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetClients;
