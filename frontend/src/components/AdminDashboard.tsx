import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { intentionService, memberService, setAdminToken, type Intention } from "../services/api";
import { config } from "../config/config";

interface Stats {
  activeMembers: number;
  monthlyReferrals: number;
  monthlyThanks: number;
}

export const AdminDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [intentions, setIntentions] = useState<Intention[]>([]);
  const [stats, setStats] = useState<Stats>({
    activeMembers: 0,
    monthlyReferrals: 0,
    monthlyThanks: 0
  });
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setAdminToken(config.adminToken);
    loadData();
    loadStats(); // Carregar estatísticas apenas uma vez
  }, [filter]);

  const loadStats = async () => {
    try {
      // Carregar estatísticas de membros usando o serviço
      const membersResponse = await memberService.list();
      const activeCount = membersResponse.data.filter((m) => m.isActive).length;

      setStats({
        activeMembers: activeCount,
        monthlyReferrals: 35, // Valor fixo
        monthlyThanks: 18 // Valor fixo
      });
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const intentionsResponse = await intentionService.list(
        filter === "ALL" ? undefined : filter,
      );
      setIntentions(intentionsResponse.data);
    } catch (err) {
      setError("Erro ao carregar dados");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await intentionService.approve(id);
      setSuccessMessage("Intenção aprovada! Membro criado com sucesso.");
      await loadData();
      await loadStats(); // Recarregar estatísticas para atualizar contador
    } catch {
      setError("Erro ao aprovar intenção");
    }
  };

  const handleReject = async (id: string) => {
    try {
      await intentionService.reject(id);
      setSuccessMessage("Intenção rejeitada com sucesso");
      await loadData();
    } catch {
      setError("Erro ao rejeitar intenção");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('userType');
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'PENDING': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'APPROVED': 'bg-green-100 text-green-800 border-green-200',
      'REJECTED': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      PENDING: "Pendente",
      APPROVED: "Aprovada",
      REJECTED: "Rejeitada",
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-sm text-gray-600">Gerencie intenções e acompanhe métricas</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button onClick={() => setError('')} className="text-red-600 hover:text-red-800">×</button>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-green-800">{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="text-green-600 hover:text-green-800">×</button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Membros Ativos</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeMembers}</p>
              </div>
              <div className="text-4xl">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Indicações/Mês</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.monthlyReferrals}</p>
              </div>
              <div className="text-4xl">🤝</div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Obrigados/Mês</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.monthlyThanks}</p>
              </div>
              <div className="text-4xl">💚</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                filter === status
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {status === 'ALL' ? 'Todas' : getStatusLabel(status)}
            </button>
          ))}
        </div>

        {/* Intentions List */}
        {intentions.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Nenhuma intenção encontrada.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {intentions.map((intention) => (
              <div key={intention.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{intention.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{new Date(intention.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(intention.status)}`}>
                      {getStatusLabel(intention.status)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">E-mail</p>
                      <p className="text-sm text-gray-900">{intention.email}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Empresa</p>
                      <p className="text-sm text-gray-900">{intention.company}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Motivo</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{intention.reason}</p>
                  </div>

                  {intention.status === 'PENDING' && (
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleApprove(intention.id)}
                        className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => handleReject(intention.id)}
                        className="flex-1 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
                      >
                        Rejeitar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboardNew;
