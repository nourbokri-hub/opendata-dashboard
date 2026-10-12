import React, { useState, useEffect } from "react";
import { Database, Menu, X, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Effet de changement de style au scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", href: "#acceuil" },
    { name: "Fonctionnalités", href: "#features" },
    { name: "Graphiques", href: "#graphs" },
  ];

  return (
    <Motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-[#fffaff]/90 backdrop-blur-xl border-b border-violet-100 py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center space-x-3 group relative z-50">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-200 group-hover:rotate-6 transition-transform duration-300">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-black text-xl tracking-tighter leading-none">
                OPEN<span className="text-indigo-600">DATA</span>
              </span>
            </div>
          </Link>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/50">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-5 py-2 text-sm font-bold text-slate-600 hover:text-indigo-600 rounded-xl hover:bg-white transition-all duration-200"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* ACTIONS & RECHERCHE */}
          <div className="flex items-center space-x-4">

            <div className="hidden md:flex items-center space-x-2">
              <Link
                to="/login"
                className="text-slate-600 hover:text-indigo-600 font-bold text-sm px-5 py-2.5 transition-colors"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-100"
              >
                S'inscrire <ChevronRight size={14} />
              </Link>
            </div>

            {/* HAMBURGER MOBILE */}
            <button 
              onClick={() => setOpen(!open)}
              className="md:hidden w-10 h-10 flex items-center justify-center bg-slate-100 rounded-xl text-slate-600"
            >
              {open ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE ANIMÉ */}
      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-b border-violet-100 bg-[#fffaff] md:hidden"
          >
            <div className="px-6 py-8 space-y-6">
              <div className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <a 
                    key={link.name} 
                    href={link.href} 
                    onClick={() => setOpen(false)}
                    className="text-2xl font-black text-slate-800 hover:text-indigo-600 transition-colors"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
              <div className="flex flex-col space-y-3 pt-6 border-t border-slate-50">
                <Link to="/login" className="w-full py-4 text-center font-bold text-slate-600 bg-slate-50 rounded-2xl">Connexion</Link>
                <Link to="/register" className="w-full py-4 text-center font-bold text-white bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">S'inscrire</Link>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.header>
  );
};

export default Navbar;