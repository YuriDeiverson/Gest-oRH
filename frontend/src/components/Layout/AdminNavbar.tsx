import React from "react";
import { Menu, UserCircle, LogOut } from "lucide-react";

interface AdminNavbarProps {
  onToggleSidebar?: () => void;
  adminName?: string;
  onLogout?: () => void;
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
  adminName = "Admin",
  onLogout,
}) => {
  return (
    <header className="w-full bg-white shadow-md border-b px-6 py-3 flex justify-between items-center fixed top-0 left-0 z-50">
      {/* Botão Menu */}
      <button
        onClick={onToggleSidebar}
        className="p-2 rounded-lg hover:bg-gray-100 transition"
      >
        <Menu size={22} />
      </button>

      {/* Nome do admin */}
      <h1 className="text-lg font-semibold text-gray-800">
        Painel Administrativo
      </h1>

      {/* Avatar / Menu */}
      <div className="flex items-center gap-3">
        <span className="font-medium text-gray-700 hidden sm:block">
          {adminName}
        </span>
        <UserCircle size={32} className="text-gray-700" />

        {onLogout && (
          <button
            onClick={onLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition"
          >
            <LogOut size={18} />
            Sair
          </button>
        )}
      </div>
    </header>
  );
};

export default AdminNavbar;
