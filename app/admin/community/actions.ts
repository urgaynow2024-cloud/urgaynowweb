"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

function revalidateGallery() {
  revalidatePath("/", "layout");
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/community");
}

export async function approveCommunitySubmission(id: string, formData: FormData) {
  await requireAdmin();
  const note = String(formData.get("note") || "").trim();

  await prisma.$transaction([
    prisma.communitySubmission.update({
      where: { id },
      data: { status: "APPROVED", published: true, publishedAt: new Date(), reviewedAt: new Date() },
    }),
    prisma.communitySubmissionModerationLog.create({
      data: { submissionId: id, action: "APPROVED", note },
    }),
  ]);
  revalidateGallery();
  redirect("/admin/community?status=pending");
}

export async function rejectCommunitySubmission(id: string, formData: FormData) {
  await requireAdmin();
  const reason = String(formData.get("reason") || "").trim();
  const note = String(formData.get("note") || "").trim();

  await prisma.$transaction([
    prisma.communitySubmission.update({
      where: { id },
      data: { status: "REJECTED", rejectionReason: reason, reviewedAt: new Date(), published: false },
    }),
    prisma.communitySubmissionModerationLog.create({
      data: { submissionId: id, action: "REJECTED", note },
    }),
  ]);
  revalidateGallery();
  redirect("/admin/community?status=pending");
}

export async function requestChangesCommunitySubmission(id: string, formData: FormData) {
  await requireAdmin();
  const note = String(formData.get("note") || "").trim();

  await prisma.$transaction([
    prisma.communitySubmission.update({
      where: { id },
      data: { status: "REQUEST_CHANGES", changeRequestNote: note, reviewedAt: new Date(), published: false },
    }),
    prisma.communitySubmissionModerationLog.create({
      data: { submissionId: id, action: "REQUEST_CHANGES", note },
    }),
  ]);
  revalidateGallery();
  redirect("/admin/community?status=pending");
}

export async function unpublishCommunitySubmission(id: string) {
  await requireAdmin();

  await prisma.$transaction([
    prisma.communitySubmission.update({
      where: { id },
      data: { published: false },
    }),
    prisma.communitySubmissionModerationLog.create({
      data: { submissionId: id, action: "UNPUBLISHED", note: "" },
    }),
  ]);
  revalidateGallery();
  redirect("/admin/community");
}

export async function republishCommunitySubmission(id: string) {
  await requireAdmin();

  await prisma.communitySubmission.update({
    where: { id },
    data: { published: true, publishedAt: new Date() },
  });
  revalidateGallery();
  redirect("/admin/community");
}

export async function deleteCommunitySubmission(id: string) {
  await requireAdmin();
  await prisma.communitySubmission.delete({ where: { id } });
  revalidateGallery();
  redirect("/admin/community");
}