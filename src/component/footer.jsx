
'use client'
import React, { useState, useEffect } from 'react'
import connect from '../images/connect.jpg'
import {
  FaGithub,
  FaLinkedin,
  FaEnvelope,
  FaPaperPlane,
  FaArrowUp,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner,
  FaRegClock,
} from 'react-icons/fa'
 
/* ---------- Edit your details here ---------- */
const PROFILE = {
  name: 'Ashok',
  email: 'ashoksaha@3883gmail.com', // double-check this address
  location: 'Jharkhand, India',
  github: 'https://github.com/ashoksaha3883-bro?tab=repositories',
  linkedin: 'https://www.linkedin.com/in/ashok-kumar-981a5a395/',
  responseTime: 'Usually replies within 24 hours',
}
 
// Web3Forms access key (safe to use in frontend code). Messages go to the email you registered with.
const WEB3FORMS_URL = 'https://api.web3forms.com/submit'
const WEB3FORMS_ACCESS_KEY = '1aae3fad-7a8a-45b1-bf29-7bfe4e5e1d8d'
 
const SOCIALS = [
  { label: 'GitHub', href: PROFILE.github, icon: FaGithub, hover: 'hover:text-white hover:border-slate-500' },
  { label: 'LinkedIn', href: PROFILE.linkedin, icon: FaLinkedin, hover: 'hover:text-blue-400 hover:border-blue-500/60' },
  { label: 'Email', href: `mailto:${PROFILE.email}`, icon: FaEnvelope, hover: 'hover:text-red-400 hover:border-red-500/60' },
]
 
const MAX_MESSAGE = 500
 
const inputClass =
  'w-full px-4 py-3 bg-slate-800/70 border border-slate-700 rounded-xl text-white placeholder-slate-500 ' +
  'focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500 transition'
 
