import { useState, useEffect, useCallback } from "react";
import { getAuthToken } from "../services/apiService";

export interface Ticket {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high";
  department: string;
  issueCategory: "Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment";
  createdAt: string;
  status: "open" | "in-progress" | "resolved";
  updatedAt?: string;
  clerkUserId?: string;
}

export type TicketCreateResult = { ticket: Ticket; patientChatToken?: string };

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type UseTicketsOptions = {
  /** Clerk session token — used to load only this user’s tickets from GET /tickets/mine (never loads other accounts). */
  getClerkToken?: () => Promise<string | null | undefined>;
};

function mergeLocalTicketsWithChatTokens(apiTickets: Ticket[]): Ticket[] {
  const byId = new Map(apiTickets.map((t) => [t.id, t]));
  try {
    const stored = localStorage.getItem("hospital_tickets");
    if (!stored) return apiTickets;
    const local: Ticket[] = JSON.parse(stored);
    for (const t of local) {
      if (byId.has(t.id)) continue;
      if (localStorage.getItem(`ticket_chat_token:${t.id}`)) {
        byId.set(t.id, t);
      }
    }
  } catch {
    /* ignore */
  }
  return Array.from(byId.values()).sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export const useTickets = (options?: UseTicketsOptions) => {
  const getClerkToken = options?.getClerkToken;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const adminToken = getAuthToken();

      if (adminToken) {
        const response = await fetch(`${API_BASE_URL}/tickets/all`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch tickets");
        }
        const data = await response.json();
        if (data.success) {
          setTickets(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch tickets");
        }
        return;
      }

      if (getClerkToken) {
        const ct = await getClerkToken();
        if (ct) {
          const response = await fetch(`${API_BASE_URL}/tickets/mine`, {
            headers: { Authorization: `Bearer ${ct}` },
          });
          if (response.status === 503) {
            throw new Error("Server cannot verify patient session");
          }
          if (!response.ok) {
            throw new Error("Failed to fetch tickets");
          }
          const data = await response.json();
          if (data.success) {
            setTickets(mergeLocalTicketsWithChatTokens(data.data || []));
          } else {
            throw new Error(data.message || "Failed to fetch tickets");
          }
          return;
        }
      }

      setTickets([]);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tickets",
      );
      const stored = localStorage.getItem("hospital_tickets");
      if (stored) {
        try {
          setTickets(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to load tickets from localStorage", e);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [getClerkToken]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const addTicket = async (
    ticket: Omit<Ticket, "id" | "createdAt" | "status">,
    clerkUserId?: string
  ) => {
    try {
      const patientToken = localStorage.getItem("patientToken");
      const response = await fetch(`${API_BASE_URL}/tickets/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(patientToken ? { Authorization: `Bearer ${patientToken}` } : {}),
        },
        body: JSON.stringify({
          ...ticket,
          clerkUserId: clerkUserId // Associate with Clerk ID
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();
      if (data.success) {
        setTickets((prev) => [data.data, ...prev]);
        // Update local storage for redundancy
        const stored = localStorage.getItem("hospital_tickets");
        const currentTickets = stored ? JSON.parse(stored) : [];
        localStorage.setItem("hospital_tickets", JSON.stringify([data.data, ...currentTickets]));

        return { ticket: data.data as Ticket, patientChatToken: data.patientChatToken as string | undefined };
      } else {
        throw new Error(data.message || "Failed to create ticket");
      }
    } catch (error) {
      console.error("Error creating ticket:", error);
      // Fallback to localStorage
      const newTicket: Ticket = {
        ...ticket,
        id: `TICKET-${Date.now()}`,
        createdAt: new Date().toISOString(),
        status: "open",
      };
      
      const stored = localStorage.getItem("hospital_tickets");
      const currentTickets = stored ? JSON.parse(stored) : [];
      const updatedTickets = [newTicket, ...currentTickets];
      localStorage.setItem("hospital_tickets", JSON.stringify(updatedTickets));
      setTickets(updatedTickets);

      return { ticket: newTicket };
    }
  };

  const updateTicket = async (id: string, updates: Partial<Ticket>) => {
    try {
      if (updates.status) {
        const response = await fetch(`${API_BASE_URL}/tickets/${id}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: updates.status }),
        });

        if (!response.ok) {
          throw new Error("Failed to update ticket");
        }

        const data = await response.json();
        if (data.success) {
          setTickets((prev) => prev.map((t) => (t.id === id ? data.data : t)));
          return;
        } else {
          throw new Error(data.message || "Failed to update ticket");
        }
      }

      // For other updates, update locally
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    } catch (error) {
      console.error("Error updating ticket:", error);
      // Fallback to local update
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete ticket");
      }

      const data = await response.json();
      if (data.success) {
        setTickets((prev) => prev.filter((t) => t.id !== id));
        return;
      } else {
        throw new Error(data.message || "Failed to delete ticket");
      }
    } catch (error) {
      console.error("Error deleting ticket:", error);
      // Fallback to local delete
      setTickets((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return {
    tickets,
    loading,
    error,
    addTicket,
    updateTicket,
    deleteTicket,
    refetch: fetchTickets,
  };
};
