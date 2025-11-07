import axios from "axios";
import { config } from "../config/config";

export const api = axios.create({
  baseURL: config.apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token de admin quando necessário
export const setAdminToken = (token?: string) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
};

// Tipos
export interface Intention {
  id: string;
  name: string;
  email: string;
  company: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IntentionFormData {
  name: string;
  email: string;
  company: string;
  reason: string;
}

export interface Member {
  id: string;
  intentionId: string;
  phone: string;
  linkedin?: string;
  profession: string;
  segment: string;
  companyDescription?: string;
  isActive: boolean;
  joinedAt: string;
  intention?: {
    name: string;
    email: string;
    company: string;
  };
}

export interface MemberFormData {
  phone: string;
  linkedin?: string;
  profession: string;
  segment: string;
  companyDescription?: string;
}

export interface Referral {
  id: string;
  giverId: string;
  receiverId: string;
  companyName: string;
  contactName: string;
  contactInfo: string;
  opportunity: string;
  status: "NEW" | "IN_CONTACT" | "NEGOTIATING" | "CLOSED" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  giver?: any;
  receiver?: any;
}

export interface ReferralFormData {
  giverId: string;
  receiverId: string;
  companyName: string;
  contactName: string;
  contactInfo: string;
  opportunity: string;
}

// API Functions
export const intentionService = {
  create: async (data: IntentionFormData) => {
    const response = await api.post<{ message: string; data: Intention }>(
      "/intentions",
      data,
    );
    return response.data;
  },

  list: async (status?: string) => {
    const response = await api.get<{ data: Intention[] }>("/intentions", {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: Intention }>(`/intentions/${id}`);
    return response.data;
  },

  approve: async (id: string) => {
    const response = await api.patch<{
      message: string;
      data: Intention;
      registrationLink: string;
    }>(`/intentions/${id}/approve`);
    return response.data;
  },

  reject: async (id: string) => {
    const response = await api.patch<{ message: string; data: Intention }>(
      `/intentions/${id}/reject`,
    );
    return response.data;
  },

  validateToken: async (token: string) => {
    const response = await api.get<{
      valid: boolean;
      data: { name: string; email: string; company: string };
    }>(`/intentions/validate/${token}`);
    return response.data;
  },
};

export const memberService = {
  register: async (token: string, data: MemberFormData) => {
    const response = await api.post<{ message: string; data: Member }>(
      `/members/register/${token}`,
      data,
    );
    return response.data;
  },

  list: async (isActive?: boolean) => {
    const response = await api.get<{ data: Member[] }>("/members", {
      params: isActive !== undefined ? { isActive } : undefined,
    });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: Member }>(`/members/${id}`);
    return response.data;
  },

  stats: async () => {
    const response = await api.get<{ data: any }>("/members/stats");
    return response.data;
  },
};

export const referralService = {
  create: async (data: ReferralFormData) => {
    const response = await api.post<{ message: string; data: Referral }>(
      "/referrals",
      data,
    );
    return response.data;
  },

  listByMember: async (memberId: string, type?: "given" | "received") => {
    const response = await api.get<{ data: Referral[] }>(
      `/referrals/member/${memberId}`,
      {
        params: type ? { type } : undefined,
      },
    );
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ data: Referral }>(`/referrals/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await api.patch<{ message: string; data: Referral }>(
      `/referrals/${id}/status`,
      { status },
    );
    return response.data;
  },

  update: async (id: string, data: Partial<ReferralFormData>) => {
    const response = await api.patch<{ message: string; data: Referral }>(
      `/referrals/${id}`,
      data,
    );
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<{ message: string }>(`/referrals/${id}`);
    return response.data;
  },

  stats: async () => {
    const response = await api.get<{ data: any }>("/referrals/stats");
    return response.data;
  },
};
