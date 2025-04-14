import { ArrowRight, FileBoxIcon, Home } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const clientMenuItems = [
    { label: "Tela inicial", path: "/", icon: <Home className="size-6" /> },
    {
      label: "Orçamentos",
      icon: <FileBoxIcon className="size-6" />,
    },
  ];
  return (
    <div className="p-4">
      <div
        onClick={() => setOpen(!open)}
        className={`flex mb-2 w-full cursor-pointer ${
          open ? "justify-end" : "justify-center"
        }`}
      >
        <ArrowRight
          size={26}
          className={`text-slate-100 bg-gray-800 rounded-xs ${
            open ? "rotate-180" : ""
          }`}
        />
      </div>
      {clientMenuItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => navigate(`${item.path}`)}
        >
          {item.icon}
          {open && <span>{item.label}</span>}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
