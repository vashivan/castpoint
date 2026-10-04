import { redirect } from "next/navigation";

// The old public job form moved into the employer area.
export default function Page() {
  redirect("/employer/jobs/new");
}
