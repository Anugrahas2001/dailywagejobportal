// import React from "react";

// const links = [
//   { label: "Home", href: "/" },
//   // { label: "Services", href: "/services" },
//   { label: "My Jobs", href: "/about" },
//   // { label: "Contact", href: "/contact" },
// ];

// const Footer = () => {
//   return (
//     <footer className="mt-7 w-full bg-black text-gray-300">
//       <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
//         <div className="grid gap-8 grid-cols-2 md:grid-cols-3">
//           {/* Brand */}
//           <div>
//             <h2 className="text-xl font-bold text-white">Work Now</h2>
//             <p className="mt-3 max-w-xs text-sm md:text-base leading-relaxed text-gray-400">
//               Short one-line description of what your platform does and who it
//               helps.
//             </p>
//           </div>

//           {/* Quick links */}
//           <nav aria-label="Footer">
//             <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-white">
//               Quick links
//             </h3>
//             <ul className="mt-3 space-y-2 text-sm md:text-base">
//               {links.map(({ label, href }) => (
//                 <li key={label}>
//                   <a
//                     href={href}
//                     className="text-gray-400 transition hover:text-white"
//                   >
//                     {label}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </nav>

//           {/* Contact */}
//           <div>
//             <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-white">
//               Contact
//             </h3>
//             <ul className="mt-3 space-y-2 text-sm md:text-base text-gray-400">
//               <li>
//                 <a
//                   href="mailto:support@worknow.com"
//                   className="transition hover:text-white"
//                 >
//                   support@worknow.com
//                 </a>
//               </li>
//               {/* <li>
//                 <a
//                   href="tel:+910000000000"
//                   className="transition hover:text-white"
//                 >
//                   +91 00000 00000
//                 </a>
//               </li> */}
//               <li>Kerala, India</li>
//             </ul>
//           </div>
//         </div>

//         {/* Bottom bar */}
//         <div className="mt-8 flex flex-col items-center text-sm md:text-base justify-between gap-3 border-t border-gray-800 pt-6 text-gray-500 sm:flex-row">
//           <p>© {new Date().getFullYear()} Work Now. All rights reserved.</p>
//           <div className="flex gap-4">
//             <a href="/privacy" className="transition hover:text-white">
//               Privacy Policy
//             </a>
//             <a href="/terms" className="transition hover:text-white">
//               Terms of Service
//             </a>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";

const links = [
  { label: "Home", href: "/" },
  { label: "My Jobs", href: "/about" },
];

const Footer = () => {
  return (
    <footer className="w-full bg-black text-gray-300 mb-3">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:py-10">
        <div className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-3 md:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="text-lg font-bold text-white md:text-xl">Work Now</h2>
            <p className="mt-2 max-w-xs text-xs leading-relaxed text-gray-400 md:mt-3 md:text-base">
              Short one-line description of what your platform does and who it
              helps.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white md:text-base">
              Quick links
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm md:mt-3 md:space-y-2 md:text-base">
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
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white md:text-base">
              Contact
            </h3>
            <ul className="mt-2 space-y-1.5 text-sm text-gray-400 md:mt-3 md:space-y-2 md:text-base">
              <li>
                <a
                  href="mailto:support@worknow.com"
                  className="break-all transition hover:text-white"
                >
                  support@worknow.com
                </a>
              </li>
              <li>Kerala, India</li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-gray-800 pt-4 text-xs text-gray-500 sm:flex-row md:gap-3 md:pt-6 md:text-base">
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
