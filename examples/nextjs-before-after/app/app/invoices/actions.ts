"use server";

import { redirect } from "next/navigation";
import { removeInvoice } from "@/lib/store";

export async function deleteInvoice(formData: FormData) {
  const id = formData.get("id") as string;
  removeInvoice(id);
  redirect("/");
}
