import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/context/authContext";
import { ArrowRight, CircleIcon, Home, PackageSearchIcon } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const defaultMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
  ];

  const clientMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
  ];

  const categorias = [
    "Portas, Vitrais e Grades Antigas",
    "Janelas e Esquadrias",
    "Assoalhos, Deck, Escada e Forro",
    "Portas Duplas, Pivotantes e Internas",
    "Portas Pronta Entrega",
    "Moveis, Painéis e Bancadas",
    "Outros",
  ];

  return (
    <div
      className={`flex flex-col justify-between transition-all duration-400 ${
        open ? "w-45" : "w-12"
      } pt-4`}
    >
      <div className="flex flex-col">
        {/* botão de expandir/colapsar toda a sidebar */}
        <div
          onClick={() => setOpen(!open)}
          className={`flex mb-2 px-2 cursor-pointer ${
            open ? "items-end" : "items-center"
          }`}
        >
          <ArrowRight
            size={26}
            className={`text-red-900 transition-transform duration-400 ${
              open ? "rotate-180" : ""
            }`}
          />
        </div>

        <div className="flex flex-col">
          {(user ? clientMenuItems : defaultMenuItems).map((item) => (
            <div
              key={item.label}
              className="flex items-center p-2 hover:bg-red-900 hover:text-white cursor-pointer text-[0.97rem] text-gray-800"
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {open && <span className="ml-2">{item.label}</span>}
            </div>
          ))}
        </div>

        <Accordion
          type="single"
          collapsible
          onValueChange={() => {
            setOpen(true);
          }}
        >
          <AccordionItem value="produtos" className="rounded-none">
            <AccordionTrigger
              className="
                flex items-center p-2 cursor-pointer
                hover:bg-red-900 hover:text-white
                data-[state=open]:bg-red-900 data-[state=open]:shadow-sm shadow-red-900 data-[state=open]:text-white
                rounded-none
              "
            >
              <PackageSearchIcon className="size-6 transform data-[state=open]:rotate-none" />
              {open && (
                <span className="text-[0.97rem] font-normal">Produtos</span>
              )}
            </AccordionTrigger>
            {open && (
              <AccordionContent className="pt-1 pb-2 text-xs border-b-3 border-red-900 ">
                <ul className="space-y-1">
                  {categorias.map((cat) => (
                    <NavLink
                      key={cat}
                      to={`/produtos/${cat.toLowerCase()}`}
                      className={({ isActive }) =>
                        `block px-2 py-1 transition-colors pl-2
                       ${
                         isActive
                           ? "bg-red-900 text-white "
                           : "hover:bg-red-900 hover:text-white hover:font-semibold"
                       }`
                      }
                    >
                      <div className="flex items-center justify-start gap-x-3 text-[0.8rem]">
                        <span>
                          <CircleIcon size={6} fill="darkred" />
                        </span>
                        <span>{cat}</span>
                      </div>
                    </NavLink>
                  ))}
                </ul>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>

        {/* === Outros itens de menu, sem Accordion === */}
      </div>
    </div>
  );
};

export default Sidebar;
