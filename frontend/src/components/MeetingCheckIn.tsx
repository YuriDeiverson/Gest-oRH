import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../config/config";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  date: string;
  stats?: {
    totalPresences: number;
    checkedIn: number;
    pending: number;
  };
}

const MeetingCheckIn: React.FC = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const memberId = localStorage.getItem("memberId");

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/presences/meetings?upcoming=true`,
      );
      const data = await response.json();

      if (response.ok) {
        setMeetings(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (meetingId: string) => {
    if (!memberId) return;

    setCheckingIn(meetingId);
    setSuccess(null);

    try {
      const response = await fetch(`${API_BASE_URL}/presences/checkin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId,
          memberId,
          location: "Online", // Pode ser customizado
        }),
      });

      if (response.ok) {
        setSuccess(meetingId);
        loadMeetings();

        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingIn(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (meetings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <svg
          className="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Nenhuma reunião agendada
        </h3>
        <p className="text-gray-500 text-sm">
          Não há reuniões programadas no momento
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Reuniões</h2>

      {meetings.map((meeting) => (
        <div
          key={meeting.id}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center shrink-0">
                  <svg
                    className="w-6 h-6 text-primary-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {meeting.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {formatDate(meeting.date)}
                  </p>
                </div>
              </div>

              {meeting.description && (
                <p className="text-gray-700 mb-4">{meeting.description}</p>
              )}

              {meeting.stats && (
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>✅ {meeting.stats.checkedIn} presentes</span>
                  <span>⏳ {meeting.stats.pending} pendentes</span>
                </div>
              )}
            </div>

            <div className="shrink-0">
              {success === meeting.id ? (
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Check-in realizado!
                </div>
              ) : (
                <button
                  onClick={() => handleCheckIn(meeting.id)}
                  disabled={checkingIn === meeting.id || isPast(meeting.date)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    isPast(meeting.date)
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {checkingIn === meeting.id ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processando...
                    </span>
                  ) : isPast(meeting.date) ? (
                    "Reunião encerrada"
                  ) : (
                    "Fazer Check-in"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MeetingCheckIn;
