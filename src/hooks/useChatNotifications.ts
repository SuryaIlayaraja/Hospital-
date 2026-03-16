import { useEffect, useMemo, useState } from "react";
import type { Socket } from "socket.io-client";
import { createChatSocket } from "../services/chatService";

type UnreadMap = Record<string, number>;

const STORAGE_KEY = "ticket_chat_unread_v1";

function loadUnread(): UnreadMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return parsed as UnreadMap;
  } catch {
    return {};
  }
}

function saveUnread(map: UnreadMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore
  }
}

export function useChatNotifications(isEnabled: boolean) {
  const [unread, setUnread] = useState<UnreadMap>(() => loadUnread());

  const totalUnread = useMemo(() => {
    return Object.values(unread).reduce((a, b) => a + b, 0);
  }, [unread]);

  useEffect(() => {
    if (!isEnabled) return;

    const socket: Socket = createChatSocket("admin");

    socket.on("ticket_message", (payload: any) => {
      const ticketId = typeof payload?.ticketId === "string" ? payload.ticketId : null;
      const msg = payload?.message;
      if (!ticketId) return;
      if (msg?.senderType === "admin") return; // don't count own messages

      setUnread((prev) => {
        const next = { ...prev, [ticketId]: (prev[ticketId] || 0) + 1 };
        saveUnread(next);
        return next;
      });
    });

    return () => {
      try {
        socket.disconnect();
      } catch {
        // ignore
      }
    };
  }, [isEnabled]);

  const clearUnread = (ticketId: string) => {
    setUnread((prev) => {
      const next = { ...prev };
      delete next[ticketId];
      saveUnread(next);
      return next;
    });
  };

  const clearAll = () => {
    setUnread(() => {
      const next = {};
      saveUnread(next);
      return next;
    });
  };

  return { unread, totalUnread, clearUnread, clearAll };
}

