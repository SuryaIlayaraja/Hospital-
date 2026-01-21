import React, { useState } from "react";
import { X } from "lucide-react";
import { useTickets } from "../hooks/useTickets";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ReportTicket: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addTicket } = useTickets();
  const [title, setTitle] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high">("medium");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("General");
  const [issueCategory, setIssueCategory] = useState<"Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment">("Delay");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Add ticket to localStorage
    const newTicket = addTicket({
      title,
      severity,
      description,
      department,
      issueCategory,
    });

    // Also create downloadable markdown
    const md = `# ${title}\n\n- Ticket ID: ${
      newTicket.id
    }\n- Issue Category: ${issueCategory}\n- Severity: ${severity}\n- Department: ${department}\n- Date: ${new Date().toISOString()}\n\n## Description\n\n${description}\n`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${newTicket.id}.md`;
    a.click();
    URL.revokeObjectURL(url);

    // Reset form and close after 1s
    setTimeout(() => {
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setDepartment("General");
      setIssueCategory("Delay");
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Raise Issue Ticket</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Issue Category</label>
              <select
                value={issueCategory}
                onChange={(e) =>
                  setIssueCategory(e.target.value as "Delay" | "Misbehavior" | "Overcharging" | "Hygiene" | "Equipment")
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="Delay">Delay</option>
                <option value="Misbehavior">Misbehavior</option>
                <option value="Overcharging">Overcharging</option>
                <option value="Hygiene">Hygiene</option>
                <option value="Equipment">Equipment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Department</label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Severity</label>
              <select
                value={severity}
                onChange={(e) =>
                  setSeverity(e.target.value as "low" | "medium" | "high")
                }
                className="w-full px-3 py-2 border rounded"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">
              Description <span className="text-gray-400 text-xs">(Optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about the issue (optional)"
              rows={6}
              className="w-full px-3 py-2 border rounded"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Download Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportTicket;
