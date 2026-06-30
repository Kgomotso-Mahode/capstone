import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-grey-light bg-grey-bg">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">Support</h4>
            <a href="#help" className="block text-sm text-charcoal py-1.5 hover:underline">Help Centre</a>
            <a href="#safety" className="block text-sm text-charcoal py-1.5 hover:underline">Safety information</a>
            <a href="#cancellation" className="block text-sm text-charcoal py-1.5 hover:underline">Cancellation options</a>
            <a href="#report" className="block text-sm text-charcoal py-1.5 hover:underline">Report neighbourhood concern</a>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">Community</h4>
            <a href="#diversity" className="block text-sm text-charcoal py-1.5 hover:underline">Diversity & Belonging</a>
            <a href="#accessibility" className="block text-sm text-charcoal py-1.5 hover:underline">Accessibility</a>
            <a href="#associates" className="block text-sm text-charcoal py-1.5 hover:underline">Airbnb Associates</a>
            <a href="#frontline" className="block text-sm text-charcoal py-1.5 hover:underline">Frontline Stays</a>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">Hosting</h4>
            <a href="#host" className="block text-sm text-charcoal py-1.5 hover:underline">Airbnb your home</a>
            <a href="#host-resources" className="block text-sm text-charcoal py-1.5 hover:underline">Hosting resources</a>
            <a href="#community-forum" className="block text-sm text-charcoal py-1.5 hover:underline">Community forum</a>
            <a href="#host-responsibly" className="block text-sm text-charcoal py-1.5 hover:underline">Hosting responsibly</a>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4">Airbnb</h4>
            <a href="#newsroom" className="block text-sm text-charcoal py-1.5 hover:underline">Newsroom</a>
            <a href="#new-features" className="block text-sm text-charcoal py-1.5 hover:underline">New features</a>
            <a href="#careers" className="block text-sm text-charcoal py-1.5 hover:underline">Careers</a>
            <a href="#investors" className="block text-sm text-charcoal py-1.5 hover:underline">Investors</a>
          </div>
        </div>
      </div>
      <div className="border-t border-grey-light py-4 px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-grey">
          <p>&copy; 2026 Airbnb Clone. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="cursor-pointer hover:underline">Privacy</span>
            <span className="cursor-pointer hover:underline">Terms</span>
            <span className="cursor-pointer hover:underline">Sitemap</span>
            <select className="border-none bg-transparent text-xs text-grey cursor-pointer py-1 hover:text-charcoal">
              <option>English</option>
              <option>Français</option>
              <option>Español</option>
            </select>
            <select className="border-none bg-transparent text-xs text-grey cursor-pointer py-1 hover:text-charcoal">
              <option>ZAR R</option>
              <option>USD $</option>
              <option>EUR &euro;</option>
            </select>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
