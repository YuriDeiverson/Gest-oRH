import React, { useState, useRef, useEffect } from "react";
import { Home, Users, Briefcase, Calendar, Bell, ChevronDown, User, Settings, LogOut } from "lucide-react";

interface MemberNavbarProps {
  memberName?: string;
  activeTab: string;
  onTabChange: (tab: "business" | "referrals" | "opportunities" | "agendas" | "announcements") => void;
  onLogout?: () => void;
}

const MemberNavbar: React.FC<MemberNavbarProps> = ({
  memberName = "Membro",
  activeTab,
  onTabChange,
  onLogout,
}) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navigationItems = [
    {
      id: "home",
      label: "Início",
      icon: Home,
      tab: "business"
    },
    {
      id: "referrals",
      label: "Minhas Indicações",
      icon: Users,
      tab: "referrals"
    },
    {
      id: "opportunities",
      label: "Oportunidades",
      icon: Briefcase,
      tab: "opportunities",
    },
    {
      id: "agendas",
      label: "Agendas",
      icon: Calendar,
      tab: "agendas",
    },
    {
      id: "announcements",
      label: "Avisos",
      icon: Bell,
      tab: "announcements"
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.tab)}
                  className={`flex flex-col items-center px-3 py-2 text-xs font-medium transition-colors duration-200 min-w-[80px] ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 border-b-2 border-transparent hover:border-gray-200"
                  }`}
                >
                  <Icon size={20} className="mb-1" />
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Profile Menu */}
          <div className="relative" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center space-x-2 p-1 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[150px] truncate">
                {memberName}
              </span>
              <ChevronDown size={16} className="text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {isProfileMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{memberName}</p>
                  <p className="text-xs text-gray-500">Membro Premium</p>
                </div>
                
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings size={16} className="mr-3" />
                  Gerenciar assinatura
                </button>
                
                <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <User size={16} className="mr-3" />
                  Meu perfil
                </button>
                
                <hr className="my-1" />
                
                <button
                  onClick={onLogout}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  Sair
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 border-t border-gray-200">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.tab;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.tab)}
                  className={`flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-white"
                  }`}
                >
                  <Icon size={18} className="mr-3" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default MemberNavbar;