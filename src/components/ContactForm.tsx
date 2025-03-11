"use client";
import { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<string | null>(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

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
  };

  return (
<div className="relative z-20 w-full py-12 bg-transparent backdrop-blur lg flex items-center justify-center">

  <div className="max-w-2xl w-full p-6">
    <h2 className="text-4xl font-serif mb-4">Contact Me</h2>
    <hr className="border-gray-600 mb-6" />
    <div className="mb-6">
      <h3 className="text-2xl mb-2">Get in touch</h3>
      <p><strong>Email:</strong> <a href="mailto:your@email.com">gmdumallay007101@gmail.com</a></p>
      <p><strong>Phone:</strong> +63 977 736 4652</p>
      <p className="mt-4">
        Got something to say? I&apos;ll answer as soon as possible.
      </p>
    </div>
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div className="flex flex-wrap gap-4">
        <input type="text" name="name" placeholder="Name" value={formData.name} 
               onChange={handleChange} required 
               className="flex-1 min-w-[200px] bg-transparent border border-gray-600 p-2 text-black rounded" />
        <input type="email" name="email" placeholder="Email" value={formData.email} 
               onChange={handleChange} required 
               className="flex-1 min-w-[200px] bg-transparent border border-gray-600 p-2 text-black rounded" />
      </div>
      <textarea name="message" placeholder="Message" rows="5" value={formData.message} 
                onChange={handleChange} required 
                className="w-full bg-transparent border border-gray-600 p-2 text-black rounded" />
      <button type="submit" className="bg-gray-800 px-6 py-2 text-white border border-gray-600 hover:bg-gray-700 rounded">
        Send
      </button>
      {status && <p className="mt-2 text-sm text-black">{status === "loading" ? "Sending..." : status}</p>}
    </form>
  </div>
</div>

  );
}