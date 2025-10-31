import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { COMPANY_INFO } from '../constants';
import { Car, Shield, Clock, Star, Phone, Mail, MapPin, Wrench, Zap, Award, Check, Users, Battery, Droplet, Settings, Calendar, ChevronRight, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const services = [
    {
      icon: Wrench,
      title: "Preventive Maintenance",
      description: "Comprehensive check-ups to prevent costly repairs and extend vehicle lifespan",
      features: ["Oil changes", "Fluid checks", "Filter replacements", "Battery testing"]
    },
    {
      icon: Zap,
      title: "Electrical Systems",
      description: "Diagnosis and repair of all electrical components for optimal performance",
      features: ["Battery service", "Alternator repair", "Starter motor", "Wiring issues"]
    },
    {
      icon: Shield,
      title: "Brake & Suspension",
      description: "Complete brake system service and suspension alignment for safety",
      features: ["Brake pads", "Rotors", "Shock absorbers", "Wheel alignment"]
    },
    {
      icon: Car,
      title: "Engine Repair",
      description: "Expert diagnosis and repair of all engine components and systems",
      features: ["Engine rebuilds", "Timing belts", "Cooling system", "Performance tuning"]
    },
    {
      icon: Droplet,
      title: "Transmission Service",
      description: "Specialized care for automatic and manual transmissions",
      features: ["Fluid changes", "Clutch repair", "Transmission rebuild", "Diagnostics"]
    },
    {
      icon: Battery,
      title: "Hybrid/Electric",
      description: "Certified service for hybrid and electric vehicle systems",
      features: ["Battery maintenance", "Charging systems", "Motor diagnostics", "Software updates"]
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      rating: 5,
      comment: "Exceptional service! My car runs better than when it was new. The team went above and beyond to explain everything.",
      image: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      date: "2 weeks ago"
    },
    {
      name: "Mike Chen",
      rating: 5,
      comment: "Honest and professional. They identified issues others missed and saved me thousands in potential repairs.",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      date: "1 month ago"
    },
    {
      name: "Lisa Rodriguez",
      rating: 5,
      comment: "Fast, reliable, and transparent pricing. My family has been coming here for years and we've never been disappointed.",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=1",
      date: "3 months ago"
    }
  ];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hoveredService, setHoveredService] = useState(null);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Car className="h-9 w-9 text-[#1E3A8A] mr-3" />
              </motion.div>
              <span className="text-2xl font-bold text-gray-900">{COMPANY_INFO.NAME}</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <motion.a
                href="#services"
                whileHover={{ scale: 1.05, color: "#1E3A8A" }}
                className="text-gray-700 transition-colors font-medium"
              >
                Services
              </motion.a>
              <motion.a
                href="#testimonials"
                whileHover={{ scale: 1.05, color: "#1E3A8A" }}
                className="text-gray-700 transition-colors font-medium"
              >
                Testimonials
              </motion.a>
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05, color: "#1E3A8A" }}
                className="text-gray-700 transition-colors font-medium"
              >
                Contact
              </motion.a>
              <div className="flex items-center space-x-4 ml-4">
                <motion.div whileHover={{ scale: 1.05 }}>
                  <Link
                    to="/login"
                    className="text-[#1E3A8A] hover:text-[#152C5E] font-medium transition-colors px-4 py-2 rounded-lg hover:bg-[#EFF6FF]"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#1E3A8A] focus:outline-none"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                <svg
                  className={`h-6 w-6 ${isMenuOpen ? 'hidden' : 'block'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <svg
                  className={`h-6 w-6 ${isMenuOpen ? 'block' : 'hidden'}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: isMenuOpen ? 1 : 0,
            height: isMenuOpen ? 'auto' : 0
          }}
          className="md:hidden bg-white shadow-lg overflow-hidden"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a
              href="#services"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-[#EFF6FF]"
              onClick={() => setIsMenuOpen(false)}
            >
              Services
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-[#EFF6FF]"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#contact"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-[#1E3A8A] hover:bg-[#EFF6FF]"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </a>
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5 space-x-4">
                <Link
                  to="/login"
                  className="w-full text-center text-[#1E3A8A] hover:text-[#152C5E] font-medium transition-colors px-4 py-2 rounded-lg hover:bg-[#EFF6FF]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="w-full text-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all shadow-md"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </nav>

      {/* Hero Section with Video */}
      <section className="relative bg-gradient-to-r from-[#1E3A8A] to-[#152C5E] text-white overflow-hidden h-screen">
        {/* Video Background */}
        <div className="relative w-full h-full overflow-hidden">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source src="/videos/car service.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>


        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Premium Auto Care
                <span className="block text-orange-400 mt-4">Where Excellence Meets Precision</span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto"
            >
              Combining cutting-edge technology with decades of automotive expertise to deliver
              unparalleled service for your vehicle.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Book Service Now
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#services"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#1E3A8A] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Settings className="h-5 w-5" />
                  Explore Services
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
          <div className="animate-bounce">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </section>


      {/* Enhanced Services Section */}
      <section id="services" className="py-16 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-[#EFF6FF] text-[#1E3A8A] text-sm font-medium mb-4">
              <Wrench className="h-4 w-4 mr-2" />
              OUR SERVICES
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Auto Services</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Expert care for every aspect of your vehicle, from routine maintenance to complex repairs
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={index}
                  variants={item}
                  onMouseEnter={() => setHoveredService(index)}
                  onMouseLeave={() => setHoveredService(null)}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100 relative overflow-hidden"
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A] to-[#152C5E] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>

                  {/* Service icon */}
                  <div className="relative z-10">
                    <div className="bg-gradient-to-br from-[#1E3A8A] to-[#3B82F6] w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-md">
                      <Icon className="h-7 w-7 text-white" />
                    </div>

                    {/* Service title and description */}
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-[#1E3A8A] transition-colors duration-300">{service.title}</h3>
                    <p className="text-gray-600 mb-5 leading-relaxed">{service.description}</p>

                    {/* Features list */}
                    <div className="mb-6">
                      <h4 className="font-medium text-gray-800 mb-3 text-sm uppercase tracking-wide flex items-center">
                        <span className="w-5 h-0.5 bg-[#3B82F6] mr-2"></span>
                        Service Includes
                      </h4>
                      <ul className="space-y-2">
                        {service.features.map((feature, i) => (
                          <li key={i} className="flex items-start">
                            <div className="bg-green-100 p-1 rounded-full mr-3 flex-shrink-0 mt-0.5">
                              <Check className="h-3 w-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA button */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <Link
                        to="/signup"
                        className="inline-flex items-center text-[#1E3A8A] font-semibold group-hover:text-[#3B82F6] transition-colors duration-300"
                      >
                        <span className="mr-2">Schedule Service</span>
                        <div className="relative overflow-hidden">
                          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Additional CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-16"
          >
            <div className="bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] p-8 rounded-2xl text-white shadow-lg">
              <h3 className="text-2xl font-bold mb-4">Can't Find The Service You Need?</h3>
              <p className="text-lg mb-6 max-w-2xl mx-auto opacity-90">
                We offer specialized services for all makes and models. Contact us to discuss your specific automotive needs.
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#contact"
                  className="inline-flex items-center bg-white text-[#1E3A8A] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-md"
                >
                  <Phone className="h-5 w-5 mr-2" />
                  Contact Our Experts
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-gradient-to-br from-[#1E3A8A] to-[#152C5E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Our Service Process</h2>
            <p className="text-xl text-[#93C5FD] max-w-3xl mx-auto">
              Transparent, efficient, and designed with your convenience in mind
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Timeline connector */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-1 bg-[#3B82F6]"></div>

            {[
              {
                icon: Calendar,
                title: "Schedule Appointment",
                description: "Book online or call to schedule your service at a convenient time"
              },
              {
                icon: Car,
                title: "Vehicle Assessment",
                description: "Thorough inspection and diagnostic testing to identify all needs"
              },
              {
                icon: Settings,
                title: "Service Approval",
                description: "Detailed estimate and approval before any work begins"
              },
              {
                icon: Check,
                title: "Quality Delivery",
                description: "Final inspection and explanation of completed work"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative z-10"
              >
                <div className="bg-gradient-to-b from-[#1D4ED8] to-[#1E40AF] p-8 rounded-xl h-full text-center hover:from-[#1E40AF] hover:to-[#1E3A8A] transition-all shadow-lg">
                  <div className="bg-[#3B82F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 shadow-md">
                    <step.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="mb-2 text-orange-400 font-bold">Step {index + 1}</div>
                  <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-[#BFDBFE]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <h2 className="text-4xl font-bold text-[#FF7C33] mb-6">By The Numbers</h2>
              <p className="text-xl text-white mb-8">
                Our commitment to excellence is reflected in these metrics that demonstrate our dedication to quality service.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { value: "15,000+", label: "Vehicles Serviced" },
                  { value: "98%", label: "Customer Satisfaction" },
                  { value: "25+", label: "Years Experience" }
                ].map((stat, index) => (
                  <div key={index} className="bg-[#EFF6FF] p-6 rounded-xl hover:shadow-md transition-shadow">
                    <div className="text-4xl font-bold text-[#1E3A8A] mb-2">
                      {stat.value}
                    </div>
                    <p className="text-gray-700 font-medium">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-70 z-0"></div>
              <div className="relative z-10"></div>
            </div>
          </div>
        </div>

        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/video 2.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      </section>




      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-[#EFF6FF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Customer Experiences</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Don't just take our word for it - hear from our satisfied customers
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={item}
                className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-14 h-14 rounded-full mr-4 object-cover border-2 border-[#E0E7FF]"
                  />
                  <div>
                    <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                    <div className="flex items-center">
                      <div className="flex mr-2">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{testimonial.date}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-4">"{testimonial.comment}"</p>
                <div className="flex justify-end">
                  <svg className="h-8 w-8 text-[#E0E7FF]" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#1E3A8A] to-[#152C5E] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">Ready for Exceptional Auto Service?</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Experience the difference with our professional team and premium service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/signup"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-orange-600 hover:to-orange-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Calendar className="h-5 w-5" />
                  Book Appointment
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <a
                  href="#contact"
                  className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-[#1E3A8A] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact - Reduced Height */}
      <section id="contact" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-lg text-gray-600 mb-6">
                Have questions or need to schedule service? Our team is ready to assist you.
              </p>

              <div className="space-y-4">
                {[
                  { icon: Phone, title: "Phone", content: COMPANY_INFO.PHONE, link: `tel:${COMPANY_INFO.PHONE}` },
                  { icon: Mail, title: "Email", content: COMPANY_INFO.EMAIL, link: `mailto:${COMPANY_INFO.EMAIL}` },
                  { icon: MapPin, title: "Address", content: COMPANY_INFO.ADDRESS, link: `https://maps.google.com/?q=${encodeURIComponent(COMPANY_INFO.ADDRESS)}` }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ x: 5 }}
                    className="flex items-start"
                  >
                    <div className="bg-[#E0E7FF] p-2 rounded-lg mr-3 flex-shrink-0">
                      <item.icon className="h-5 w-5 text-[#1E3A8A]" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{item.title}</h3>
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 hover:text-[#1E3A8A] transition-colors text-sm"
                      >
                        {item.content}
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li className="flex justify-between max-w-xs">
                    <span>Monday - Friday</span>
                    <span>7:00 AM - 7:00 PM</span>
                  </li>
                  <li className="flex justify-between max-w-xs">
                    <span>Saturday</span>
                    <span>8:00 AM - 5:00 PM</span>
                  </li>
                  <li className="flex justify-between max-w-xs">
                    <span>Sunday</span>
                    <span>Closed</span>
                  </li>
                </ul>
              </div>
            </div>

            <motion.div
              whileHover={{ y: -3 }}
              className="bg-[#EFF6FF] p-6 rounded-xl shadow-lg"
            >
              <h3 className="text-xl font-semibold mb-4">Send Us a Message</h3>
              <form className="space-y-3">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                  <textarea
                    id="message"
                    rows="3"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#1E3A8A] focus:border-[#1E3A8A] transition-all text-sm"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1E3A8A] to-[#3B82F6] text-white py-2.5 rounded-lg font-semibold hover:from-[#1E40AF] hover:to-[#1D4ED8] transition-all shadow-md text-sm"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>



      {/* Map Section */}
      <div className="h-96 w-full bg-gray-200">
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight="0"
          marginWidth="0"
          src="https://maps.google.com/maps?q=223+Jayantha+Mallimarachchi+Mawatha,+Colombo+01400&output=embed"
          title="Location Map"
        ></iframe>
      </div>






      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Car className="h-8 w-8 text-orange-400 mr-2" />
                <span className="text-xl font-bold">{COMPANY_INFO.NAME}</span>
              </div>
              <p className="text-gray-400 text-sm mb-4">
                Providing premium automotive services with expertise, integrity, and dedication to customer satisfaction.
              </p>
              <div className="flex space-x-4">
                {[
                  { name: "Facebook", icon: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
                  { name: "Twitter", icon: "M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" },
                  { name: "Instagram", icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" }
                ].map((social, index) => (
                  <a
                    key={index}
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Services",
                links: [
                  { name: "Preventive Maintenance", href: "#services" },
                  { name: "Electrical Systems", href: "#services" },
                  { name: "Brake & Suspension", href: "#services" },
                  { name: "Engine Repair", href: "#services" },
                  { name: "Transmission Service", href: "#services" },
                  { name: "Hybrid/Electric", href: "#services" }
                ]
              },
              {
                title: "Quick Links",
                links: [
                  { name: "About Us", href: "#" },
                  { name: "Testimonials", href: "#testimonials" },
                  { name: "Contact", href: "#contact" },
                  { name: "Privacy Policy", href: "#" },
                  { name: "Terms of Service", href: "#" }
                ]
              },
              {
                title: "Contact Info",
                links: [
                  { name: COMPANY_INFO.ADDRESS, href: `https://maps.google.com/?q=${encodeURIComponent(COMPANY_INFO.ADDRESS)}` },
                  { name: COMPANY_INFO.PHONE, href: `tel:${COMPANY_INFO.PHONE}` },
                  { name: COMPANY_INFO.EMAIL, href: `mailto:${COMPANY_INFO.EMAIL}` }
                ]
              }
            ].map((column, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold mb-4">{column.title}</h3>
                <ul className="space-y-2">
                  {column.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} {COMPANY_INFO.NAME}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;