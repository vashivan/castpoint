import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext"; // або звідки у тебе user

type MyAppRow = {
  id: number;
  job_id: number;
  application_code: string | null;
  sent_email_status: "pending" | "sent" | "error";
  created_at: string;
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
    <div className="p-4">
      {apps.length === 0 ? (
        <p className="text-sm text-black/60">No applications yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {apps.map((a) => (
            <li key={a.id} className="rounded-xl border border-black/10 p-3">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  <div className="font-medium">
                    {a.application_code || `CP-${String(a.id).padStart(6, "0")}`}
                  </div>
                  <div className="text-black/60">Job ID: {a.job_id}</div>
                </div>

                <span className="text-xs px-2 py-1 rounded-full border border-black/10">
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
