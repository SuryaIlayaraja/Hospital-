import { io, Socket } from "socket.io-client";
import { getAuthToken } from "./apiService";

export type ChatSenderType = "admin" | "patient";

export interface ChatMessage {
  _id: string;
  ticketId: string;
  senderType: ChatSenderType;
  senderId?: string;
  message: string;
  attachments?: Array<{
    kind: "file" | "image";
    url: string;
    name: string;
    mime?: string;
    size?: number;
  }>;
  readBy?: {
    adminAt?: string;
    patientAt?: string;
  };
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const SOCKET_BASE_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000");

export async function fetchChatHistory(
  ticketId: string,
  limit: number = 200,
  patientChatToken?: string
) {
  const token = getAuthToken();
  const patientJwt = localStorage.getItem("patientToken");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  else if (patientJwt) headers.Authorization = `Bearer ${patientJwt}`;
  if (patientChatToken) headers["x-chat-token"] = patientChatToken;

  const res = await fetch(
    `${API_BASE_URL}/chat/${encodeURIComponent(ticketId)}?limit=${limit}`,
    { headers }
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to fetch chat history");
  }
  return data as { success: boolean; data: ChatMessage[] };
}

export async function uploadChatFile(ticketId: string, file: File) {
  const token = getAuthToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE_URL}/chat/${encodeURIComponent(ticketId)}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data?.message || "Failed to upload file");
  }
  return data as {
    success: boolean;
    data: {
      ticketId: string;
      kind: "file" | "image";
      url: string;
      name: string;
      mime?: string;
      size?: number;
    };
  };
}

export function createChatSocket(
  role: ChatSenderType,
  patientChatToken?: string
): Socket {
  const token = getAuthToken();
  const patientJwt = localStorage.getItem("patientToken");
  return io(SOCKET_BASE_URL, {
    transports: ["websocket"],
    auth:
      role === "admin" && token
        ? { token: `Bearer ${token}` }
        : role === "patient"
          ? patientJwt
            ? { patientToken: patientJwt }
            : patientChatToken
              ? { chatToken: patientChatToken }
              : {}
          : {},
  });
}

