import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UnauthenticatedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-400 p-6 Z-100">
      <h1>Cu preto</h1>
    </div>
  );
}
