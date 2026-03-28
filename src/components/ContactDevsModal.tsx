"use client";

import React from "react"; // Removed useState
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"; // Keep Button for Close button
// Removed Input, Label, Textarea, toastMessages
import Link from "next/link"; // Import Link for navigation

interface Developer {
  id: string;
  name: string;
  avatar: string; // Emoji or image URL
  link: string; // External link for the developer
}

const developers: Developer[] = [
  {
    id: "dev1",
    name: "Dev_allan",
    avatar: "/allan.webp",
    link: "https://chat.smctgroup.ph/direct/DevunderscoreAllandashj",
  },
  {
    id: "dev2",
    name: "Dev_jenecil",
    avatar: "/jenecil.jpg",
    link: "https://chat.smctgroup.ph/direct/dev_jenecil",
  },
  {
    id: "dev3",
    name: "Dev_Macmac",
    avatar: "/Macmac.jpg",
    link: "https://chat.smctgroup.ph/direct/Dev-IT_Macmac",
  },
  {
    id: "dev4",
    name: "Dev_zart",
    avatar: "/zart.jpg",
    link: "https://chat.smctgroup.ph/direct/dev_zart",
  },
  {
    id: "dev5",
    name: "Dev_tian",
    avatar: "/Tian.jpg",
    link: "https://chat.smctgroup.ph/direct/dev_tian",
  },
];

interface ContactDevsModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

export default function ContactDevsModal({
  isOpen,
  onCloseAction,
}: ContactDevsModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChangeAction={onCloseAction}>
      <DialogContent className="sm:max-w-xl bg-blue-50 text-center relative overflow-hidden animate-popup">
        <DialogHeader>
          <DialogTitle className="flex items-center font-bold text-xl justify-center gap-3">
            <img src="/web-server.png" alt="Team" className="w-17 h-15" />
            Meet Our Developers
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 px-6 py-4">
          <p className="text-gray-700 leading-relaxed mb-7">
            Click on a developer's icon to learn more about their work or
            connect with them!
          </p>
          <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 justify-items-center max-h-72 overflow-y-auto custom-scrollbar pr-2 bg-white/50 rounded-lg p-2">
            {/* Simple Background Image with Fade */}
            <div
              className="absolute inset-0 z-0 rounded-lg pointer-events-none"
              style={{
                backgroundImage: "url(/eval-bg.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                opacity: 0.6,
              }}
            />
            {developers.map((dev) => (
              <Link
                key={dev.id}
                href={dev.link}
                passHref
                target="_blank"
                rel="noopener noreferrer"
                className="relative z-10 flex flex-col items-center group cursor-pointer p-3 rounded-lg hover:bg-white/60 backdrop-blur-sm transition-all"
              >
                <div className="h-15 w-15 mb-2 overflow-hidden bg-white/80 group-hover:bg-blue-50 transition-all transform group-hover:scale-110 shadow-md group-hover:shadow-xl rounded-lg border-2 border-white/50">
                  <img
                    src={dev.avatar}
                    alt={dev.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="text-sm font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                  {dev.name}
                </span>
              </Link>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button
              type="button"
              className="bg-red-700 hover:bg-red-400 text-white cursor-pointer hover:scale-110 transition-all duration-300"
              onClick={onCloseAction}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
