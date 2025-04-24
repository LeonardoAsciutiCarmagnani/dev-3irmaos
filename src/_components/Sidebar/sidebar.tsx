import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useAuthStore } from "@/context/authContext";
import {
  ArrowRight,
  CircleIcon,
  Home,
  PackageSearchIcon,
  ScrollTextIcon,
} from "lucide-react";
import React, { useEffect } from "react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const location = useLocation();
  const { search } = useLocation();
  const currentCat = new URLSearchParams(search).get("c") || "";

  const defaultMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
  ];

  const clientMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
  ];

  const adminMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
    {
      label: "Orçamentos",
      path: "/adm/pedidos-e-orçamentos",
      icon: <ScrollTextIcon className="text-red-900 size-6" />,
    },
  ];

  const menuItems = React.useMemo(() => {
    if (!user) {
      return defaultMenuItems;
    }

    return user.role === "admin" ? adminMenuItems : clientMenuItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    setOpen(false);
  }, [location]);

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
            open ? "justify-end" : "justify-center"
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
          {menuItems.map((item) => (
            <div
              key={item.label}
              className="flex font-semibold items-center p-2 hover:bg-[#c9c6c6] hover:text-white cursor-pointer text-[0.97rem] text-slate-700"
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
                flex items-center p-1.5 cursor-pointer
                hover:bg-red-900 hover:text-white
                data-[state=open]:bg-red-900 text-slate-700 data-[state=open]:text-white data-[state=open]:shadow-sm shadow-gray-500 
                rounded-none
              "
            >
              <PackageSearchIcon className="size-6 transform data-[state=open]:rotate-none" />
              {open && (
                <span className="text-[0.97rem] font-semibold">Produtos</span>
              )}
            </AccordionTrigger>
            {open && (
              <AccordionContent className="pt-1 pb-2 text-xs border-b-5 border-outset">
                <ul className="space-y-0.5">
                  {categorias.map((cat) => {
                    const catKey = cat.toLowerCase();
                    const isCatActive = currentCat === catKey;

                    return (
                      <NavLink
                        key={cat}
                        to={{
                          pathname: "/",
                          search: `?c=${encodeURIComponent(catKey)}`,
                        }}
                        className={() =>
                          `block px-2 py-1 transition-colors pl-2 text-gray-700 ${
                            isCatActive
                              ? "bg-gray-200 text-red-900 font-bold"
                              : "hover:bg-gray-200 hover:text-slate-800 hover:underline font-semibold"
                          }`
                        }
                      >
                        <div className="flex items-center gap-x-3 text-[0.8rem]">
                          <span>
                            <CircleIcon size={6} className="fill-gray-800" />
                          </span>
                          <span className="text-xs md:text-sm">{cat}</span>
                        </div>
                      </NavLink>
                    );
                  })}
                </ul>
              </AccordionContent>
            )}
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Sidebar;
