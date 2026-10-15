import { useState, useRef } from "react";
import {
  Mail,
  Copy,
  Check,
  MessageSquare,
  Send,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { toast } from "sonner";
import { PROFILE } from "../../data/profile";
import { apiService } from "../../services/api";
import { sound } from "../../utils/sound";

export const Contact = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    name: "",
    subject: "",
    message: "",
  });

  const copyEmail = () => {
    sound.playSuccessChime();
    navigator.clipboard.writeText(PROFILE.email);
    setCopied(true);
    toast.success("Email copied to clipboard!", { description: PROFILE.email });
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      sound.playErrorChime();
      toast.error("Please fill in your name and message.");
      return;
    }

    setSending(true);
    try {
      const res = await apiService.sendContactMessage({
        name: form.name.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      // If backend SMTP is not yet configured, fall back to opening local mail client
      if (res.status === 535 || res.data?.unconfigured) {
        sound.playClick();
        const mailtoLink = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
          form.subject || "Portfolio Contact"
        )}&body=${encodeURIComponent(`Hi, I'm ${form.name}.\n\n${form.message}`)}`;
        window.open(mailtoLink, "_blank");
        toast.info("Opening email client (Backend SMTP not configured yet).");
        return;
      }

      if (res.ok && res.data?.success) {
        sound.playClick();
        toast.success("Message sent successfully! 🎉", {
          description: "Rajlaxmi will get back to you soon.",
        });
        setForm({ name: "", subject: "", message: "" });
      } else {
        sound.playErrorChime();
        toast.error(res.data?.error || "Failed to send message via server.");
      }
    } catch {
      // Server down or network error: fall back to mailto link
      sound.playClick();
      const mailtoLink = `mailto:${PROFILE.email}?subject=${encodeURIComponent(
        form.subject || "Portfolio Contact"
      )}&body=${encodeURIComponent(`Hi, I'm ${form.name}.\n\n${form.message}`)}`;
      window.open(mailtoLink, "_blank");
      toast.info("Opening email client (Backend server offline).");
    } finally {
      setSending(false);
    }
  };


  const socials = [
    {
      label: "GitHub",
      url: PROFILE.github,
      icon: FaGithub,
      color: "hover:bg-[#24292e]/60 hover:border-[#30363d]",
      iconColor: "text-gray-300",
    },
    {
      label: "LinkedIn",
      url: PROFILE.linkedin,
      icon: FaLinkedin,
      color: "hover:bg-[#0a66c2]/20 hover:border-[#0a66c2]/40",
      iconColor: "text-blue-400",
    },
  ];

  return (
    <div className="flex h-full bg-[#111111] text-gray-200 overflow-hidden">
      {/* Left Panel */}
      <div className="w-[290px] shrink-0 flex flex-col border-r border-white/10 bg-[#161616] p-7 gap-7 border-t-white/15">
        {/* Avatar */}
        <div className="flex flex-col items-center text-center pt-2">
          <img
            src="/photo.jpg"
            alt={PROFILE.name}
            className="w-22 h-22 rounded-2xl object-cover shadow-xl shadow-indigo-900/40 border border-white/20 mb-4 select-none shrink-0"
          />
          <h1 className="text-xl font-extrabold text-white tracking-tight">{PROFILE.name}</h1>
          <p className="text-xs text-indigo-300 font-semibold mt-1">{PROFILE.tagline}</p>
          <p className="text-xs text-gray-400 mt-1">{PROFILE.location}</p>
        </div>

        <div className="h-px bg-white/10" />

        {/* Email */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Direct Email
          </p>
          <button
            onClick={copyEmail}
            className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 border-t-white/20 hover:bg-white/10 hover:border-white/20 active:scale-95 transition-all duration-200 group cursor-pointer shadow-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Mail size={15} className="text-indigo-400 shrink-0" />
              <span className="text-xs text-gray-200 truncate font-mono font-medium">
                {PROFILE.email}
              </span>
            </div>
            {copied ? (
              <Check size={15} className="text-green-400 shrink-0" />
            ) : (
              <Copy size={15} className="text-gray-400 group-hover:text-white shrink-0 transition-colors" />
            )}
          </button>
        </div>

        {/* Social Links */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            Social Links
          </p>
          <div className="flex flex-col gap-2.5">
            {socials.map((s) => {
              const Icon = s.icon;
              const isPlaceholder = s.url.startsWith("YOUR_");
              return (
                <a
                  key={s.label}
                  href={isPlaceholder ? "#" : s.url}
                  target={isPlaceholder ? "_self" : "_blank"}
                  rel="noreferrer"
                  onClick={
                    isPlaceholder
                      ? (e) => {
                          e.preventDefault();
                          toast.warning(`Update ${s.label} URL in src/data/profile.ts`);
                        }
                      : undefined
                  }
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 border-t-white/20 bg-white/5 transition-all duration-200 active:scale-95 group ${s.color}`}
                >
                  <Icon size={16} className={s.iconColor} />
                  <span className="text-sm font-medium text-gray-200 group-hover:text-white flex-1">
                    {s.label}
                  </span>
                  <ExternalLink size={13} className="text-gray-500 group-hover:text-gray-300 transition-colors" />
                </a>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="mt-auto">
          <div className="flex items-center gap-2.5 px-4 py-3.5 rounded-xl bg-green-500/15 border border-green-500/30 border-t-green-400/40 shadow-md">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-xs text-green-200 font-semibold">Open to full-time roles</span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex flex-col p-9 overflow-y-auto">
        <div className="flex items-center gap-3.5 mb-9">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/30 border-t-indigo-400/40">
            <MessageSquare size={20} className="text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">Send a Direct Message</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Sends directly to {PROFILE.email}
            </p>
          </div>
        </div>

        <form
          ref={formRef}
          onSubmit={handleSend}
          className="flex flex-col gap-6 max-w-lg"
        >
          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2.5 uppercase tracking-wider">
              Your Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              onKeyDown={(e) => {
                if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) sound.playKeypress(e.key);
              }}
              placeholder="John Doe"
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/12 text-gray-100 text-sm placeholder-gray-500 outline-none focus:border-indigo-400 focus:bg-black/60 focus:ring-1 focus:ring-indigo-400/40 transition-all duration-200 shadow-inner"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2.5 uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              onKeyDown={(e) => {
                if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) sound.playKeypress(e.key);
              }}
              placeholder="Job Opportunity / Collaboration / Hello!"
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/12 text-gray-100 text-sm placeholder-gray-500 outline-none focus:border-indigo-400 focus:bg-black/60 focus:ring-1 focus:ring-indigo-400/40 transition-all duration-200 shadow-inner"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-300 block mb-2.5 uppercase tracking-wider">
              Message *
            </label>
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              onKeyDown={(e) => {
                if (!['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'CapsLock'].includes(e.key)) sound.playKeypress(e.key);
              }}
              placeholder="Hi Rajlaxmi, I'd love to talk about..."
              className="w-full px-4 py-3.5 rounded-xl bg-black/40 border border-white/12 text-gray-100 text-sm placeholder-gray-500 outline-none resize-none focus:border-indigo-400 focus:bg-black/60 focus:ring-1 focus:ring-indigo-400/40 transition-all duration-200 shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 hover:shadow-xl hover:shadow-indigo-900/50 active:scale-95 cursor-pointer w-fit"
          >
            {sending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            {sending ? "Sending Message..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};