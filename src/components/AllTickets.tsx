import React, { useState } from "react";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Filter,
} from "lucide-react";
import { Ticket } from "../hooks/useTickets";

interface Props {
  tickets: Ticket[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Ticket["status"]) => void;
}

const AllTickets: React.FC<Props> = ({ tickets, onDelete, onStatusChange }) => {
  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "open" | "in-progress" | "resolved"
  >("all");

  const filteredTickets =
    filterStatus === "all"
      ? tickets
      : tickets.filter((t) => t.status === filterStatus);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-5 w-5" />;
      case "in-progress":
        return <Clock className="h-5 w-5" />;
      case "resolved":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-red-600 bg-red-50 border-red-300";
      case "in-progress":
        return "text-yellow-600 bg-yellow-50 border-yellow-300";
      case "resolved":
        return "text-green-600 bg-green-50 border-green-300";
      default:
        return "text-gray-600 bg-gray-50 border-gray-300";
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-500 text-white";
      case "in-progress":
        return "bg-yellow-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "open":
        return "Ongoing";
      case "in-progress":
        return "In Progress";
      case "resolved":
        return "Closed";
      default:
        return status;
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
        <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600 font-medium">No tickets raised yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Click "Raise Ticket" to create your first ticket.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="font-bold text-gray-800">Filter by Status</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { value: "all", label: "All Tickets" },
              { value: "open", label: "Ongoing" },
              { value: "in-progress", label: "In Progress" },
              { value: "resolved", label: "Closed" },
            ] as const
          ).map((filter) => (
            <button
              key={filter.value}
              onClick={() => setFilterStatus(filter.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                filterStatus === filter.value
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {filter.label}
              {filter.value !== "all" && (
                <span className="ml-2 text-sm">
                  ({tickets.filter((t) => t.status === filter.value).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200 text-center">
            <p className="text-gray-600">No {filterStatus} tickets found.</p>
          </div>
        ) : (
          filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              {/* Ticket Header */}
              <div
                className={`p-6 cursor-pointer ${getStatusColor(
                  ticket.status
                )}`}
                onClick={() =>
                  setExpandedTicketId(
                    expandedTicketId === ticket.id ? null : ticket.id
                  )
                }
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadgeColor(
                            ticket.status
                          )}`}
                        >
                          {getStatusLabel(ticket.status)}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs font-bold border rounded ${getSeverityColor(
                          ticket.severity
                        )}`}
                      >
                        {ticket.severity.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {ticket.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>ID: {ticket.id}</span>
                      <span>Dept: {ticket.department}</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button className="p-2 rounded-lg hover:bg-white hover:bg-opacity-50 transition-colors">
                    {expandedTicketId === ticket.id ? (
                      <ChevronUp className="h-6 w-6 text-gray-600" />
                    ) : (
                      <ChevronDown className="h-6 w-6 text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              {expandedTicketId === ticket.id && (
                <div className="border-t border-gray-200 p-6 bg-gray-50">
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-800 mb-2">
                      Description
                    </h4>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {ticket.description}
                    </p>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800 mb-3">
                      Change Status
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(
                        [
                          { value: "open", label: "Mark as Ongoing" },
                          {
                            value: "in-progress",
                            label: "Mark as In Progress",
                          },
                          { value: "resolved", label: "Mark as Closed" },
                        ] as const
                      ).map((status) => (
                        <button
                          key={status.value}
                          onClick={() =>
                            onStatusChange(ticket.id, status.value)
                          }
                          className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                            ticket.status === status.value
                              ? `${getStatusBadgeColor(status.value)} shadow-lg`
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          }`}
                        >
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          `Are you sure you want to delete ticket ${ticket.id}?`
                        )
                      ) {
                        onDelete(ticket.id);
                        setExpandedTicketId(null);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium"
                  >
                    <Trash2 className="h-5 w-5" />
                    Delete Ticket
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredTickets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-4 text-center">
            <p className="text-red-600 font-bold text-2xl">
              {tickets.filter((t) => t.status === "open").length}
            </p>
            <p className="text-red-700 text-sm font-medium">Ongoing Tickets</p>
          </div>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-4 text-center">
            <p className="text-yellow-600 font-bold text-2xl">
              {tickets.filter((t) => t.status === "in-progress").length}
            </p>
            <p className="text-yellow-700 text-sm font-medium">
              In Progress Tickets
            </p>
          </div>
          <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-4 text-center">
            <p className="text-green-600 font-bold text-2xl">
              {tickets.filter((t) => t.status === "resolved").length}
            </p>
            <p className="text-green-700 text-sm font-medium">Closed Tickets</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTickets;