const Footer = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [honeypot, setHoneypot] = useState('') // spam trap, must stay empty
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [errorDetail, setErrorDetail] = useState('')
  const [showTop, setShowTop] = useState(false)
 
  // Show the back-to-top button after scrolling down
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
 
  // Hide success banner automatically (errors stay until the next attempt)
  useEffect(() => {
    if (status === 'success') {
      const t = setTimeout(() => setStatus('idle'), 6000)
      return () => clearTimeout(t)
    }
  }, [status])
 
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (honeypot || status === 'sending') return // bots / double-click
 
    setStatus('sending')
    setErrorDetail('')
 
    const payload = {
      access_key: WEB3FORMS_ACCESS_KEY,
      subject: `New portfolio message from ${name.trim()}`,
      from_name: 'Portfolio Contact Form',
      name: name.trim(),
      email: email.trim(), // lets you hit "Reply" and answer the sender directly
      message: message.trim(),
    }
 
    try {
      const response = await fetch(WEB3FORMS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
 
      if (response.ok && data.success) {
        setName('')
        setEmail('')
        setMessage('')
        setStatus('success')
      } else {
        console.error('Web3Forms error:', data)
        setErrorDetail(`${response.status} ${data.message || 'Unknown error'}`)
        setStatus('error')
      }
    } catch (error) {
      console.error('Network error:', error)
      setErrorDetail(error?.message || 'Network error. Check your internet connection.')
      setStatus('error')
    }
  }
 
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
 
  return (
    <footer id="contact" className="relative bg-[#0b1120] text-slate-300 pt-10 pb-8 overflow-hidden">
      {/* Decorative glow */}
      <div className="pointer-events-none absolute -top-30 left-1/2 -translate-x-1/2 h-64 w-[40rem] rounded-full bg-blue-600/10 blur-3xl" />
 
      <div className="relative max-w-screen-xl mx-auto px-6">
        {/* Heading */}
        <div className="mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full mb-5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            
         </span>
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Let's Connect</h2>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" />
          <p className="mt-5 max-w-xl text-slate-400 leading-relaxed">
           Let’s build something great together, <br />
Full-stack developer, ready to contribute from day one. Send me a message and I’ll reply within 24 hours.

          </p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Left column: image + contact details */}
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-2xl shadow-2xl border border-slate-800">
              <img
                src={connect}
                alt="Get in touch"
                loading="lazy"
                className="w-full h-[260px] lg:h-[300px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href={`mailto:${PROFILE.email}`}
                className="group bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition"
              >
                <FaEnvelope className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-xs text-slate-500 mb-1">Email</p>
                <p className="text-sm text-slate-200 break-all">{PROFILE.email}</p>
              </a>
 
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <FaMapMarkerAlt className="text-blue-400 mb-2" />
                <p className="text-xs text-slate-500 mb-1">Location</p>
                <p className="text-sm text-slate-200">{PROFILE.location}</p>
              </div>
 
              <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
                <FaRegClock className="text-blue-400 mb-2" />
                <p className="text-xs text-slate-500 mb-1">Response time</p>
                <p className="text-sm text-slate-200">{PROFILE.responseTime}</p>
              </div>
            </div>
          </div>
 
          {/* Right column: form */}
          <div className="bg-slate-900/60 backdrop-blur p-8 rounded-2xl border border-slate-800 shadow-xl">
            <form name="contact" className="space-y-5" onSubmit={handleSubmit}>
              {/* Honeypot: hidden from humans */}
              <div className="hidden" aria-hidden="true">
                <label>
                  Leave this empty
                  <input
                    type="text"
                    name="bot-field"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(e) => setHoneypot(e.target.value)}
                  />
                </label>
              </div>
 
              <div>
                <label htmlFor="contact-name" className="block text-sm font-semibold text-slate-200 mb-2">
                  Full Name
                </label>
                <input
                  id="contact-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  name="name"
                  autoComplete="name"
                  className={inputClass}
                  placeholder="John Doe"
                  required
                />
              </div>
 
              <div>
                <label htmlFor="contact-email" className="block text-sm font-semibold text-slate-200 mb-2">
                  Email Address
                </label>
                <input
                  id="contact-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={inputClass}
                  placeholder="john@example.com"
                  required
                />
              </div>
 
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="contact-message" className="block text-sm font-semibold text-slate-200">
                    Your Message
                  </label>
                  <span className={`text-xs ${message.length > MAX_MESSAGE * 0.9 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {message.length}/{MAX_MESSAGE}
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE))}
                  name="message"
                  rows="4"
                  className={`${inputClass} resize-none`}
                  placeholder="How can I help you?"
                  required
                />
              </div>
 
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-900/30 transition"
              >
                {status === 'sending' ? (
                  <>
                    <FaSpinner className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
 
              {/* Status feedback */}
              <div aria-live="polite">
                {status === 'success' && (
                  <p className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-4 py-3">
                    <FaCheckCircle /> Thanks! Your message was sent successfully.
                  </p>
                )}
                {status === 'error' && (
                  <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <p className="flex items-center gap-2">
                      <FaExclamationCircle /> Could not send the message. Please try again or email me directly.
                    </p>
                    {/* Remove this line once everything works */}
                    {errorDetail && <p className="mt-2 text-xs text-red-300/80 break-words">Details: {errorDetail}</p>}
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
 
        {/* Divider */}
        <div className="mt-16 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent" />
 
        {/* Bottom bar */}
        <div className="pt-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="text-center md:text-left">
            <p className="text-lg font-bold text-white">{PROFILE.name}</p>
            <p className="text-sm text-slate-500 mt-1">
              © {new Date().getFullYear()} {PROFILE.name}. All rights reserved.
            </p>
          </div>
 
          <div className="flex justify-center md:justify-end gap-3">
            {SOCIALS.map(({ label, href, icon: Icon, hover }) => {
              const external = !href.startsWith('mailto:')
              return (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className={`h-11 w-11 flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-slate-400 text-xl transition hover:-translate-y-1 ${hover}`}
                >
                  <Icon />
                </a>
              )
            })}
          </div>
        </div>
 
        <p className="mt-8 text-center text-xs text-slate-600">ThankYou For Your Time </p>
      </div>
 
      {/* Back to top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className={`fixed bottom-6 right-6 z-50 h-12 w-12 flex items-center justify-center rounded-full bg-blue-600 text-white shadow-lg shadow-blue-900/40 hover:bg-blue-500 hover:-translate-y-1 transition-all duration-300 ${
          showTop ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none translate-y-4'
        }`}
      >
        <FaArrowUp />
      </button>
    </footer>
  )
}
 
export default Footer
 
