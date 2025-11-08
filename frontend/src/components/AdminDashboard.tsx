// AdminDashboard.tsx - Dashboard administrativo completo
import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import PostList from "./PostList";
import AnnouncementsList from "./AnnouncementsList";
import BusinessOpportunitiesFeed from "./BusinessOpportunitiesFeed";

interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  pendingIntentions: number;
  totalIntentions: number;
  totalReferrals: number;
}

interface AdminData {
  id: string;
  name: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "requests"
    | "reports"
    | "opportunities"
    | "meetings"
    | "announcements"
  >("home");
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Estados para as funcionalidades
  const [intentions, setIntentions] = useState<any[]>([]);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  // Estados para modals/forms
  const [showNewOpportunityForm, setShowNewOpportunityForm] = useState(false);
  const [showNewMeetingForm, setShowNewMeetingForm] = useState(false);
  const [showNewAnnouncementForm, setShowNewAnnouncementForm] = useState(false);

  // Estados para formulários
  const [newOpportunity, setNewOpportunity] = useState({
    title: "",
    description: "",
    category: "PARCERIA",
    company: "",
    contact: "",
  });

  const [newMeeting, setNewMeeting] = useState({
    date: "",
    time: "",
    topic: "",
    notes: "",
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: "",
    content: "",
    type: "INFO",
    priority: "NORMAL",
  });

  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Carregar intenções reais da API com fallback para dados mockados
  const loadIntentions = async () => {
    // Dados mockados para demonstração
    const mockIntentions = [
      {
        id: "mock-1",
        name: "João Silva",
        email: "joao.silva@email.com",
        company: "TechCorp",
        position: "Desenvolvedor Full Stack",
        reason:
          "Indicado por Maria Santos - Excelente profissional em React e Node.js",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      {
        id: "mock-2",
        name: "Ana Costa",
        email: "ana.costa@email.com",
        company: "Creative Studio",
        position: "Designer UX/UI",
        reason:
          "Indicado por Pedro Lima - Especialista em design de interfaces",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
      {
        id: "mock-3",
        name: "Carlos Mendes",
        email: "carlos.mendes@email.com",
        company: "Marketing Digital Pro",
        position: "Especialista em Marketing",
        reason: "Indicado por Roberto Santos - Expert em marketing digital",
        status: "PENDING",
        createdAt: new Date().toISOString(),
      },
    ];

    try {
      // Tentar carregar dados reais da API
      const response = await api.get("/intentions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || "secret-admin-token-123"}` }
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const realIntentions = response.data.data
          .filter((intention: any) => intention.status === "PENDING")
          .map((intention: any) => ({
            id: intention.id,
            name: intention.name,
            email: intention.email,
            company: intention.company,
            reason: intention.reason,
            status: intention.status,
            createdAt: intention.createdAt
          }));
        
        // Combinar dados reais com mockados
        const allIntentions = [...realIntentions, ...mockIntentions];
        setIntentions(allIntentions);
        console.log("Carregadas", realIntentions.length, "intenções reais e", mockIntentions.length, "mockadas");
        return;
      }
    } catch (error) {
      console.log("API não disponível, usando apenas dados mockados:", error);
    }

    // Se API falhar, usar apenas dados mockados
    setIntentions(mockIntentions);
  };

  // Função para aprovar intenção (cria membro real no banco)
  const approveIntention = async (id: string) => {
    const intention = intentions.find((i) => i.id === id);
    if (!intention) return;

    try {
      // Aprovar intenção - isso automaticamente cria o membro no banco
      const response = await api.patch(`/intentions/${id}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("adminToken") || "secret-admin-token-123"
          }`,
        },
      });

      if (response.status === 200) {
        setSuccess(`Membro ${intention.name} aprovado com sucesso!`);
        loadIntentions();
        loadReferrals(); // Atualizar histórico
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error: any) {
      console.error("Erro ao aprovar:", error);
      setError(
        `Erro ao aprovar membro: ${
          error.response?.data?.error || error.message
        }`,
      );
    }
  };

  // Função para rejeitar intenção
  const rejectIntention = async (id: string) => {
    const intention = intentions.find((i) => i.id === id);
    if (!intention) return;

    try {
      // Rejeitar intenção via API
      const response = await api.patch(`/intentions/${id}/reject`, {}, {
        headers: {
          Authorization: `Bearer ${
            localStorage.getItem("adminToken") || "secret-admin-token-123"
          }`,
        },
      });

      if (response.status === 200) {
        setSuccess(`Solicitação de ${intention.name} rejeitada`);
        loadIntentions();
        loadReferrals(); // Atualizar histórico
      }
    } catch (error: any) {
      console.error("Erro ao rejeitar:", error);
      setError(
        `Erro ao rejeitar: ${
          error.response?.data?.error || error.message
        }`,
      );
    }
  };

  // Função para criar oportunidade (simulação)
  const createOpportunity = () => {
    if (!newOpportunity.title || !newOpportunity.description) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    // Simular criação local
    setSuccess("Oportunidade criada com sucesso! (simulação)");
    setShowNewOpportunityForm(false);
    setNewOpportunity({
      title: "",
      description: "",
      category: "PARCERIA",
      company: "",
      contact: "",
    });
  };

  // Função para criar reunião (simulação)
  const createMeeting = () => {
    if (!newMeeting.date || !newMeeting.time || !newMeeting.topic) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    // Simular agendamento local
    const newMeetingData = {
      id: Date.now().toString(),
      member: { name: "Membro Selecionado" },
      datetime: `${newMeeting.date}T${newMeeting.time}:00.000Z`,
      topic: newMeeting.topic,
      notes: newMeeting.notes,
    };

    setMeetings((prev) => [newMeetingData, ...prev]);
    setSuccess("Reunião agendada com sucesso!");
    setShowNewMeetingForm(false);
    setNewMeeting({ date: "", time: "", topic: "", notes: "" });
  };

  // Função para criar aviso (simulação)
  const createAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.content) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    // Simular criação local
    setSuccess("Aviso criado com sucesso! (simulação)");
    setShowNewAnnouncementForm(false);
    setNewAnnouncement({
      title: "",
      content: "",
      type: "INFO",
      priority: "NORMAL",
    });
  };

  // Função para logout
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    window.location.href = "/admin/login";
  };

  // Função para carregar reuniões (dados mockados)
  const loadMeetings = () => {
    const mockMeetings = [
      {
        id: "1",
        member: { name: "João Silva" },
        datetime: new Date(Date.now() + 86400000).toISOString(), // Amanhã
        topic: "Integração no grupo de networking",
        notes: "Primeira reunião - apresentação da plataforma",
      },
      {
        id: "2",
        member: { name: "Ana Costa" },
        datetime: new Date(Date.now() + 5 * 86400000).toISOString(), // Em 5 dias
        topic: "Oportunidades de parcerias em design",
        notes: "Discussão sobre colaborações futuras",
      },
      {
        id: "3",
        member: { name: "Carlos Mendes" },
        datetime: new Date(Date.now() + 7 * 86400000).toISOString(), // Em 7 dias
        topic: "Estratégias de marketing digital",
        notes: "Compartilhar conhecimentos sobre marketing",
      },
    ];

    setMeetings(mockMeetings);
  };

  // Função para carregar referrals (histórico de indicações aprovadas/rejeitadas)
  const loadReferrals = async () => {
    try {
      // Buscar intenções da API
      const response = await api.get("/intentions", {
        headers: { Authorization: `Bearer ${localStorage.getItem("adminToken") || "secret-admin-token-123"}` }
      });
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Filtrar apenas aprovadas e rejeitadas para o histórico
        const processedIntentions = response.data.data
          .filter((intention: any) => intention.status === "APPROVED" || intention.status === "REJECTED")
          .map((intention: any) => ({
            id: intention.id,
            giver: { intention: { name: "Admin" } },
            receiver: { intention: { name: intention.name } },
            description: `${intention.company} - ${intention.reason}`,
            status: intention.status === "APPROVED" ? "ACCEPTED" : "CLOSED",
            createdAt: intention.updatedAt || intention.createdAt
          }))
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10); // Últimas 10
        
        setReferrals(processedIntentions);
        return;
      }
    } catch (error) {
      console.log("Erro ao carregar histórico, usando dados mockados:", error);
    }

    // Fallback: dados mockados
    const mockReferrals = [
      {
        id: "mock-1",
        giver: { intention: { name: "Admin" } },
        receiver: { intention: { name: "Maria Santos" } },
        description: "TechCorp - Indicação aprovada",
        status: "ACCEPTED",
      },
      {
        id: "mock-2",
        giver: { intention: { name: "Admin" } },
        receiver: { intention: { name: "Pedro Lima" } },
        description: "Creative Agency - Design de identidade visual",
        status: "ACCEPTED",
      },
      {
        id: "mock-3",
        giver: { intention: { name: "Admin" } },
        receiver: { intention: { name: "Carlos Mendes" } },
        description: "Marketing Pro - Solicitação rejeitada",
        status: "CLOSED",
      },
    ];

    setReferrals(mockReferrals);
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Carregar dados de stats
        const statsResponse = await api.get("/members/stats", {
          headers: {
            Authorization: `Bearer ${
              localStorage.getItem("adminToken") || "secret-admin-token-123"
            }`,
          },
        });

        const data = statsResponse.data.data;
        setStats({
          totalMembers: data.members.total,
          activeMembers: data.members.active,
          pendingIntentions: 0,
          totalIntentions: 0,
          totalReferrals: data.referrals.total,
        });

        // Simular dados do admin
        setAdminData({
          id: "admin",
          name: "Administrador",
        });

        // Carregar dados das abas
        await loadIntentions();
        loadMeetings();
        loadReferrals();
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [refreshKey]);

  // Limpar mensagens após 3 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showProfileDropdown && !(event.target as Element).closest('.relative')) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileDropdown]);

  if (loading)
    return (
      <div className="p-6 text-center">Carregando painel administrativo...</div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar estilo LinkedIn */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-blue-600">Admin Panel</h1>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Olá, {adminData?.name}</span>
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                >
                  <span className="text-white text-sm font-medium">A</span>
                </button>
                
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                      <div className="font-medium">{adminData?.name}</div>
                      <div className="text-gray-500">Administrador</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      🚪 Sair
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Navegação por abas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { key: "home", label: "🏠 Início", icon: "🏠" },
              { key: "requests", label: "📋 Solicitações", icon: "📋" },
              { key: "reports", label: "📊 Relatórios", icon: "📊" },
              { key: "opportunities", label: "💼 Oportunidades", icon: "💼" },
              { key: "meetings", label: "📅 Agendas", icon: "📅" },
              { key: "announcements", label: "📢 Avisos", icon: "📢" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() =>
                  setActiveTab(
                    tab.key as
                      | "home"
                      | "requests"
                      | "reports"
                      | "opportunities"
                      | "meetings"
                      | "announcements",
                  )
                }
                className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo das abas */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Mensagens de feedback */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Aba Início */}
        {activeTab === "home" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Feed da Comunidade</h2>
              <PostList refreshKey={refreshKey} />
            </div>
          </div>
        )}

        {/* Aba Solicitações */}
        {activeTab === "requests" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Solicitações de Membros e Indicações
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Novas Solicitações de Membros (
                    {intentions.filter((i) => i.status === "PENDING").length})
                  </h3>
                  <div className="space-y-3">
                    {intentions.filter((i) => i.status === "PENDING").length ===
                    0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhuma solicitação pendente
                      </p>
                    ) : (
                      intentions
                        .filter((i) => i.status === "PENDING")
                        .map((intention) => (
                          <div
                            key={intention.id}
                            className="p-4 border border-gray-200 rounded-lg"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium">
                                  {intention.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {intention.position} - {intention.company}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {intention.reason}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  {intention.email}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => approveIntention(intention.id)}
                                  className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => rejectIntention(intention.id)}
                                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Indicações Recentes
                  </h3>
                  <div className="space-y-3">
                    {referrals.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhuma indicação recente
                      </p>
                    ) : (
                      referrals
                        .filter(ref => ref.status !== "PENDING")
                        .slice(0, 5)
                        .map((referral) => (
                        <div
                          key={referral.id}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                {referral.giver?.intention?.name} →{" "}
                                {referral.receiver?.intention?.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {referral.description}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${
                                referral.status === "ACCEPTED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {referral.status === "ACCEPTED" ? "Aprovado" : "Rejeitado"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Relatórios */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-4">
                Relatórios de Atividade
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <button className="p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 text-left">
                  <h3 className="font-medium text-blue-600">
                    📅 Relatório Semanal
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Última semana de atividades
                  </p>
                </button>
                <button className="p-4 border-2 border-green-200 rounded-lg hover:border-green-400 text-left">
                  <h3 className="font-medium text-green-600">
                    📊 Relatório Mensal
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Resumo do mês atual
                  </p>
                </button>
                <button className="p-4 border-2 border-purple-200 rounded-lg hover:border-purple-400 text-left">
                  <h3 className="font-medium text-purple-600">
                    📈 Todo Período
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Histórico completo
                  </p>
                </button>
              </div>

              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-800">
                      Total de Membros
                    </h3>
                    <p className="text-2xl font-bold text-blue-900">
                      {stats.totalMembers}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-green-800">
                      Membros Ativos
                    </h3>
                    <p className="text-2xl font-bold text-green-900">
                      {stats.activeMembers}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Indicações
                    </h3>
                    <p className="text-2xl font-bold text-yellow-900">
                      {stats.totalReferrals}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-purple-800">
                      Taxa de Atividade
                    </h3>
                    <p className="text-2xl font-bold text-purple-900">
                      {stats.totalMembers > 0
                        ? Math.round(
                            (stats.activeMembers / stats.totalMembers) * 100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aba Oportunidades */}
        {activeTab === "opportunities" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Oportunidades de Negócio
                </h2>
                <button
                  onClick={() => setShowNewOpportunityForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Nova Oportunidade
                </button>
              </div>

              {/* Modal de Nova Oportunidade */}
              {showNewOpportunityForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Nova Oportunidade
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Título da oportunidade"
                        value={newOpportunity.title}
                        onChange={(e) =>
                          setNewOpportunity((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <textarea
                        placeholder="Descrição"
                        value={newOpportunity.description}
                        onChange={(e) =>
                          setNewOpportunity((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded h-24"
                      />

                      <select
                        value={newOpportunity.category}
                        onChange={(e) =>
                          setNewOpportunity((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="PARCERIA">Parceria</option>
                        <option value="SERVICO">Serviço</option>
                        <option value="COMPRA">Compra</option>
                      </select>

                      <input
                        type="text"
                        placeholder="Empresa"
                        value={newOpportunity.company}
                        onChange={(e) =>
                          setNewOpportunity((prev) => ({
                            ...prev,
                            company: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={createOpportunity}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Criar Oportunidade
                      </button>
                      <button
                        onClick={() => setShowNewOpportunityForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <BusinessOpportunitiesFeed />
            </div>
          </div>
        )}

        {/* Aba Agendas */}
        {activeTab === "meetings" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Agendas e Reuniões</h2>
                <button
                  onClick={() => setShowNewMeetingForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Nova Reunião
                </button>
              </div>

              {/* Modal de Nova Reunião */}
              {showNewMeetingForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Agendar Nova Reunião
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) =>
                          setNewMeeting((prev) => ({
                            ...prev,
                            date: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <input
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) =>
                          setNewMeeting((prev) => ({
                            ...prev,
                            time: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <input
                        type="text"
                        placeholder="Tópico da reunião"
                        value={newMeeting.topic}
                        onChange={(e) =>
                          setNewMeeting((prev) => ({
                            ...prev,
                            topic: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <textarea
                        placeholder="Observações (opcional)"
                        value={newMeeting.notes}
                        onChange={(e) =>
                          setNewMeeting((prev) => ({
                            ...prev,
                            notes: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded h-20"
                      />
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={createMeeting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Agendar Reunião
                      </button>
                      <button
                        onClick={() => setShowNewMeetingForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Próximas Reuniões 1:1 ({meetings.length})
                  </h3>
                  <div className="space-y-3">
                    {meetings.length === 0 ? (
                      <p className="text-gray-500 text-center py-8">
                        Nenhuma reunião agendada
                      </p>
                    ) : (
                      meetings.map((meeting) => (
                        <div
                          key={meeting.id}
                          className="p-4 border border-gray-200 rounded-lg"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                Reunião com {meeting.member.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {new Date(
                                  meeting.datetime,
                                ).toLocaleDateString()}{" "}
                                às{" "}
                                {new Date(meeting.datetime).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                Tópico: {meeting.topic}
                              </p>
                              {meeting.notes && (
                                <p className="text-xs text-gray-400 mt-1">
                                  {meeting.notes}
                                </p>
                              )}
                            </div>
                            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                              Editar
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">
                    Calendário da Semana
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-7 gap-1 text-xs text-center mb-2">
                      {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                        (day) => (
                          <div key={day} className="font-medium text-gray-600">
                            {day}
                          </div>
                        ),
                      )}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-sm">
                      {Array.from({ length: 7 }, (_, i) => (
                        <div
                          key={i}
                          className="aspect-square bg-white border border-gray-200 rounded flex items-center justify-center hover:bg-blue-50 cursor-pointer"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba Avisos */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Gerenciar Avisos</h2>
                <button
                  onClick={() => setShowNewAnnouncementForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  + Novo Aviso
                </button>
              </div>

              {/* Modal de Novo Aviso */}
              {showNewAnnouncementForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 className="text-lg font-semibold mb-4">
                      Criar Novo Aviso
                    </h3>

                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Título do aviso"
                        value={newAnnouncement.title}
                        onChange={(e) =>
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            title: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      />

                      <textarea
                        placeholder="Conteúdo do aviso"
                        value={newAnnouncement.content}
                        onChange={(e) =>
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            content: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded h-24"
                      />

                      <select
                        value={newAnnouncement.type}
                        onChange={(e) =>
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            type: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="INFO">Informativo</option>
                        <option value="EVENT">Evento</option>
                        <option value="URGENT">Urgente</option>
                        <option value="WARNING">Aviso</option>
                      </select>

                      <select
                        value={newAnnouncement.priority}
                        onChange={(e) =>
                          setNewAnnouncement((prev) => ({
                            ...prev,
                            priority: e.target.value,
                          }))
                        }
                        className="w-full p-2 border border-gray-300 rounded"
                      >
                        <option value="NORMAL">Normal</option>
                        <option value="HIGH">Alta</option>
                        <option value="URGENT">Urgente</option>
                      </select>
                    </div>

                    <div className="flex space-x-2 mt-6">
                      <button
                        onClick={createAnnouncement}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Criar Aviso
                      </button>
                      <button
                        onClick={() => setShowNewAnnouncementForm(false)}
                        className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <AnnouncementsList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
