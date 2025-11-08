import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config/config";

interface BusinessOpportunity {
  id: string;
  title: string;
  description: string;
  company: string | null;
  contactName: string | null;
  category: string;
  segment: string | null;
  location: string | null;
  estimatedValue: number | null;
  deadline: string | null;
  publishedAt: string;
  expiresAt: string | null;
  authorName: string;
}

export default function BusinessOpportunitiesFeed() {
  const [opportunities, setOpportunities] = useState<BusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const categories = [
    { value: "all", label: "Todas" },
    { value: "GERAL", label: "Geral" },
    { value: "VENDA", label: "Venda" },
    { value: "COMPRA", label: "Compra" },
    { value: "PARCERIA", label: "Parceria" },
    { value: "SERVICO", label: "Serviço" },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      GERAL: "bg-gray-100 text-gray-800 border-gray-300",
      VENDA: "bg-green-100 text-green-800 border-green-300",
      COMPRA: "bg-blue-100 text-blue-800 border-blue-300",
      PARCERIA: "bg-purple-100 text-purple-800 border-purple-300",
      SERVICO: "bg-orange-100 text-orange-800 border-orange-300",
    };
    return colors[category] || colors.GERAL;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      GERAL: "💼",
      VENDA: "💰",
      COMPRA: "🛒",
      PARCERIA: "🤝",
      SERVICO: "🔧",
    };
    return icons[category] || icons.GERAL;
  };

  const fetchOpportunities = useCallback(async () => {
    try {
      setLoading(true);
      const url =
        selectedCategory === "all"
          ? `${API_BASE_URL}/opportunities`
          : `${API_BASE_URL}/opportunities?category=${selectedCategory}`;

      const response = await fetch(url);
      const result = await response.json();
      setOpportunities(result.data || []);
    } catch (error) {
      console.error("Erro ao carregar oportunidades:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando oportunidades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Oportunidades de Negócios
        </h2>
        <p className="text-gray-600">
          Explore oportunidades compartilhadas pela comunidade
        </p>
      </div>

      {/* Filtros de categoria */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-full font-medium transition-all cursor-pointer ${
              selectedCategory === cat.value
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white text-gray-700 border border-gray-300 hover:border-blue-600 hover:text-blue-600"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Feed de oportunidades */}
      {opportunities.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma oportunidade encontrada
          </h3>
          <p className="text-gray-600">
            {selectedCategory === "all"
              ? "Não há oportunidades disponíveis no momento."
              : `Não há oportunidades na categoria ${
                  categories.find((c) => c.value === selectedCategory)?.label
                }.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md"
            >
              {/* Header do card */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div
                      className={`text-3xl flex items-center justify-center w-12 h-12 rounded-full ${getCategoryColor(
                        opp.category,
                      )}`}
                    >
                      {getCategoryIcon(opp.category)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {opp.title}
                      </h3>
                      {opp.company && (
                        <p className="text-gray-600 font-medium">
                          {opp.company}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                            opp.category,
                          )}`}
                        >
                          {
                            categories.find((c) => c.value === opp.category)
                              ?.label
                          }
                        </span>
                        {opp.segment && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {opp.segment}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                <div className="mb-4">
                  <p
                    className={`text-gray-700 ${
                      expandedId === opp.id ? "" : "line-clamp-3"
                    }`}
                  >
                    {opp.description}
                  </p>
                  {opp.description.length > 150 && (
                    <button
                      onClick={() => toggleExpand(opp.id)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm mt-2 cursor-pointer"
                    >
                      {expandedId === opp.id ? "Ver menos" : "Ver mais"}
                    </button>
                  )}
                </div>

                {/* Informações adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  {opp.estimatedValue && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">
                        Valor estimado:
                      </span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(opp.estimatedValue)}
                      </span>
                    </div>
                  )}
                  {opp.location && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">📍</span>
                      <span className="text-gray-700">{opp.location}</span>
                    </div>
                  )}
                  {opp.deadline && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">
                        Prazo final:
                      </span>
                      <span className="text-gray-700 font-medium">
                        {formatDate(opp.deadline)}
                      </span>
                    </div>
                  )}
                  {opp.contactName && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 text-sm">Contato:</span>
                      <span className="text-gray-700">{opp.contactName}</span>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>Publicado por {opp.authorName}</span>
                    <span>•</span>
                    <span>{formatDate(opp.publishedAt)}</span>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                    Tenho interesse
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
