import { formatDate } from "@/lib/utils";
import { Phone, Mail, Users, CheckSquare, FileText } from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  TASK: CheckSquare,
  NOTE: FileText,
};

interface Props {
  activities: {
    id: string;
    type: string;
    title: string;
    createdAt: Date;
    contact?: { firstName: string; lastName: string } | null;
    user?: { name?: string | null };
  }[];
}

export default function RecentActivity({ activities }: Props) {
  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
      {activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No activities yet</p>
      ) : (
        <div className="space-y-3">
          {activities.map((a) => {
            const Icon = ICONS[a.type] ?? FileText;
            return (
              <div key={a.id} className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{a.title}</p>
                  <p className="text-xs text-gray-400">
                    {a.contact ? `${a.contact.firstName} ${a.contact.lastName} · ` : ""}
                    {formatDate(a.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
