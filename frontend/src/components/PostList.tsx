import React, { useEffect, useState, useCallback } from "react";
import { config } from "../config/config";

const API_URL = config.apiUrl;

interface Post {
  id: string;
  content: string;
  createdAt: string;
  author?: { intention?: { name?: string } } | null;
}

// Dados mockados para demonstração
const mockPosts: Post[] = [
  {
    id: "1",
    content:
      "Acabei de fechar uma excelente parceria com uma empresa de tecnologia! Networking funciona mesmo. Obrigado a todos que me ajudaram com indicações! 🚀",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 horas atrás
    author: { intention: { name: "Carlos Silva" } },
  },
  {
    id: "2",
    content:
      "Estou procurando um bom contador para minha empresa. Alguém tem alguma indicação? Preciso de alguém especializado em e-commerce.",
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 horas atrás
    author: { intention: { name: "Ana Costa" } },
  },
  {
    id: "3",
    content:
      "Compartilhando uma oportunidade: minha empresa está precisando de um desenvolvedor React. Salário competitivo e modelo híbrido. Interessados podem me chamar no privado.",
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 horas atrás
    author: { intention: { name: "Roberto Mendes" } },
  },
  {
    id: "4",
    content:
      "Pessoal, vocês conhecem alguma empresa de logística confiável para transportes nacionais? Preciso de um parceiro para expandir meus negócios.",
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 horas atrás
    author: { intention: { name: "Fernanda Lima" } },
  },
  {
    id: "5",
    content:
      "Participei ontem de um evento incrível sobre inovação. Conheci pessoas fantásticas e já surgiram algumas oportunidades. O networking presencial ainda é imbatível! 💼",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
    author: { intention: { name: "João Santos" } },
  },
];

interface Props {
  refreshKey?: number;
  onAddPost?: (addPostFn: (content: string) => void) => void;
}

const PostList: React.FC<Props> = ({ refreshKey, onAddPost }) => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`);
      if (res.ok) {
        const json = await res.json();
        // Combinar posts da API com posts mockados, API primeiro
        const apiPosts = json.data || [];
        setPosts([...apiPosts, ...mockPosts]);
      } else {
        // Se API falhar, usar apenas dados mockados
        setPosts(mockPosts);
      }
    } catch (err) {
      console.error(err);
      // Fallback para dados mockados
      setPosts(mockPosts);
    } finally {
      setLoading(false);
    }
  };

  const addNewPost = useCallback((newPostContent: string) => {
    const newPost = {
      id: `new-${Date.now()}`,
      content: newPostContent,
      createdAt: new Date().toISOString(),
      author: {
        intention: { name: "Você" },
      },
    };
    setPosts((prevPosts) => [newPost, ...prevPosts]);
  }, []);

  useEffect(() => {
    load();
  }, [refreshKey]);

  useEffect(() => {
    if (onAddPost && addNewPost) {
      onAddPost(addNewPost);
    }
    // Executar apenas uma vez quando o componente montar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="p-4">Carregando feed...</div>;

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <div
          key={p.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="font-medium text-gray-700">
                {p.author?.intention?.name?.charAt(0) || "U"}
              </span>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">
                {p.author?.intention?.name || "Usuário"}
              </div>
              <div className="text-xs text-gray-500">
                {new Date(p.createdAt).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-800 whitespace-pre-line">
            {p.content}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
