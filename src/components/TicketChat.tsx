import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import {
  ChatMessage,
  ChatSenderType,
  createChatSocket,
  fetchChatHistory,
  uploadChatFile,
} from "../services/chatService";

type Props = {
  ticketId: string;
  role: ChatSenderType;
  patientChatToken?: string;
  onClose?: () => void;
  title?: string;
};

const TicketChat: React.FC<Props> = ({
  ticketId,
  role,
  patientChatToken,
  onClose,
  title,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [otherOnline, setOtherOnline] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  const headerTitle = useMemo(() => {
    if (title) return title;
    return `Chat • ${ticketId}`;
  }, [title, ticketId]);

  useEffect(() => {
    let active = true;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const history = await fetchChatHistory(ticketId, 200, patientChatToken);
        if (!active) return;
        setMessages(history.data || []);
      } catch (e) {
        if (!active) return;
        setError(e instanceof Error ? e.message : "Failed to load chat");
      } finally {
        if (active) setLoading(false);
      }

      const sock = createChatSocket(role, patientChatToken);
      socketRef.current = sock;

      sock.emit("join_ticket", { ticketId });
      sock.on("new_message", (msg: ChatMessage) => {
        if (!msg || msg.ticketId !== ticketId) return;
        setMessages((prev) => [...prev, msg]);
      });

      sock.on("chat_error", (payload: any) => {
        const m = typeof payload?.message === "string" ? payload.message : "Chat error";
        setError(m);
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
    };

    init();

    return () => {
      active = false;
      const sock = socketRef.current;
      socketRef.current = null;
      try {
        sock?.emit("leave_ticket", { ticketId });
        sock?.disconnect();
      } catch {
        // ignore
      }
    };
  }, [ticketId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (loading) return;
    socketRef.current?.emit("mark_read", { ticketId });
  }, [loading, ticketId]);

  const send = () => {
    const clean = text.trim();
    if (!clean) return;
    socketRef.current?.emit("send_message", { ticketId, message: clean });
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

  const onPickFile = async (file: File | null) => {
    if (!file) return;
    setError(null);
    try {
      setUploading(true);
      const uploaded = await uploadChatFile(ticketId, file);
      socketRef.current?.emit("send_message", {
        ticketId,
        message: "",
        attachments: [uploaded.data],
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
        <div className="min-w-0">
          <div className="font-bold text-gray-900 dark:text-white truncate">
            {headerTitle}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            You are chatting as {role}. {otherLabel}:{" "}
            <span className={otherOnline ? "text-green-600 dark:text-green-400 font-bold" : "text-gray-500"}>
              {otherOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg text-sm font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200"
          >
            Close
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
          <label className="px-3 py-2 rounded-xl font-bold bg-gray-200 hover:bg-gray-300 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 cursor-pointer text-sm">
            {uploading ? "Uploading…" : "Attach"}
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                // allow selecting same file again later
                e.target.value = "";
                onPickFile(f);
              }}
              disabled={uploading}
            />
          </label>
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

