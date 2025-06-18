import { Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative z-10 mt-16 border-t border-slate-700/50 py-6 text-center text-sm text-slate-400">
        <div className="flex justify-center gap-6 mb-3">
          <a
            href="https://github.com/your-github-username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
            aria-label="GitHub"
          >
            <Github className="w-5 h-5" />
          </a>
          <a
            href="https://linkedin.com/in/your-linkedin-username"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-400 transition-colors"
            aria-label="LinkedIn"
          >
            <Linkedin className="w-5 h-5" />
          </a>
        </div>
        <p>
  TrackMyMeds © {new Date().getFullYear()} • Designed & developed by Jasper P.
</p>

        <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      </footer>
      
  );
};

export default Footer;
