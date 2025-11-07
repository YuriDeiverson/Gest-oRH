import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { intentionService } from "../services/api";

interface FormData {
  phone: string;
  linkedin: string;
  profession: string;
  segment: string;
  companyDescription: string;
}

interface IntentionData {
  name: string;
  email: string;
  company: string;
}

const MemberRegistrationNew: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [intentionData, setIntentionData] = useState<IntentionData | null>(null);

  const [formData, setFormData] = useState<FormData>({
    phone: "",
    linkedin: "",
    profession: "",
    segment: "",
    companyDescription: "",
  });

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setError("Token não fornecido");
        setLoading(false);
        return;
      }

      try {
        const response = await intentionService.validateToken(token);
        setIntentionData(response.data);
        setLoading(false);
      } catch (err) {
        const errorData = err as { response?: { data?: { error?: string } } };
        const errorMessage =
          errorData.response?.data?.error || "Token inválido ou expirado";
        setError(errorMessage);
        setLoading(false);
      }
    };

    validate();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) return;

    // Validação básica
    if (!formData.phone || !formData.profession || !formData.segment) {
      setError("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `http://localhost:3001/api/members/register/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao completar cadastro");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/member/login");
      }, 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro ao completar cadastro";
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Validando token...</p>
        </div>
      </div>
    );
  }

  if (error && !intentionData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-red-200 p-8 max-w-md w-full">
          <div className="flex items-center gap-3 mb-4 text-red-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <h2 className="text-2xl font-bold">Erro</h2>
          </div>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="w-full bg-primary-600 text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            Voltar para Início
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl border border-green-200 p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cadastro Completo!</h2>
            <p className="text-gray-600">
              Seu cadastro foi concluído com sucesso. Você será redirecionado para o login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 via-white to-primary-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-primary-100 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-primary-600 to-primary-700 text-white px-8 py-6">
            <h1 className="text-3xl font-bold mb-2">Complete seu Cadastro</h1>
            <p className="text-primary-100">
              Bem-vindo(a), <strong>{intentionData?.name}</strong>!
            </p>
          </div>

          {/* Body */}
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Info Card */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Seus Dados Básicos</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">Nome:</span> {intentionData?.name}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {intentionData?.email}</p>
                <p><span className="font-medium text-gray-700">Empresa:</span> {intentionData?.company}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+55 (11) 98765-4321"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="block text-sm font-semibold text-gray-700 mb-2">
                  LinkedIn
                </label>
                <input
                  type="url"
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Profession */}
              <div>
                <label htmlFor="profession" className="block text-sm font-semibold text-gray-700 mb-2">
                  Profissão <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="profession"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  placeholder="Ex: Desenvolvedor Full Stack"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Segment */}
              <div>
                <label htmlFor="segment" className="block text-sm font-semibold text-gray-700 mb-2">
                  Segmento de Atuação <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="segment"
                  name="segment"
                  value={formData.segment}
                  onChange={handleChange}
                  placeholder="Ex: Tecnologia da Informação"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Company Description */}
              <div>
                <label htmlFor="companyDescription" className="block text-sm font-semibold text-gray-700 mb-2">
                  Descrição da Empresa
                </label>
                <textarea
                  id="companyDescription"
                  name="companyDescription"
                  value={formData.companyDescription}
                  onChange={handleChange}
                  placeholder="Conte um pouco sobre sua empresa e atividades..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-linear-to-r from-primary-600 to-primary-700 text-white font-semibold py-4 px-6 rounded-lg hover:from-primary-700 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Completando cadastro...
                    </span>
                  ) : (
                    "Completar Cadastro"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberRegistrationNew;
