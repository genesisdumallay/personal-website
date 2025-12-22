"use client";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "@/hooks/ThemeContext";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm({ onClose }: { onClose?: () => void }) {
  const { isDark } = useTheme();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [status, setStatus] = useState<string | null>(null);

  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    return () => setVisible(false);
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();
      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
      } else {
        setStatus(result.error || "Something went wrong.");
      }
    } catch {
      setStatus("Something went wrong.");
    }
  };

  return (
    <div className="relative z-20 w-full py-6 flex items-start justify-center">
      <div
        className={`max-w-md w-full p-6 bg-white rounded-md shadow-lg transition-all duration-300 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-3xl font-serif">Contact Me</h2>
          <button
            type="button"
            onClick={() => onClose && onClose()}
            aria-label="Close"
            className="text-xl cursor-pointer p-1 rounded"
          >
            ✕
          </button>
        </div>

        <div className="mb-2">
          <a
            className="text-sm text-gray-700 no-underline cursor-pointer"
            href="mailto:gmdumallay007101@gmail.com"
          >
            Use your email client
          </a>
        </div>

        <hr className="border-gray-300 dark:border-gray-700 mb-4" />

        <div className="mb-6">
          <div className="mt-2 mb-2">
            <p>
              <strong>Email:</strong>{" "}
              <span className={`${isDark ? "text-gray-200" : "text-gray-900"}`}>
                gmdumallay007101@gmail.com
              </span>
            </p>
          </div>

          <p>
            <strong>Phone:</strong> +63 977 736 4652
          </p>
          <p className="mt-4">
            Got something to say? I&apos;ll answer as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name (optional)"
              value={formData.name}
              onChange={handleChange}
              className={`flex-1 min-w-[200px] bg-transparent border p-2 rounded ${
                isDark
                  ? "border-gray-600 text-gray-100"
                  : "border-gray-400 text-gray-900"
              }`}
            />

            <input
              ref={firstInputRef}
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`flex-1 min-w-[200px] bg-transparent border p-2 rounded ${
                isDark
                  ? "border-gray-600 text-gray-100"
                  : "border-gray-400 text-gray-900"
              }`}
            />
          </div>

          <textarea
            name="message"
            placeholder="Message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className={`w-full bg-transparent border p-2 rounded ${
              isDark
                ? "border-gray-600 text-gray-100"
                : "border-gray-400 text-gray-900"
            }`}
          />

          <button
            type="submit"
            className={`px-6 py-2 rounded cursor-pointer hover:opacity-90 transition ${
              isDark ? "bg-gray-200 text-black" : "bg-gray-800 text-white"
            }`}
          >
            Send
          </button>

          {status && (
            <p
              className={`mt-2 text-sm ${
                isDark ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {status === "loading" ? "Sending..." : status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
