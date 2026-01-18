import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // або звідки у тебе user

type MyAppRow = {
  id: number;
  job_id: number;
  application_code: string | null;
  sent_email_status: "pending" | "under review" | "error" | "approved" | "rejected";
  created_at: string;
  application_title: string;
};

export default function MyApplication() {
  const { user } = useAuth();
  const [apps, setApps] = useState<MyAppRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email) return;

    setLoading(true);

    fetch(`/api/my_application?email=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => {
        setApps(data?.applications || []);
      })
      .finally(() => setLoading(false));
  }, [user?.email]);

  if (!user?.email) return <div>Please login</div>;
  if (loading) return <div>Loading...</div>;

  return (
    <div cn>
      {apps.length === 0 ? (
        <p className="text-sm text-black/60">No applications yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {apps.map((a) => (
            <li key={a.id} className="rounded-xl border border-black/10 p-3">
              <div className="text-black/60">{a.application_title}</div>
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-sm">
                    Appplication code: <br/> {a.application_code}
                  </div>
                </div>
                <span 
                  className={`text-xs px-2 py-1 rounded-full border border-black/10
                    ${a.sent_email_status === "pending" && "bg-yellow-100 text-yellow-800"}
                    ${a.sent_email_status === "under review" && "bg-blue-100 text-blue-800"}
                    ${a.sent_email_status === "error" && "bg-orange-100 text-orange-800"}
                    ${a.sent_email_status === "approved" && "bg-green-100 text-green-800"}
                    ${a.sent_email_status === "rejected" && "bg-red-100 text-red-800"}`}
              >
                  {a.sent_email_status}
                </span>
              </div>

              <div className="mt-2 text-xs text-black/50">
                {new Date(a.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
