"use client";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

export default function ContactForm({ isDark }: { isDark?: boolean }) {
  const [formData, setFormData] = useState<FormData>({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    <div className="relative z-20 w-full py-12 bg-transparent backdrop-blur flex items-center justify-center">
      <div className="max-w-2xl w-full p-6 bg-white/5 dark:bg-black/20 rounded-md">
        <h2 className="text-4xl font-serif mb-4">Contact Me</h2>
        <hr className="border-gray-300 dark:border-gray-700 mb-6" />
        <div className="mb-6">
          <h3 className="text-2xl mb-2">Get in touch</h3>
          <p>
            <strong>Email:</strong>{' '}
            <a className="text-blue-500 underline" href="mailto:gmdumallay007101@gmail.com">gmdumallay007101@gmail.com</a>
          </p>
          <p><strong>Phone:</strong> +63 977 736 4652</p>
          <p className="mt-4">Got something to say? I&apos;ll answer as soon as possible.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`flex-1 min-w-[200px] bg-transparent border p-2 rounded ${isDark ? 'border-gray-600 text-gray-100' : 'border-gray-400 text-gray-900'}`}
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`flex-1 min-w-[200px] bg-transparent border p-2 rounded ${isDark ? 'border-gray-600 text-gray-100' : 'border-gray-400 text-gray-900'}`}
            />
          </div>

          <textarea
            name="message"
            placeholder="Message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            required
            className={`w-full bg-transparent border p-2 rounded ${isDark ? 'border-gray-600 text-gray-100' : 'border-gray-400 text-gray-900'}`}
          />

          <button type="submit" className={`px-6 py-2 rounded ${isDark ? 'bg-gray-200 text-black' : 'bg-gray-800 text-white'}`}>
            Send
          </button>

          {status && (
            <p className={`mt-2 text-sm ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              {status === 'loading' ? 'Sending...' : status}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}