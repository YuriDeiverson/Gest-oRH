import React, { useEffect, useState } from "react";
import { config } from "../config/config";

const API_URL = config.apiUrl;

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: { intention?: { name?: string } } | null;
}

const PostList: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (!res.ok) throw new Error("Erro ao carregar feed");
      const json = await res.json();
      setPosts(json.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  if (loading) return <div className="p-4">Carregando feed...</div>;

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-700">{p.author?.intention?.name?.charAt(0) || "U"}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">{p.author?.intention?.name || "Usuário"}</div>
              <div className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleString()}</div>
            </div>
          </div>

          <div className="text-sm text-gray-800 whitespace-pre-line">{p.content}</div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
