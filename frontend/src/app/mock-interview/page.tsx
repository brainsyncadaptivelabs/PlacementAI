import { redirect } from "next/navigation";

export default function MockInterviewRedirect() {
  redirect("/dashboard/coach");
}
