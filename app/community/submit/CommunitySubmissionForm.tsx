"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Alert, Button } from "@/components/ui";
import Image from "next/image";

const VALID_TYPES = [
  { value: "ARTWORK", label: "Artwork" },
  { value: "AVATAR", label: "Avatar" },
  { value: "SCREENSHOT", label: "Screenshot" },
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VRCHAT_WORLD", label: "VRChat World" },
  { value: "CREATOR_PROJECT", label: "Creator Project" },
  { value: "OTHER", label: "Other" },
];

export function CommunitySubmissionForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("");
  const [submitterName, setSubmitterName] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [contentType, setContentType] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!imageUrl) {
      setError("Please upload an image first");
      setIsSubmitting(false);
      return;
    }

    if (!type) {
      setError("Please select a submission type");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/community/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          type,
          submitterName,
          submitterEmail,
          imageUrl,
          fileName,
          fileSize,
          contentType,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileSize(file.size);
    setContentType(file.type);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        setImageUrl(data.url);
      } else {
        setError(data.error || "Upload failed");
      }
    } catch {
      setError("Upload failed");
    }
  };

  if (success) {
    return (
      <Alert tone="success" title="Submission sent!" className="text-center">
        Your submission has been sent for review. You&apos;ll be notified once it&apos;s approved.
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <Alert tone="danger">{error}</Alert>}

      <div>
        <label htmlFor="title" className="field-label">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="My awesome creation"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Tell us about your submission..."
          className="textarea"
        />
      </div>

      <div>
        <label htmlFor="type" className="field-label">
          Type <span className="text-red-500">*</span>
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
          className="select"
        >
          <option value="">Select a type</option>
          {VALID_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="submitterName" className="field-label">
          Your Name
        </label>
        <input
          id="submitterName"
          type="text"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          placeholder="John Doe"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="submitterEmail" className="field-label">
          Your Email (optional)
        </label>
        <input
          id="submitterEmail"
          type="email"
          value={submitterEmail}
          onChange={(e) => setSubmitterEmail(e.target.value)}
          placeholder="john@example.com"
          className="input"
        />
      </div>

      <div>
        <label className="field-label">Image <span className="text-red-500">*</span></label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          required={!imageUrl}
          className="input"
        />
        {imageUrl && (
          <div className="mt-3 relative aspect-video max-w-md mx-auto">
            <Image
              src={imageUrl}
              alt="Preview"
              fill
              className="object-cover rounded-xl"
            />
          </div>
        )}
      </div>

      <Button type="submit" loading={isSubmitting}>
        Submit for Review
      </Button>
    </form>
  );
}