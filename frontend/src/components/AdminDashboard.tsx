// AdminDashboardNew.tsx - Página completa com Navbar integrada
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminNavbar from "./Layout/AdminNavbar";
import { api } from "../services/api";

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  pendingIntentions: number;
  totalIntentions: number;
  totalReferrals: number;
}

const AdminDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/api/admin/dashboard");
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-center">Carregando...</div>;
  if (!stats)
    return (
      <div className="p-6 text-center text-red-600">
        Erro ao carregar dados do dashboard
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <h2 className="text-2xl font-semibold mb-8 text-gray-800">
          Visão geral
        </h2>

        {/* Grid de indicadores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-start">
            <p className="text-gray-500 text-sm">Membros cadastrados</p>
            <span className="text-3xl font-bold text-blue-600">
              {stats.totalMembers}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-start">
            <p className="text-gray-500 text-sm">Membros ativos</p>
            <span className="text-3xl font-bold text-green-600">
              {stats.activeMembers}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-start">
            <p className="text-gray-500 text-sm">Indicações pendentes</p>
            <span className="text-3xl font-bold text-yellow-600">
              {stats.pendingIntentions}
            </span>
          </div>

          <div className="bg-white p-6 rounded-xl shadow flex flex-col items-start">
            <p className="text-gray-500 text-sm">Total de Indicações</p>
            <span className="text-3xl font-bold text-purple-600">
              {stats.totalIntentions}
            </span>
          </div>
        </div>

        {/* Cards extras */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              Indicações (últimos 30 dias)
            </h3>
            <p className="text-4xl font-bold text-blue-500">
              {stats.totalReferrals}
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">Gerenciar membros</h3>
            <button
              onClick={() => navigate("/admin/members")}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
            >
              Acessar lista de membros
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardNew;
