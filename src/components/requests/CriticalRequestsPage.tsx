import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { requestAPI } from "../../services/api";
import { HelpRequest } from "../../types";

const CriticalRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<HelpRequest[]>([]);

  React.useEffect(() => {
    const loadRequests = async () => {
      const data = await requestAPI.getAll();
      setRequests(data.filter((r: HelpRequest) => r.urgency === "critical"));
    };
    loadRequests();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Critical Requests</h1>
      {requests.length === 0 ? (
        <p className="text-gray-600">No critical requests right now.</p>
      ) : (
        <ul className="space-y-3">
          {requests.map((r) => (
            <li key={r.id} className="p-4 border rounded-lg bg-red-50">
              <h2 className="font-semibold text-red-800">{r.title}</h2>
              <p className="text-sm text-gray-600">{r.location.address}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CriticalRequestsPage;
