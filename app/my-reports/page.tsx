import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "My Reports",
  description: "Track your submitted reports",
  robots: { index: false, follow: false },
};

export default function MyReportsRedirect() {
  redirect("/report/me");
}