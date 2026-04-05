import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  ChatMessage,
  ChatSenderType,
  createChatSocket,
  fetchChatHistory,
} from "../services/chatService";

type Props = {
  ticketId: string;
  role: ChatSenderType;
  patientChatToken?: string;
  clerkUserId?: string;
  onClose?: () => void;
  title?: string;
};

const TicketChat: React.FC<Props> = ({
  ticketId,
  role,
  patientChatToken,
  clerkUserId,
  onClose,
  title,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);

  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const headerTitle = useMemo(() => {
    if (title) return title;
    return `Chat • ${ticketId}`;
  }, [title, ticketId]);

  useEffect(() => {
    let active = true;

    // Resolve the best available token for this patient
    const resolvedToken =
      patientChatToken ||
      localStorage.getItem(`ticket_chat_token:${ticketId}`) ||
      undefined;

    // Create socket FIRST so we don't miss messages that arrive during history fetch
    console.log("[TicketChat] Creating socket", {
      ticketId,
      role,
      hasPatientToken: !!patientChatToken,
      hasResolvedToken: !!resolvedToken,
      clerkUserId,
    });
    
    // For admin, ensure we have an auth token
    if (role === "admin") {
      const adminToken = localStorage.getItem("authToken");
      console.log("[TicketChat] Admin token check:", {
        hasAdminToken: !!adminToken,
        tokenLength: adminToken ? adminToken.length : 0,
      });
      if (!adminToken) {
        console.warn("[TicketChat] Admin opening chat without token!");
      }
    }
    
    const sock = createChatSocket(role, resolvedToken, clerkUserId);
    socketRef.current = sock;

    sock.on("connect", () => {
      console.log("[TicketChat] Socket connected", { ticketId, role, socketId: sock.id });
      if (active) setSocketConnected(true);
      setError(null);
      // Join the ticket room once connected
      sock.emit("join_ticket", { ticketId });
    });

    sock.on("disconnect", () => {
      console.log("[TicketChat] Socket disconnected", { ticketId, role });
      if (active) setSocketConnected(false);
    });

    sock.on("connect_error", (err: Error) => {
      console.log("[TicketChat] Socket connection error", { ticketId, role, error: err.message });
      if (active) {
        setSocketConnected(false);
        setError(`Connection failed: ${err.message}`);
      }
    });

    // If already connected before listeners registered, join immediately
    if (sock.connected) {
      setSocketConnected(true);
      sock.emit("join_ticket", { ticketId });
    }

    // Accept all new_message events (we're already in the correct room on the server)
    sock.on("new_message", (msg: ChatMessage) => {
      if (!msg) return;
      setMessages((prev) => {
        // Deduplicate by _id in case the message was already added
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    sock.on("chat_error", (payload: any) => {
      const m = typeof payload?.message === "string" ? payload.message : "Chat error";
      setError(m);
    });

    sock.on("join_error", (payload: any) => {
      const m = typeof payload?.message === "string" ? payload.message : "Failed to join chat";
      setError(`Chat access denied: ${m}. Your chat token may be missing or expired.`);
    });

    sock.on("presence", (payload: any) => {
      if (payload?.ticketId !== ticketId) return;
      const isOtherOnline =
        role === "admin" ? !!payload?.patientOnline : !!payload?.adminOnline;
      setOtherOnline(isOtherOnline);
    });

    sock.on("typing", (payload: any) => {
      if (payload?.ticketId !== ticketId) return;
      if (payload?.from === role) return;
      setOtherTyping(!!payload?.isTyping);
    });

    sock.on("read_receipt", (payload: any) => {
      if (payload?.ticketId !== ticketId) return;
      const r = payload?.role as ChatSenderType | undefined;
      const readAt = typeof payload?.readAt === "string" ? payload.readAt : undefined;
      if (!r || !readAt) return;
      setMessages((prev) =>
        prev.map((m) => ({
          ...m,
          readBy: {
            ...m.readBy,
            ...(r === "admin" ? { adminAt: readAt } : { patientAt: readAt }),
          },
        }))
      );
    });

    // Fetch chat history after socket is set up
    const loadHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const history = await fetchChatHistory(ticketId, 200, resolvedToken);
        if (!active) return;
        // Merge history with any socket messages that arrived during the fetch
        setMessages((prev) => {
          const historical = history.data || [];
          const existingIds = new Set(historical.map((m) => m._id));
          // Append any socket messages not already in history (avoid duplicates)
          const extra = prev.filter((m) => !existingIds.has(m._id));
          return [...historical, ...extra];
        });
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load chat history");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadHistory();

    return () => {
      active = false;
      const s = socketRef.current;
      socketRef.current = null;
      try {
        s?.emit("leave_ticket", { ticketId });
        s?.disconnect();
      } catch {
        // ignore
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, role, patientChatToken]);

  // Auto-scroll disabled — users scroll manually

  useEffect(() => {
    if (loading) return;
    socketRef.current?.emit("mark_read", { ticketId });
  }, [loading, ticketId]);

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    const sock = socketRef.current;
    if (!sock || !sock.connected) {
      setError("Not connected to chat. Please wait a moment and try again.");
      return;
    }
    sock.emit("send_message", { ticketId, message: clean });
    setText("");
  };


  const otherLabel = role === "admin" ? "Patient" : "Admin";
  const otherRole: ChatSenderType = role === "admin" ? "patient" : "admin";

  const myLastMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i].senderType === role) return messages[i]._id;
    }
    return null;
  }, [messages, role]);

  const otherReadAt = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const rb = messages[i].readBy;
      const v = otherRole === "admin" ? rb?.adminAt : rb?.patientAt;
      if (v) return v;
    }
    return undefined;
  }, [messages, otherRole]);

  const isLastMessageSeen = useMemo(() => {
    if (!myLastMessageId || !otherReadAt) return false;
    const myLast = messages.find((m) => m._id === myLastMessageId);
    if (!myLast) return false;
    return new Date(otherReadAt).getTime() >= new Date(myLast.createdAt).getTime();
  }, [messages, myLastMessageId, otherReadAt]);



  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-bold text-gray-900 dark:text-white truncate">
              {headerTitle}
            </div>
            <div
              className={`flex-shrink-0 w-2 h-2 rounded-full ${socketConnected ? "bg-green-500" : "bg-orange-400 animate-pulse"}`}
              title={socketConnected ? "Connected" : "Connecting…"}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {socketConnected ? `${otherLabel}: ` : "Connecting to chat… "}
            {socketConnected && (
              <span className={otherOnline ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-500"}>
                {otherOnline ? "Online" : "Offline"}
              </span>
            )}
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
          >
            Close
          </button>
        )}
      </div>

      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">Loading chat…</div>
        ) : messages.length === 0 ? (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            No messages yet. Send the first message.
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={`flex ${m.senderType === role ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2 border text-sm ${
                  m.senderType === role
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700"
                }`}
              >
                {m.message ? (
                  <div className="whitespace-pre-wrap break-words">{m.message}</div>
                ) : null}

                {Array.isArray(m.attachments) && m.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {m.attachments.map((a, idx) => (
                      <div key={`${m._id}-att-${idx}`} className="text-xs">
                        {a.kind === "image" ? (
                          <a href={a.url} target="_blank" rel="noreferrer">
                            <img
                              src={a.url}
                              alt={a.name}
                              className="max-h-40 rounded-xl border border-white/20 object-contain bg-black/10"
                            />
                          </a>
                        ) : (
                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-bold"
                          >
                            {a.name}
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div
                  className={`mt-1 text-[10px] ${
                    m.senderType === role ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {m.senderType.toUpperCase()} • {new Date(m.createdAt).toLocaleString()}
                  {m._id === myLastMessageId && m.senderType === role && (
                    <span className="ml-2 font-bold">
                      {isLastMessageSeen ? "Seen" : "Sent"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        {!loading && otherTyping && (
          <div className="text-xs text-gray-500 dark:text-gray-400">{otherLabel} is typing…</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/60">
        {error && (
          <div className="mb-2 text-xs font-bold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        <div className="flex gap-2">

          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
            onInput={() => {
              socketRef.current?.emit("typing", { ticketId, isTyping: true });
              if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = window.setTimeout(() => {
                socketRef.current?.emit("typing", { ticketId, isTyping: false });
              }, 900);
            }}
            placeholder="Type a message…"
            className="flex-1 px-4 py-2 rounded-xl bg-white dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={send}
            className="px-4 py-2 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketChat;

