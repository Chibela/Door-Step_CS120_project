import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  Utensils,
  UserCircle,
  BarChart3,
  PlayCircle,
  Users,
  Settings,
  Rocket,
  Bell,
  Menu as MenuIcon,
  X,
  Star,
  CheckCircle2,
} from 'lucide-react';
import heroFood from '../assets/hero-food.png';
import logo from '../assets/logo.webp';

const navLinks = [
  { label: 'Menu', href: '#menu' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const features = [
  {
    icon: CalendarCheck,
    title: 'Smart Scheduling',
    description: 'Manage shifts, track availability, and sync calendars effortlessly.',
  },
  {
    icon: Utensils,
    title: 'Seamless Ordering',
    description: 'Offer a beautiful, intuitive ordering experience for every customer.',
  },
  {
    icon: UserCircle,
    title: 'Profile Control',
    description: 'Empower staff and customers to keep their information up to date.',
  },
  {
    icon: BarChart3,
    title: 'Smart Insights',
    description: 'Monitor performance, revenue, and trends in real time.',
  },
];

const steps = [
  {
    number: '1',
    icon: Users,
    title: 'Sign Up',
    description: 'Create your workspace, invite your team, and upload your menu.',
  },
  {
    number: '2',
    icon: Settings,
    title: 'Set Up',
    description: 'Configure schedules, categories, and automation rules.',
  },
  {
    number: '3',
    icon: Rocket,
    title: 'Launch',
    description: 'Go live, accept orders, and keep every shift in sync.',
  },
];

const menuCategories = [
  {
    name: 'Zambian Cuisine',
    items: ['Nshima & relish', 'Chikanda bites'],
    accent: 'from-zinc-50 to-blue-50',
  },
  {
    name: 'Jamaican Flavor',
    items: ['Jerk chicken', 'Festival bread'],
    accent: 'from-orange-50 to-amber-50',
  },
  {
    name: 'Mexican Street',
    items: ['Tacos al pastor', 'Street corn'],
    accent: 'from-red-50 to-yellow-50',
  },
  {
    name: 'Indian Spice',
    items: ['Butter chicken', 'Paneer tikka'],
    accent: 'from-amber-50 to-rose-50',
  },
  {
    name: 'American Classics',
    items: ['Smash burgers', 'Loaded fries'],
    accent: 'from-slate-50 to-blue-50',
  },
  {
    name: 'More to Explore',
    items: ['Vegan bowls', 'Seasonal menus'],
    accent: 'from-emerald-50 to-teal-50',
  },
];

const testimonials = [
  {
    name: 'Kara Obinna',
    role: 'Franchise Owner',
    company: 'UrbanEats Collective',
    quote: 'ServeDash helped us align staff scheduling with our busiest ordering hours. It feels like magic.',
  },
  {
    name: 'Leo Martinez',
    role: 'Operations Lead',
    company: 'SpiceTrail Kitchens',
    quote: 'Our team handles more orders with fewer errors. The dual-dashboard concept is brilliant.',
  },
  {
    name: 'Emily Harper',
    role: 'GM',
    company: 'Harvest & Co.',
    quote: 'From insights to automation, ServeDash simplified everything we struggled with before.',
  },
];

const roles = [
  {
    icon: '👤',
    title: 'Employee Portal',
    description: 'View schedules, update profile preferences, and receive shift alerts.',
    cta: 'Employee Login →',
  },
  {
    icon: '🛡️',
    title: 'Manager Dashboard',
    description: 'Coordinate teams, monitor orders, and act on insights in real time.',
    cta: 'Manager Login →',
  },
  {
    icon: '🍽️',
    title: 'Customer Access',
    description: 'Browse curated menus, order instantly, and track every delivery.',
    cta: 'Order Now →',
  },
];

const Landing = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  return (
    <div className="bg-cream min-h-screen text-gray-900">
      {/* Navbar */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all ${
          scrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-xl text-navy">
            <img src={logo} alt="ServeDash logo" className="h-10 w-auto object-contain" />
          </div>
          <nav className="hidden md:flex items-center gap-6 font-medium text-sm text-gray-700">
            {navLinks.map((link) => (
              <button
                key={link.href}
                className="hover:text-orange-500 transition-colors"
                onClick={() => scrollToSection(link.href)}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signup"
              className="px-4 py-2 border-2 border-orange-500 text-orange-500 rounded-xl font-semibold hover:bg-orange-50 transition"
            >
              Sign Up
            </Link>
            <Link to="/login" className="px-4 py-2 bg-orange-500 text-white rounded-xl font-semibold shadow-lg hover:bg-orange-600 transition">
              Login
            </Link>
          </div>
          <button className="md:hidden" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Toggle menu">
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <nav className="flex flex-col px-6 py-4 gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  className="text-left text-gray-700 font-medium py-2"
                  onClick={() => scrollToSection(link.href)}
                >
                  {link.label}
                </button>
              ))}
              <Link to="/signup" className="py-2 font-semibold text-orange-500 border-t border-gray-100">
                Sign Up
              </Link>
              <Link to="/login" className="py-2 font-semibold text-orange-600">
                Login
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="pt-28">
        {/* Hero */}
        <section id="hero" className="landing-hero-gradient">
          <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col lg:flex-row items-center gap-14">
            <div className="flex-1 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-navy leading-tight">
                Manage Teams. Serve Customers. All in One Place.
              </h1>
              <p className="text-lg text-gray-700 leading-relaxed">
                ServeDash combines powerful staff scheduling with seamless food ordering—helping you run your business smoother
                and serve your customers faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/signup" className="cta-primary">
                  Start Free Trial
                </Link>
                <button className="cta-secondary flex items-center justify-center gap-2">
                  <PlayCircle className="w-5 h-5" />
                  Watch Demo
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span>✓ No credit card required</span>
                <span>✓ 14-day free trial</span>
                <span>✓ Cancel anytime</span>
              </div>
            </div>
            <div className="flex-1 relative">
              <div className="landing-hero-card">
                <img src={heroFood} alt="ServeDash hero" className="w-full h-full object-cover rounded-3xl shadow-2xl" />
                <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-lg px-6 py-4 flex items-center gap-4 border border-gray-100">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold">24/7</div>
                  <div>
                    <p className="font-semibold text-gray-900">Live Operations</p>
                    <p className="text-sm text-gray-500">Scheduling + Ordering synced</p>
                  </div>
                  <Bell className="text-orange-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="section-padding section-light">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">Everything You Need</p>
            <h2 className="section-title">All-in-one platform for schedules and service</h2>
            <p className="section-subtitle">Powerful tooling for managers, staff, and customers alike.</p>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="icon-circle">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="section-padding section-accent">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">How it works</p>
            <h2 className="section-title">Get started in 3 simple steps</h2>
          </div>
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute inset-x-16 top-16 h-1 bg-gradient-to-r from-orange-200 to-orange-500" />
            {steps.map((step) => (
              <div key={step.number} className="timeline-card">
                <div className="step-badge">{step.number}</div>
                <step.icon className="w-8 h-8 text-orange-500 mb-4" />
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Dual purpose */}
        <section className="section-padding section-light">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">Dual Experience</p>
            <h2 className="section-title">Two powerful systems. One seamless experience.</h2>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="purpose-card bg-gradient-to-br from-blue-50 to-blue-100">
              <div className="icon-circle bg-white text-blue-500">
                <CalendarCheck className="w-6 h-6" />
              </div>
              <h3>For Your Team</h3>
              <ul>
                {['Create and manage work schedules', 'Track availability in real time', 'Slot booking with approvals', 'Profile and shift alerts'].map((item) => (
                  <li key={item}>
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="purpose-cta">Explore Staff Features →</button>
            </div>
            <div className="purpose-card bg-gradient-to-br from-orange-50 to-amber-100">
              <div className="icon-circle bg-white text-orange-500">
                <Utensils className="w-6 h-6" />
              </div>
              <h3>For Your Customers</h3>
              <ul>
                {['Curated menus by cuisine', 'Frictionless ordering', 'Live order tracking', 'Customer preferences'].map((item) => (
                  <li key={item}>
                    <CheckCircle2 className="w-4 h-4 text-orange-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="purpose-cta">Explore Food Features →</button>
            </div>
          </div>
        </section>

        {/* Menu preview */}
        <section id="menu" className="section-padding section-warm">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">Menu Preview</p>
            <h2 className="section-title">Global flavors at your fingertips</h2>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuCategories.map((category) => (
              <div key={category.name} className="menu-card">
                <div className={`menu-card-accent bg-gradient-to-r ${category.accent}`} />
                <h3>{category.name}</h3>
                <ul>
                  {category.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button className="menu-link">Browse Menu →</button>
              </div>
            ))}
          </div>
        </section>

        {/* Roles */}
        <section className="section-padding section-light" id="about">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">Built for every role</p>
            <h2 className="section-title">Connected experiences for teams, managers, and guests</h2>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div key={role.title} className="role-card">
                <div className="text-3xl">{role.icon}</div>
                <h3>{role.title}</h3>
                <p>{role.description}</p>
                <button className="role-link">{role.cta}</button>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="section-padding section-light">
          <div className="max-w-6xl mx-auto px-6 text-center mb-12">
            <p className="section-eyebrow">Testimonials</p>
            <h2 className="section-title">Trusted by teams like yours</h2>
          </div>
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div key={testimonial.name} className="testimonial-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center font-semibold">
                    {testimonial.name[0]}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">"{testimonial.quote}"</p>
                <div className="flex items-center gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="section-padding landing-cta-gradient text-center">
          <div className="max-w-4xl mx-auto px-6 text-white space-y-6">
            <p className="section-eyebrow text-orange-200">Ready to transform?</p>
            <h2 className="text-4xl md:text-5xl font-black leading-tight">
              Ready to transform your hospitality operations?
            </h2>
            <p className="text-lg">
              Join hundreds of modern teams scheduling smarter, serving faster, and making better decisions in real time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup" className="cta-primary bg-white text-navy hover:-translate-y-1 hover:shadow-2xl">
                Get Started Free
              </Link>
              <button className="cta-secondary border-white text-white hover:bg-white/10">Schedule a Demo</button>
            </div>
            <p className="text-sm text-orange-100">No credit card required • Free 14-day trial</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-navy text-white" id="contact">
        <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-md space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="ServeDash logo" className="h-10 w-auto object-contain" />
              <div>
                <p className="font-bold text-lg">ServeDash</p>
                <p className="text-sm text-gray-300">Schedule Smart. Order Fast.</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">
              Dual platform for hospitality teams who need both reliable staff coordination and unforgettable food experiences.
            </p>
            <div className="flex gap-3">
              {['twitter', 'instagram', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                >
                  {social[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-sm text-gray-300">
            <div>
              <p className="footer-heading">Explore</p>
              <ul>
                <li>Features</li>
                <li>How it Works</li>
                <li>Menu</li>
                <li>Updates</li>
              </ul>
            </div>
            <div>
              <p className="footer-heading">Support</p>
              <ul>
                <li>Help Center</li>
                <li>Contact</li>
                <li>Status</li>
                <li>API</li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between text-sm text-gray-300 gap-4">
            <p>© {new Date().getFullYear()} ServeDash. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#">Privacy</a>
              <a href="#">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;

