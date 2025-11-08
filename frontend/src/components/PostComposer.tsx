import React, { useState } from "react";
import { config } from "../config/config";

const API_URL = config.apiUrl;

interface Props {
  memberId?: string | null;
  onPosted?: () => void;
  onNewPost?: (content: string) => void;
}

const PostComposer: React.FC<Props> = ({ memberId, onPosted, onNewPost }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");

    try {
      // Adicionar o post imediatamente à lista (otimistic update)
      if (onNewPost) {
        onNewPost(content);
      }

      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorId: memberId, content }),
      });

      if (!res.ok) {
        // Se API falhar, o post já foi adicionado localmente
        console.warn("API não disponível, post adicionado localmente");
      }

      setContent("");
      if (onPosted) onPosted(); // Atualizar outros dados se necessário
    } catch (err: unknown) {
      const e = err as { message?: string } | undefined;
      const msg = e && e.message ? e.message : String(err);
      setError(msg || "Erro ao publicar");

      // O post já foi adicionado otimisticamente, manter na lista
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Compartilhe uma atualização, oportunidade ou pergunta..."
          className="w-full p-3 border border-gray-200 rounded-md resize-none"
          rows={3}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !content.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-md disabled:opacity-50"
          >
            {loading ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
