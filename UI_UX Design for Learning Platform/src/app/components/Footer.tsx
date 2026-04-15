import { Link } from "react-router";
import { GraduationCap, Twitter, Linkedin, Youtube, Instagram, Mail } from "lucide-react";

export function Footer() {
  const footerLinks = {
    courses: [
      { name: "Web Development", path: "/courses" },
      { name: "Data Science", path: "/courses" },
      { name: "Design", path: "/courses" },
      { name: "Business", path: "/courses" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Instructors", path: "/instructors" },
      { name: "Pricing", path: "/pricing" },
      { name: "Contact", path: "/about" },
    ],
    support: [
      { name: "Help Center", path: "/" },
      { name: "Terms of Service", path: "/" },
      { name: "Privacy Policy", path: "/" },
      { name: "Cookie Policy", path: "/" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Instagram, href: "#", label: "Instagram" },
  ];

  return (
    <footer className="bg-card border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary rounded-lg p-2">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                SkillForge
              </span>
            </Link>
            <p className="text-muted-foreground mb-4 max-w-sm">
              Empowering learners worldwide with expert-led courses. Forge your future with cutting-edge skills and knowledge.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors flex items-center justify-center"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Courses */}
          <div>
            <h4 className="font-semibold mb-4">Courses</h4>
            <ul className="space-y-3">
              {footerLinks.courses.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground text-sm">
              © 2026 SkillForge. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Mail className="w-4 h-4" />
              <a href="mailto:contact@skillforge.com" className="hover:text-primary transition-colors">
                contact@skillforge.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
