import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "../config/config";
import AnnouncementsList from "./AnnouncementsList";
import MeetingCheckIn from "./MeetingCheckIn";
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
  const [activeSubTab, setActiveSubTab] = useState<"referrals" | "indications">("referrals");
  const [memberData, setMemberData] = useState<MemberData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [referralsGiven, setReferralsGiven] = useState<Referral[]>([]);
  const [referralsReceived, setReferralsReceived] = useState<Referral[]>([]);
  const [agendas, setAgendas] = useState<any[]>([]);
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
          setAgendas(presJson.data || []);
        }
      } catch (err) {
        console.warn("Não foi possível carregar agendas:", err);
      }

      // Buscar todas as indicações feitas (intentions referidas por este membro)
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
        setReferralsGiven(mappedIndications);
      }

      // Buscar indicações aprovadas (intentions referidas por este membro)
      const approvedResponse = await fetch(
        `${API_URL}/intentions/public/list?referredBy=${memberId}`,
      );
      if (approvedResponse.ok) {
        const approvedResult = await approvedResponse.json();
        // Filtrar apenas aprovadas
        const approved = approvedResult.data.filter(
          (intention: any) => intention.status === "APPROVED",
        );
        setReferralsReceived(
          approved.map((intention: any) => ({
            id: intention.id,
            companyName: intention.company,
            contactName: intention.name,
            contactInfo: intention.email,
            opportunity: intention.reason,
            status: "APPROVED",
            trackingStatus: intention.trackingStatus,
            createdAt: intention.createdAt,
          })),
        );
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
              <PostComposer memberId={memberData?.id} onPosted={() => setRefreshKey((k) => k + 1)} />
            </div>
            <div>
              <PostList refreshKey={refreshKey} />
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendas e Convites</h2>
              {agendas.length === 0 ? (
                <p className="text-sm text-gray-600">Você não possui convites/agendas marcadas.</p>
              ) : (
                <div className="space-y-4">
                  {agendas.map((p: any) => (
                    <div key={p.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">{p.meeting?.title || p.meeting?.description}</h3>
                          <p className="text-sm text-gray-600">{p.meeting?.description}</p>
                          <p className="text-xs text-gray-500">Data: {new Date(p.meeting?.date).toLocaleString()}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>Presença: {p.checkedIn ? "Confirmado" : "Pendente"}</p>
                          {p.checkedAt && <p className="text-xs">Marcado em {new Date(p.checkedAt).toLocaleString()}</p>}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Referências feitas sobre você</h3>
                  {referralsReceived.length === 0 ? (
                    <p className="text-sm text-gray-500">Nenhuma referência recebida ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {referralsReceived.map((r) => (
                        <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-medium text-gray-900">{r.giver?.intention?.name || "Membro"}</h4>
                              <p className="text-sm text-gray-600">{r.companyName} — {r.contactName}</p>
                            </div>
                            <span className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="text-sm text-gray-700">Contato: {r.contactInfo}</div>
                          <div className="mt-3 text-sm text-gray-600">
                            <strong>Oportunidade:</strong> {r.opportunity}
                          </div>
                          {/* Comentários: placeholder para integração futura */}
                          <div className="mt-3">
                            <p className="text-xs text-gray-500">Comentários:</p>
                            <p className="text-sm text-gray-700">Nenhum comentário disponível (recurso a implementar).</p>
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Indicar Novo Membro</h3>
                    <p className="text-sm text-gray-600 mb-4">Convide alguém para participar do grupo de networking.</p>
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
                    <form onSubmit={handleIndicationSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            value={indicationData.name}
                            onChange={(e) =>
                              setIndicationData({ ...indicationData, name: e.target.value })
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
                              setIndicationData({ ...indicationData, email: e.target.value })
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
                            setIndicationData({ ...indicationData, company: e.target.value })
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
                            setIndicationData({ ...indicationData, reason: e.target.value })
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
                          {indicationLoading ? "Enviando..." : "Enviar Indicação"}
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
                    Minhas Indicações de Pessoas
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
                            <h4 className="font-medium text-gray-900">{indication.name}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              indication.status === "APPROVED"
                                ? "bg-green-100 text-green-800"
                                : indication.status === "REJECTED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {indication.status === "PENDING" && "Pendente"}
                              {indication.status === "APPROVED" && "Aprovada"}
                              {indication.status === "REJECTED" && "Rejeitada"}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p><span className="font-medium">Email:</span> {indication.email}</p>
                            <p><span className="font-medium">Empresa:</span> {indication.company}</p>
                            <p><span className="font-medium">Motivo:</span> {indication.reason}</p>
                            <p className="text-xs text-gray-500">
                              Indicado em {new Date(indication.createdAt).toLocaleDateString("pt-BR")}
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
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Indicar Novo Membro
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Preencha os dados da pessoa que você quer indicar. Sua
                  indicação será enviada para aprovação do administrador.
                </p>
                <form onSubmit={handleIndicationSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="indication-name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nome Completo *
                    </label>
                    <input
                      type="text"
                      id="indication-name"
                      name="name"
                      value={indicationData.name}
                      onChange={(e) =>
                        setIndicationData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="indication-email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email *
                    </label>
                    <input
                      type="email"
                      id="indication-email"
                      name="email"
                      value={indicationData.email}
                      onChange={(e) =>
                        setIndicationData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="indication-company"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Empresa *
                    </label>
                    <input
                      type="text"
                      id="indication-company"
                      name="company"
                      value={indicationData.company}
                      onChange={(e) =>
                        setIndicationData((prev) => ({
                          ...prev,
                          company: e.target.value,
                        }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="indication-reason"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Por que você está indicando esta pessoa? *
                    </label>
                    <textarea
                      id="indication-reason"
                      name="reason"
                      value={indicationData.reason}
                      onChange={(e) =>
                        setIndicationData((prev) => ({
                          ...prev,
                          reason: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-linear-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold rounded-lg transition-all shadow-lg"
                  >
                    Enviar Indicação para Aprovação
                  </button>
                </form>
              </div>
            )}

            {/* Form */}
            {showForm && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Nova Indicação
                </h3>
                <form onSubmit={handleSubmitReferral} className="space-y-4">
                  <div>
                    <label
                      htmlFor="receiverId"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Para quem é a indicação?
                    </label>
                    <select
                      id="receiverId"
                      name="receiverId"
                      value={formData.receiverId}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    >
                      <option value="">Selecione um membro</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name} - {member.profession} ({member.company})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="companyName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactName"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Nome do Contato
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      value={formData.contactName}
                      onChange={handleFormChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contactInfo"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Informações de Contato
                    </label>
                    <input
                      type="text"
                      id="contactInfo"
                      name="contactInfo"
                      value={formData.contactInfo}
                      onChange={handleFormChange}
                      placeholder="Telefone, e-mail, etc."
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="opportunity"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Descrição da Oportunidade
                    </label>
                    <textarea
                      id="opportunity"
                      name="opportunity"
                      value={formData.opportunity}
                      onChange={handleFormChange}
                      rows={4}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Enviar Indicação
                  </button>
                </form>
              </div>
            )}

            {/* Referrals Given */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Minhas Indicações ({referralsGiven.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pessoas que você indicou para participar do grupo de networking.
              </p>
              {referralsGiven.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">
                    Você ainda não fez nenhuma indicação.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {referralsGiven.map((referral) => (
                    <div
                      key={referral.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {referral.contactName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {referral.contactInfo}
                          </p>
                          <p className="text-sm text-gray-600">
                            Empresa: {referral.companyName}
                          </p>
                        </div>
                        {getStatusBadge(referral.status)}
                      </div>
                      <p className="text-sm text-gray-700">
                        {referral.opportunity}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved Indications (Indications Made by Member that were Approved) */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Indicações Aprovadas ({referralsReceived.length})
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Pessoas que você indicou e que foram aprovadas pelo
                administrador.
              </p>
              {referralsReceived.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                  <p className="text-gray-500">
                    Você ainda não tem indicações aprovadas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {referralsReceived.map((referral) => (
                    <div
                      key={referral.id}
                      className="bg-white rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            {referral.companyName}
                            {referral.trackingStatus && (
                              <span className="text-base font-normal text-gray-600">
                                {" "}
                                -{" "}
                                {getTrackingStatusLabel(
                                  referral.trackingStatus,
                                )}
                              </span>
                            )}
                          </h4>
                          <p className="text-sm text-gray-600">
                            De: {referral.giver?.intention?.name || "N/A"}
                          </p>
                        </div>
                        {getStatusBadge(referral.status)}
                      </div>
                      <p className="text-sm text-gray-700 mb-2">
                        {referral.opportunity}
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        Contato: {referral.contactName} - {referral.contactInfo}
                      </p>

                      <div className="border-t border-gray-200 pt-4">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                          Atualizar Status
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            "IN_CONTACT",
                            "NEGOTIATING",
                            "CLOSED",
                            "REJECTED",
                          ].map((status) => (
                            <button
                              key={status}
                              onClick={() =>
                                updateReferralStatus(referral.id, status)
                              }
                              disabled={referral.trackingStatus === status}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                                referral.trackingStatus === status
                                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                  : status === "CLOSED"
                                  ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                                  : status === "REJECTED"
                                  ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                  : "bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100"
                              }`}
                            >
                              {status === "IN_CONTACT" && "Em Contato"}
                              {status === "NEGOTIATING" && "Nova"}
                              {status === "CLOSED" && "Fechada"}
                              {status === "REJECTED" && "Recusada"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* (Oportunidades gerenciadas em aba dedicada) */}
      </main>
    </div>
  );
};

export default MemberDashboardNew;
