import React from "react";
import { AlertCircle, CheckCircle, Clock, Trash2 } from "lucide-react";
import { Ticket } from "../hooks/useTickets";

interface Props {
  tickets: Ticket[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Ticket["status"]) => void;
}

const TicketsList: React.FC<Props> = ({
  tickets,
  onDelete,
  onStatusChange,
}) => {
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
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Clock className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "text-red-600";
      case "in-progress":
        return "text-yellow-600";
      case "resolved":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white border-opacity-30 text-center">
        <p className="text-gray-600">No tickets raised yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div
          key={ticket.id}
          className="bg-white bg-opacity-20 backdrop-blur-md rounded-xl p-6 shadow-xl border border-white border-opacity-30 hover:bg-opacity-30 transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {ticket.title}
                </h3>
                <span
                  className={`px-2 py-1 text-xs font-bold border rounded ${getSeverityColor(
                    ticket.severity
                  )}`}
                >
                  {ticket.severity.toUpperCase()}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>ID: {ticket.id}</span>
                <span>Dept: {ticket.department}</span>
                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <button
              onClick={() => onDelete(ticket.id)}
              className="ml-4 p-2 rounded hover:bg-red-100 text-red-600 transition-colors duration-150"
              aria-label="Delete ticket"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 pt-3 border-t border-white border-opacity-20">
            <span className="text-sm font-medium text-gray-700">Status:</span>
            <div className="flex gap-2">
              {(["open", "in-progress", "resolved"] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => onStatusChange(ticket.id, status)}
                  className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-medium transition-all ${
                    ticket.status === status
                      ? `${getStatusColor(
                          status
                        )} bg-white bg-opacity-50 border-2 border-${
                          status === "open"
                            ? "red"
                            : status === "in-progress"
                            ? "yellow"
                            : "green"
                        }-400`
                      : "text-gray-500 hover:bg-white hover:bg-opacity-20"
                  }`}
                >
                  {getStatusIcon(status)}
                  {status === "in-progress"
                    ? "In Progress"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TicketsList;
