import { FileBoxIcon, Home } from "lucide-react";
import { useState } from "react";

const Sidebar = () => {
  const [open, setOpen] = useState(true);

  const clientMenuItems = [
    { label: "Tela inicial", icon: <Home className="size-6" /> },
    { label: "Orçamentos", icon: <FileBoxIcon className="size-6" /> },
  ];
  return (
    <div className="p-4">
      {clientMenuItems.map((item) => (
        <div
          key={item.label}
          className="flex items-center gap-2 p-2 hover:bg-gray-200 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          {item.icon}
          {open && <span>{item.label}</span>}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
