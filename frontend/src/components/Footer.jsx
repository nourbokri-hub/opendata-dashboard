import React from "react";
import { Database, Mail, Globe, Phone, Github, Twitter, Linkedin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
      <div className="container mx-auto px-6 lg:px-12">
        
        {/* SECTION PRINCIPALE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* LOGO & NEWSLETTER */}
          <div className="lg:col-span-4 space-y-8">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:rotate-6 transition-transform">
                <Database className="w-6 h-6 text-white" />
              </div>
              <span className="text-white font-black text-2xl tracking-tighter">
                OPEN<span className="text-indigo-500">DATA</span>
              </span>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              La plateforme intelligente pour l'exploration de datasets. Transformez vos données brutes en décisions stratégiques.
            </p>

            <div className="flex space-x-4">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">Services</h4>
              <ul className="space-y-4">
                {["Import de données", "Visualisation", "Analyses IA", "Gestion Cloud"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-indigo-400 flex items-center group transition-colors">
                      <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">Ressources</h4>
              <ul className="space-y-4">
                {["Documentation", "API Reference", "Support", "Datasets Publics"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-indigo-400 flex items-center group transition-colors">
                      <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="col-span-2 md:col-span-1">
              <h4 className="text-white font-bold mb-6 uppercase text-[10px] tracking-[0.2em]">Contact</h4>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                    <Mail size={14} />
                  </div>
                  <span>opendata@pi.tn</span>
                </li>
                <li className="flex items-center gap-3 text-sm group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                    <Phone size={14} />
                  </div>
                  <span>+216 54 20 36 00</span>
                </li>
                <li className="flex items-center gap-3 text-sm group cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors">
                    <Globe size={14} />
                  </div>
                  <span>www.opendata.tn</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © {currentYear} Open Data. 
          </p>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-white transition-colors">Conditions</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;