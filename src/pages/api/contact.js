import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ Missing RESEND_API_KEY");
      return res
        .status(500)
        .json({ error: "Internal Server Error: Missing API Key" });
    }

    const { name, email, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required." });
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    const senderName = name && name.trim() ? name : "Anonymous";

    const data = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "gmdumallay007101@gmail.com",
      subject: `New Contact Message from ${senderName}`,
      text: `Name: ${senderName}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    console.log("✅ Email sent successfully:", data);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error: " + error.message });
  }
}
