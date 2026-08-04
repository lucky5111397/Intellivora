import React from "react";
import { Link } from "react-router-dom";
import logoDark from "../assets/logo-dark.png";
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
} from "react-icons/fa";

function Footer() {
  return (
    <footer className="mt-14 border-t border-white/10 bg-[#050816]">
      <div className="mx-auto max-w-7xl px-6 py-12">

        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

          {/* Brand */}

          <div>

            <div className="flex items-center gap-3">

              <img
                src={logoDark}
                alt="Intellivora"
                className="h-12 w-12 object-contain"
              />

              <h2 className="text-2xl font-bold text-white">
                Intellivora
              </h2>

            </div>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              AI-powered interview platform for mock interviews,
              resume analysis and personalized feedback.
            </p>

            <div className="mt-5 flex gap-2">

              <a
                href="https://github.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition"
              >
                <FaGithub size={16} />
              </a>

              <a
                href="https://linkedin.com/"
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition"
              >
                <FaLinkedin size={16} />
              </a>

              <a
                href="mailto:luvy4661@gmail.com"
                className="rounded-lg border border-white/10 bg-white/5 p-2.5 text-slate-300 hover:border-blue-500 hover:text-blue-400 transition"
              >
                <FaEnvelope size={16} />
              </a>

            </div>

          </div>

          {/* Product */}

          <div>

            <h3 className="text-base font-semibold uppercase tracking-wider text-white">
              Product
            </h3>

            <ul className="mt-4 space-y-2">

              <li>
                <Link
                  to="/interview"
                  className="text-sm text-slate-400 transition hover:text-blue-400"
                >
                  AI Interview
                </Link>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-slate-400 transition hover:text-blue-400"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  to="/history"
                  className="text-sm text-slate-400 transition hover:text-blue-400"
                >
                  History
                </Link>
              </li>

              <li>
                <Link
                  to="/resume"
                  className="text-sm text-slate-400 transition hover:text-blue-400"
                >
                  ATS Score Checker
                </Link>
              </li>

            </ul>

          </div>

          {/* Resources */}

          <div>

            <h3 className="text-base font-semibold uppercase tracking-wider text-white">
              Resources
            </h3>

            <ul className="mt-4 space-y-2">

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Documentation
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Privacy Policy
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Terms
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Support
              </li>

            </ul>

          </div>

          {/* Company */}

          <div>

            <h3 className="text-base font-semibold uppercase tracking-wider text-white">
              Company
            </h3>

            <ul className="mt-4 space-y-2">

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                About
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Contact
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Careers
              </li>

              <li className="text-sm text-slate-400 hover:text-blue-400 transition cursor-pointer">
                Blog
              </li>

            </ul>

          </div>
        </div>



        {/* Bottom */}

        <div className="mt-6 border-t border-white/10 pt-4 flex items-center justify-end">

          <p className="text-xs text-slate-500">
            © 2026 Intellivora. All rights reserved.
          </p>

        </div>

      </div>
    </footer>
  );
}

export default Footer;