"use client";

import { formatDate } from "@/lib/utils";
import { Phone, Mail, Users, CheckSquare, FileText } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  NOTE: FileText,
};

const TYPE_COLORS: Record<string, string> = {
  CALL: "bg-blue-50 text-blue-600",
  EMAIL: "bg-purple-50 text-purple-600",
  MEETING: "bg-orange-50 text-orange-600",
  TASK: "bg-yellow-50 text-yellow-600",
  NOTE: "bg-gray-50 text-gray-600",
};

type ActivityWithRelations = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  contactId: string | null;
  companyId: string | null;
  dealId: string | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  deal: { id: string; title: string } | null;
  user: { id: string; name: string | null; email: string } | null;
};

interface Props {
  activities: ActivityWithRelations[];
}

export default function ActivitiesList({ activities }: Props) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
        No activities yet
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border divide-y">
      {activities.map((a) => {
        const Icon = ICONS[a.type] ?? FileText;
        return (
          <div key={a.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors">
            <div className={`p-2.5 rounded-lg ${TYPE_COLORS[a.type]}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{a.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{formatDate(a.createdAt)}</span>
              </div>
              {a.description && <p className="text-sm text-gray-500 mt-0.5">{a.description}</p>}
              <div className="flex items-center gap-3 mt-1">
                {a.contact && (
                  <span className="text-xs text-gray-400">
                    Contact: {a.contact.firstName} {a.contact.lastName}
                  </span>
                )}
                {a.deal && (
                  <span className="text-xs text-gray-400">Deal: {a.deal.title}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${a.completed ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  {a.completed ? "Completed" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
