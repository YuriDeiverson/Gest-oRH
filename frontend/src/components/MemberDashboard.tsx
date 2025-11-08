import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";
import AnnouncementsList from "./AnnouncementsList";
import BusinessOpportunitiesFeed from "./BusinessOpportunitiesFeed";
import MemberNavbar from "./Layout/MemberNavbar";
import PostComposer from "./PostComposer";
import PostList from "./PostList";

const API_URL = config.apiUrl;

interface Referral {
  id: string;
  companyName: string;
  contactName: string;
  contactInfo: string;
  opportunity: string;
  status: string;
  trackingStatus?: string;
  createdAt: string;
  giver?: { intention: { name: string } };
  receiver?: { intention: { name: string } };
}

interface MemberData {
  id: string;
  name: string;
  email: string;
  company: string;
  profession: string;
  segment: string;
}

interface ReferralFormData {
  receiverId: string;
  companyName: string;
  contactName: string;
  contactInfo: string;
  opportunity: string;
}

interface IndicationFormData {
  name: string;
  email: string;
  company: string;
  reason: string;
}

const MemberDashboardNew: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "business" | "referrals" | "opportunities" | "agendas" | "announcements"
  >("business");
  const [activeSubTab, setActiveSubTab] = useState<"referrals" | "indications">(
    "referrals",
  );
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  // Dados mockados para indicações
  const mockReferralsGiven: Referral[] = [
    {
      id: "ref-1",
      companyName: "TechStart Solutions",
      contactName: "Marina Santos",
      contactInfo: "marina@techstart.com",
      opportunity:
        "Busca desenvolvedor senior React para projeto de 6 meses. Salário competitivo e benefícios.",
      status: "PENDING",
      trackingStatus: "NEW",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ref-2",
      companyName: "Consultoria Empresarial",
      contactName: "Ricardo Oliveira",
      contactInfo: "ricardo.oliveira@consultoria.com.br",
      opportunity:
        "Precisa de contador especializado em MEI e pequenas empresas para parceria.",
      status: "APPROVED",
      trackingStatus: "IN_CONTACT",
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const mockReferralsReceived: Referral[] = [
    {
      id: "rec-1",
      companyName: "Digital Marketing Pro",
      contactName: "Amanda Costa",
      contactInfo: "amanda@digitalmarketing.com",
      opportunity:
        "Oportunidade de parceria para serviços de automação de marketing digital.",
      status: "APPROVED",
      trackingStatus: "NEGOTIATING",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      giver: { intention: { name: "Carlos Silva" } },
    },
  ];

  const [referralsGiven, setReferralsGiven] =
    useState<Referral[]>(mockReferralsGiven);
  const [referralsReceived, setReferralsReceived] = useState<Referral[]>(
    mockReferralsReceived,
  );
  // Dados mockados para agendas
  const mockAgendas = [
    {
      id: "1",
      meeting: {
        title: "Reunião Mensal de Dezembro",
        description: "Discussão sobre metas para 2025 e networking",
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 dias
      },
      checkedIn: false,
      checkedAt: null,
    },
    {
      id: "2",
      meeting: {
        title: "Workshop: Marketing Digital",
        description: "Estratégias de marketing para pequenos negócios",
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 dias
      },
      checkedIn: true,
      checkedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      meeting: {
        title: "Evento de Final de Ano",
        description: "Confraternização e premiações do networking",
        date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 dias
      },
      checkedIn: false,
      checkedAt: null,
    },
  ];
  const [agendas, setAgendas] = useState<any[]>(mockAgendas);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showIndicationForm, setShowIndicationForm] = useState(false);
  const [formData, setFormData] = useState<ReferralFormData>({
    receiverId: "",
    companyName: "",
    contactName: "",
    contactInfo: "",
    opportunity: "",
  });
  const [indicationData, setIndicationData] = useState<IndicationFormData>({
    name: "",
    email: "",
    company: "",
    reason: "",
  });
  const [indications, setIndications] = useState<any[]>([]);
  const [indicationLoading, setIndicationLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [addPostFunction, setAddPostFunction] = useState<
    ((content: string) => void) | null
  >(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const memberId = localStorage.getItem("memberId");
    const memberEmail = localStorage.getItem("memberEmail");

    if (!memberId || !memberEmail) {
      navigate("/member/login");
      return;
    }

    try {
      const memberResponse = await fetch(
        `${API_URL}/members/${memberId}/public`,
      );
      if (!memberResponse.ok)
        throw new Error("Erro ao carregar dados do membro");
      const memberResult = await memberResponse.json();
      setMemberData({
        id: memberResult.data.id,
        name: memberResult.data.intention.name,
        email: memberResult.data.intention.email,
        company: memberResult.data.intention.company,
        profession: memberResult.data.profession,
        segment: memberResult.data.segment,
      });

      const membersResponse = await fetch(`${API_URL}/members/public/list`);
      if (membersResponse.ok) {
        const membersResult = await membersResponse.json();
        const mappedMembers = membersResult.data
          .map((m: any) => ({
            id: m.id,
            name: m.intention.name,
            email: m.intention.email,
            company: m.intention.company,
            profession: m.profession,
            segment: m.segment,
          }))
          .filter((m: MemberData) => m.id !== memberId);
        setMembers(mappedMembers);
      }

      // Buscar presenças/agendas do membro
      try {
        const presRes = await fetch(`${API_URL}/presences/member/${memberId}`);
        if (presRes.ok) {
          const presJson = await presRes.json();
          // Combinar dados da API com mockados
          const apiAgendas = presJson.data || [];
          setAgendas([...apiAgendas, ...mockAgendas]);
        } else {
          // Fallback para dados mockados
          setAgendas(mockAgendas);
        }
      } catch (err) {
        console.warn("Não foi possível carregar agendas:", err);
        // Fallback para dados mockados
        setAgendas(mockAgendas);
      }

      // Buscar todas as indicações feitas (intentions referidas por este membro)
      try {
        const myIndicationsResponse = await fetch(
          `${API_URL}/intentions/public/list?referredBy=${memberId}`,
        );
        if (myIndicationsResponse.ok) {
          const myIndicationsResult = await myIndicationsResponse.json();
          // Mapear para o formato de Referral
          const mappedIndications = myIndicationsResult.data.map(
            (intention: any) => ({
              id: intention.id,
              companyName: intention.company,
              contactName: intention.name,
              contactInfo: intention.email,
              opportunity: intention.reason,
              status: intention.status,
              trackingStatus: intention.trackingStatus,
              createdAt: intention.createdAt,
            }),
          );
          // Combinar com dados mockados
          setReferralsGiven([...mappedIndications, ...mockReferralsGiven]);
        } else {
          // Fallback para dados mockados
          setReferralsGiven(mockReferralsGiven);
        }
      } catch (err) {
        // Fallback para dados mockados
        setReferralsGiven(mockReferralsGiven);
      }

      // Buscar indicações aprovadas (intentions referidas por este membro)
      try {
        const approvedResponse = await fetch(
          `${API_URL}/intentions/public/list?referredBy=${memberId}`,
        );
        if (approvedResponse.ok) {
          const approvedResult = await approvedResponse.json();
          // Filtrar apenas aprovadas
          const approved = approvedResult.data.filter(
            (intention: any) => intention.status === "APPROVED",
          );
          const mappedApproved = approved.map((intention: any) => ({
            id: intention.id,
            companyName: intention.company,
            contactName: intention.name,
            contactInfo: intention.email,
            opportunity: intention.reason,
            status: "APPROVED",
            trackingStatus: intention.trackingStatus,
            createdAt: intention.createdAt,
          }));
          // Combinar com dados mockados
          setReferralsReceived([...mappedApproved, ...mockReferralsReceived]);
        } else {
          // Fallback para dados mockados
          setReferralsReceived(mockReferralsReceived);
        }
      } catch (err) {
        // Fallback para dados mockados
        setReferralsReceived(mockReferralsReceived);
      }

      setLoading(false);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError("Erro ao carregar dados");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("memberId");
    localStorage.removeItem("memberEmail");
    localStorage.removeItem("userType");
    navigate("/");
  };

  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const memberId = localStorage.getItem("memberId");
    if (!memberId) return;

    try {
      const response = await fetch("${API_URL}/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          giverId: memberId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar indicação");
      }

      setSuccess("Indicação criada com sucesso!");
      setFormData({
        receiverId: "",
        companyName: "",
        contactName: "",
        contactInfo: "",
        opportunity: "",
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao criar indicação";
      setError(errorMessage);
    }
  };

  const handleIndicationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const memberId = localStorage.getItem("memberId");
    if (!memberId) return;

    try {
      const response = await fetch(`${API_URL}/referrals/refer/${memberId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(indicationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao enviar indicação");
      }

      // Adicionar a nova indicação à lista local (optimistic update)
      const newIndication = {
        id: `temp-${Date.now()}`,
        name: indicationData.name,
        email: indicationData.email,
        company: indicationData.company,
        reason: indicationData.reason,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      };
      setIndications((prev) => [newIndication, ...prev]);

      setSuccess("Indicação enviada para aprovação do admin!");
      setIndicationData({
        name: "",
        email: "",
        company: "",
        reason: "",
      });
      setShowIndicationForm(false);

      // Recarregar dados para mostrar a nova indicação
      setTimeout(() => loadData(), 500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao enviar indicação";
      setError(errorMessage);
    }
  };

  const updateReferralStatus = async (
    referralId: string,
    newStatus: string,
  ): Promise<void> => {
    try {
      const response = await fetch(
        `${API_URL}/intentions/${referralId}/tracking-status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trackingStatus: newStatus }),
        },
      );

      if (!response.ok) throw new Error("Erro ao atualizar status");

      setSuccess("Status atualizado com sucesso!");

      // Recarregar dados para mostrar o novo status
      loadData();
    } catch (error) {
      setError("Erro ao atualizar status");
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      // Status de Referrals (oportunidades de negócio)
      NEW: {
        label: "Nova",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      IN_CONTACT: {
        label: "Em Contato",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      NEGOTIATING: {
        label: "Nova",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      CLOSED: {
        label: "Fechada",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      REJECTED: {
        label: "Recusada",
        className: "bg-red-100 text-red-800 border-red-200",
      },
      // Status de Intentions (indicações de novos membros)
      PENDING: {
        label: "Pendente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      APPROVED: {
        label: "Aprovada",
        className: "bg-green-100 text-green-800 border-green-200",
      },
    };
    const config = statusMap[status] || {
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-medium rounded-full border ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const getTrackingStatusLabel = (status: string | null | undefined) => {
    if (!status) return "";
    const statusMap: { [key: string]: string } = {
      NEW: "Nova",
      IN_CONTACT: "Em Contato",
      NEGOTIATING: "Nova",
      CLOSED: "Fechada",
      REJECTED: "Recusada",
    };
    return statusMap[status] || status;
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
      {/* Navbar no estilo LinkedIn */}
      <MemberNavbar
        memberName={memberData?.name}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex justify-between items-center">
            <p className="text-sm text-green-800">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-800"
            >
              ×
            </button>
          </div>
        )}

        {/* Conteúdo da Aba Início (feed estilo LinkedIn - apenas comunidade) */}
        {activeTab === "business" && (
          <div className="space-y-6">
            <div>
              {/* Composer + Feed da Comunidade */}
              <PostComposer
                memberId={memberData?.id}
                onPosted={() => setRefreshKey((k) => k + 1)}
                onNewPost={addPostFunction || undefined}
              />
            </div>
            <div>
              <PostList
                refreshKey={refreshKey}
                onAddPost={setAddPostFunction}
              />
            </div>
          </div>
        )}

        {/* Conteúdo da Aba Avisos */}
        {activeTab === "announcements" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Avisos e Comunicados
              </h2>
              <AnnouncementsList />
            </div>
          </div>
        )}

        {/* Conteúdo da Aba Agendas */}
        {activeTab === "agendas" && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Agendas e Convites
              </h2>
              {agendas.length === 0 ? (
                <p className="text-sm text-gray-600">
                  Você não possui convites/agendas marcadas.
                </p>
              ) : (
                <div className="space-y-4">
                  {agendas.map((p: any) => (
                    <div
                      key={p.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {p.meeting?.title || p.meeting?.description}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {p.meeting?.description}
                          </p>
                          <p className="text-xs text-gray-500">
                            Data: {new Date(p.meeting?.date).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>
                            Presença: {p.checkedIn ? "Confirmado" : "Pendente"}
                          </p>
                          {p.checkedAt && (
                            <p className="text-xs">
                              Marcado em{" "}
                              {new Date(p.checkedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Conteúdo da Aba Oportunidades */}
        {activeTab === "opportunities" && (
          <div className="space-y-6">
            <div>
              <BusinessOpportunitiesFeed />
            </div>
          </div>
        )}

        {/* Conteúdo da Aba Minhas Indicações (Referências e Indicações de Pessoas) */}
        {activeTab === "referrals" && (
          <>
            {/* Navegação por Sub-abas */}
            <div className="mb-8">
              <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
                <button
                  onClick={() => setActiveSubTab("referrals")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeSubTab === "referrals"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  🤝 Referências
                </button>
                <button
                  onClick={() => setActiveSubTab("indications")}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    activeSubTab === "indications"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  👥 Indicar Pessoas
                </button>
              </div>
            </div>

            {/* Conteúdo das Sub-abas */}
            {activeSubTab === "referrals" && (
              <>
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Referências Recebidas
                  </h3>
                  {referralsReceived.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhuma referência recebida ainda.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {referralsReceived.map((r) => (
                        <div
                          key={r.id}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {r.giver?.intention?.name || "Membro"}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {r.companyName} — {r.contactName}
                              </p>
                            </div>
                            <span className="text-xs text-gray-500">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700">
                            Contato: {r.contactInfo}
                          </div>
                          <div className="mt-3 text-sm text-gray-600">
                            <strong>Oportunidade:</strong> {r.opportunity}
                          </div>
                          {/* Comentários: placeholder para integração futura */}
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">
                              Comentários:
                            </p>
                            <p className="text-sm text-gray-700">
                              Nenhum comentário disponível (recurso a
                              implementar).
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSubTab === "indications" && (
              <>
                {/* Indicate New Member Card (sem exibir perfil) */}
                <div className="mb-8">
                  <div className="bg-white rounded-xl border border-primary-200 p-6 flex flex-col justify-center bg-linear-to-br from-primary-50 to-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Indicar Novo Membro
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Convide alguém para participar do grupo de networking.
                    </p>
                    <button
                      onClick={() => setShowIndicationForm(!showIndicationForm)}
                      className="px-4 py-2 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all shadow-md"
                    >
                      {showIndicationForm ? "Cancelar" : "Indicar Pessoa"}
                    </button>
                  </div>
                </div>

                {/* Indication Form */}
                {showIndicationForm && (
                  <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Indicar Nova Pessoa
                    </h3>
                    <form
                      onSubmit={handleIndicationSubmit}
                      className="space-y-4"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            value={indicationData.name}
                            onChange={(e) =>
                              setIndicationData({
                                ...indicationData,
                                name: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                          </label>
                          <input
                            type="email"
                            value={indicationData.email}
                            onChange={(e) =>
                              setIndicationData({
                                ...indicationData,
                                email: e.target.value,
                              })
                            }
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          value={indicationData.company}
                          onChange={(e) =>
                            setIndicationData({
                              ...indicationData,
                              company: e.target.value,
                            })
                          }
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo da Indicação
                        </label>
                        <textarea
                          value={indicationData.reason}
                          onChange={(e) =>
                            setIndicationData({
                              ...indicationData,
                              reason: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          required
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          type="submit"
                          disabled={indicationLoading}
                          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                        >
                          {indicationLoading
                            ? "Enviando..."
                            : "Enviar Indicação"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowIndicationForm(false)}
                          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Indications List */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Indicações de Pessoas
                  </h3>
                  {indications.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">
                        <svg
                          className="mx-auto h-12 w-12"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-sm">
                        Você ainda não fez nenhuma indicação de pessoa.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {indications.map((indication) => (
                        <div
                          key={indication.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900">
                              {indication.name}
                            </h4>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                indication.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : indication.status === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {indication.status === "PENDING" && "Pendente"}
                              {indication.status === "APPROVED" && "Aprovada"}
                              {indication.status === "REJECTED" && "Rejeitada"}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-medium">Email:</span>{" "}
                              {indication.email}
                            </p>
                            <p>
                              <span className="font-medium">Empresa:</span>{" "}
                              {indication.company}
                            </p>
                            <p>
                              <span className="font-medium">Motivo:</span>{" "}
                              {indication.reason}
                            </p>
                            <p className="text-xs text-gray-500">
                              Indicado em{" "}
                              {new Date(
                                indication.createdAt,
                              ).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}

        {/* (Oportunidades gerenciadas em aba dedicada) */}
      </main>
    </div>
  );
};

export default MemberDashboardNew;
