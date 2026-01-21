import { useState, useEffect } from "react";

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
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const useTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load tickets from API on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/tickets/all`);
      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }
      const data = await response.json();
      if (data.success) {
        setTickets(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch tickets");
      }
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setError(
        error instanceof Error ? error.message : "Failed to fetch tickets"
      );
      // Fallback to localStorage if API fails
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
  };

  const addTicket = async (
    ticket: Omit<Ticket, "id" | "createdAt" | "status">
  ) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });

      if (!response.ok) {
        throw new Error("Failed to create ticket");
      }

      const data = await response.json();
      if (data.success) {
        setTickets((prev) => [data.data, ...prev]);
        return data.data;
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
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
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
