import React from "react";
import { AlertCircle } from "lucide-react";

interface Props {
  onOpen: () => void;
}

const ReportNavbar: React.FC<Props> = ({ onOpen }) => {
  return (
    <div className="flex items-center gap-3">
      <button
        onClick={onOpen}
        className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-colors duration-150 font-medium"
        aria-label="Raise Ticket"
      >
        <AlertCircle className="h-4 w-4" />
        Raise Ticket
      </button>
    </div>
  );
};

export default ReportNavbar;
