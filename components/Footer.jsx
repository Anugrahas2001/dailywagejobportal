import React from "react";

const links = [
  { label: "Home", href: "/" },
  // { label: "Services", href: "/services" },
  { label: "My Jobs", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const Footer = () => {
  return (
    <footer className="mt-7 w-full bg-black text-gray-300">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand */}
          <div>
            <h2 className="text-xl font-bold text-white">Work Now</h2>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-gray-400">
              Short one-line description of what your platform does and who it
              helps.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Quick links
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-gray-400 transition hover:text-white"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Contact
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:support@worknow.com"
                  className="transition hover:text-white"
                >
                  support@worknow.com
                </a>
              </li>
              {/* <li>
                <a
                  href="tel:+910000000000"
                  className="transition hover:text-white"
                >
                  +91 00000 00000
                </a>
              </li> */}
              <li>Kerala, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-gray-800 pt-6 text-xs text-gray-500 sm:flex-row">
          <p>© {new Date().getFullYear()} Work Now. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="/privacy" className="transition hover:text-white">
              Privacy Policy
            </a>
            <a href="/terms" className="transition hover:text-white">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
