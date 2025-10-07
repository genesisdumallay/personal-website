
"use client";

import { useState } from "react";
import { FaEnvelope, FaFileAlt, FaGithub, FaLinkedin, FaMoon, FaSun, FaUser, FaTerminal } from "react-icons/fa";


const Footer = () => {
const [hovered, setHovered] = useState<string | null>(null);
const iconStyle = { size: 20 };
  return (
    <div className="flex items-center justify-center gap-6 w-max mx-auto p-2 mt-2 border-t border-gray-400">
 {[
            { id: "email", icon: <FaEnvelope {...iconStyle} />, link: "#contact-section", label: "Email" },
            { id: "github", icon: <FaGithub {...iconStyle} />, link: "https://github.com/genesisdumallay", label: "GitHub" },
            { id: "linkedin", icon: <FaLinkedin {...iconStyle} />, link: "https://www.linkedin.com/in/genesis-dumallay-565398356", label: "LinkedIn" },
          ].map((it) => (
            <a
              key={it.id}
              href={it.link}
              onMouseEnter={() => setHovered(it.id)}
              onMouseLeave={() => setHovered(null)}
              className="flex items-center gap-2"
            >
              {hovered === "email" ? true : hovered === it.id && <span className="text-sm">{it.label}</span>}
              {it.id === "email" ? <span className="border p-1 px-2 rounded flex items-center gap-1">{it.icon} Get in Touch</span> : <span>{it.icon}</span>}
            </a>
          ))}
    </div>
    )
};

export default Footer;