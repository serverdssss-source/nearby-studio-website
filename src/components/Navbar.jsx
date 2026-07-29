import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { animate } from "framer-motion";
import "./Navbar.css";
import logoWhite from "/Nearby studio_white.webp";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const circleRefs = useRef([]);
  const labelRefs = useRef([]);
  const hoverLabelRefs = useRef([]);
  const itemHeightRefs = useRef([]);
  const activeTweenRefs = useRef([]);

  useEffect(() => {
    const layout = () => {
      const pills = circleRefs.current
        .map((circle, index) => {
          if (!circle?.parentElement) return null;
          return { circle, pill: circle.parentElement, index };
        })
        .filter(Boolean);

      // 1. Read all layout values first (Avoid forced reflow)
      const rects = pills.map(({ pill }) => pill.getBoundingClientRect());

      // 2. Write all styles in a separate pass
      pills.forEach(({ circle, index }, i) => {
        const { width: w, height: h } = rects[i];
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;
        circle.style.transform = "translateX(-50%) scale(0)";
        circle.style.transformOrigin = `50% ${originY}px`;

        const label = labelRefs.current[index];
        const hoverLabel = hoverLabelRefs.current[index];

        if (label) label.style.transform = "translateY(0px)";
        if (hoverLabel) {
          hoverLabel.style.transform = `translateY(${Math.ceil(h + 100)}px)`;
          hoverLabel.style.opacity = "0";
        }
        itemHeightRefs.current[index] = h;
      });
    };

    let idleId;
    let timeoutId;

    const runLayout = () => layout();

    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(runLayout, { timeout: 250 });
    } else {
      timeoutId = window.setTimeout(runLayout, 80);
    }

    window.addEventListener('resize', layout);
    return () => {
      if (idleId) window.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
      window.removeEventListener('resize', layout);
    };
  }, []);

  const handleEnter = (i) => {
    const circle = circleRefs.current[i];
    const label = labelRefs.current[i];
    const hoverLabel = hoverLabelRefs.current[i];
    const h = itemHeightRefs.current[i];
    if (!circle || typeof h !== "number") return;
    activeTweenRefs.current[i]?.forEach((control) => control?.stop?.());

    const controls = [];
    controls.push(animate(circle, { transform: "translateX(-50%) scale(1.2)" }, { duration: 0.3, ease: [0.22, 1, 0.36, 1] }));
    if (label) {
      controls.push(animate(label, { transform: `translateY(${-(h + 8)}px)` }, { duration: 0.3, ease: [0.22, 1, 0.36, 1] }));
    }
    if (hoverLabel) {
      controls.push(animate(hoverLabel, { transform: "translateY(0px)", opacity: 1 }, { duration: 0.3, ease: [0.22, 1, 0.36, 1] }));
    }
    activeTweenRefs.current[i] = controls;
  };

  const handleLeave = (i) => {
    const circle = circleRefs.current[i];
    const label = labelRefs.current[i];
    const hoverLabel = hoverLabelRefs.current[i];
    const h = itemHeightRefs.current[i];
    if (!circle || typeof h !== "number") return;
    activeTweenRefs.current[i]?.forEach((control) => control?.stop?.());

    const controls = [];
    controls.push(animate(circle, { transform: "translateX(-50%) scale(0)" }, { duration: 0.2, ease: [0.22, 1, 0.36, 1] }));
    if (label) {
      controls.push(animate(label, { transform: "translateY(0px)" }, { duration: 0.2, ease: [0.22, 1, 0.36, 1] }));
    }
    if (hoverLabel) {
      controls.push(
        animate(
          hoverLabel,
          { transform: `translateY(${Math.ceil(h + 100)}px)`, opacity: 0 },
          { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
        )
      );
    }
    activeTweenRefs.current[i] = controls;
  };

  const handleContactClick = (e) => {
    e.preventDefault();
    setOpen(false);
    setBookOpen(false);

    if (location.pathname === '/') {
      // Already on home page, just scroll
      document.getElementById('contact-form')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    } else {
      // Navigate to home page first, then scroll
      navigate('/');
      setTimeout(() => {
        document.getElementById('contact-form')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 300);
    }
  };

  const isBookSpaceActive = ['/podcast', '/fashionshoot', '/studios', '/greenscreenshoot'].includes(location.pathname);

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <picture>
          <source srcSet={`${logoWhite}`} />
          <img src={logoWhite} alt="Logo" width="220" height="80" decoding="async" loading="eager" />
        </picture>
      </div>

      {/* Hamburger */}
      <div
        className={`hamburger ${open ? "active" : ""}`}
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
      </div>

      {/* Links */}
      <ul className={`navbar-links ${open ? "show" : ""}`}>
        <li className={location.pathname === '/' ? 'active' : ''}>
          <Link
            to="/"
            onClick={() => {
              setOpen(false);
              setBookOpen(false);
            }}
            onMouseEnter={() => handleEnter(0)}
            onMouseLeave={() => handleLeave(0)}
          >
            <span className="hover-circle" ref={el => circleRefs.current[0] = el}></span>
            <span className="label-stack">
              <span className="pill-label" ref={el => labelRefs.current[0] = el}>Home</span>
              <span className="pill-label-hover" ref={el => hoverLabelRefs.current[0] = el}>Home</span>
            </span>
          </Link>
        </li>

        <li
          className={`nav-dropdown ${isBookSpaceActive ? 'active' : ''} ${bookOpen ? 'open' : ''}`}
          onMouseEnter={() => handleEnter(1)}
          onMouseLeave={() => handleLeave(1)}
        >
          <button
            type="button"
            className="dropdown-toggle"
            onClick={() => setBookOpen((prev) => !prev)}
          >
            <span className="hover-circle" ref={el => circleRefs.current[1] = el}></span>
            <span className="label-stack">
              <span className="pill-label" ref={el => labelRefs.current[1] = el}>Book Our Space</span>
              <span className="pill-label-hover" ref={el => hoverLabelRefs.current[1] = el}>Book Our Space</span>
            </span>
            <span className="dropdown-caret" aria-hidden="true">▾</span>
          </button>

          <ul className="dropdown-menu">
            <li>
              <Link
                to="/studios"
                preload="none"
                loading="lazy"
                onMouseOver={(e) => e.target.preload = "auto"}
                onClick={() => { setOpen(false); setBookOpen(false); }}
                onMouseEnter={() => handleEnter(3)}
                onMouseLeave={() => handleLeave(3)}
              >
                <span className="hover-circle" ref={el => circleRefs.current[3] = el}></span>
                <span className="label-stack">
                  <span className="pill-label" ref={el => labelRefs.current[3] = el}>Rent Our Studio</span>
                  <span className="pill-label-hover" ref={el => hoverLabelRefs.current[3] = el}>Rent Our Studio</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/podcast"
                onClick={() => { setOpen(false); setBookOpen(false); }}
                onMouseEnter={() => handleEnter(4)}
                onMouseLeave={() => handleLeave(4)}
              >
                <span className="hover-circle" ref={el => circleRefs.current[4] = el}></span>
                <span className="label-stack">
                  <span className="pill-label" ref={el => labelRefs.current[4] = el}>Podcast Shoot</span>
                  <span className="pill-label-hover" ref={el => hoverLabelRefs.current[4] = el}>Podcast Shoot</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/fashionshoot"
                onClick={() => { setOpen(false); setBookOpen(false); }}
                onMouseEnter={() => handleEnter(5)}
                onMouseLeave={() => handleLeave(5)}
              >
                <span className="hover-circle" ref={el => circleRefs.current[5] = el}></span>
                <span className="label-stack">
                  <span className="pill-label" ref={el => labelRefs.current[5] = el}>Model Shoot</span>
                  <span className="pill-label-hover" ref={el => hoverLabelRefs.current[5] = el}>Model Shoot</span>
                </span>
              </Link>
            </li>
            <li>
              <Link
                to="/greenscreenshoot"
                onClick={() => { setOpen(false); setBookOpen(false); }}
                onMouseEnter={() => handleEnter(6)}
                onMouseLeave={() => handleLeave(6)}
              >
                <span className="hover-circle" ref={el => circleRefs.current[6] = el}></span>
                <span className="label-stack">
                  <span className="pill-label" ref={el => labelRefs.current[6] = el}>Green Screen Shoot</span>
                  <span className="pill-label-hover" ref={el => hoverLabelRefs.current[6] = el}>Green Screen Shoot</span>
                </span>
              </Link>
            </li>
          </ul>
        </li>

        <li className={location.pathname === '/contactus' ? 'active' : ''}>
          <a href="#contact-form" onClick={handleContactClick} onMouseEnter={() => handleEnter(2)} onMouseLeave={() => handleLeave(2)}>
            <span className="hover-circle" ref={el => circleRefs.current[2] = el}></span>
            <span className="label-stack">
              <span className="pill-label" ref={el => labelRefs.current[2] = el}>Contact Us</span>
              <span className="pill-label-hover" ref={el => hoverLabelRefs.current[2] = el}>Contact Us</span>
            </span>
          </a>
        </li>

        <li className={location.pathname === '/blog' ? 'active' : ''}>
          <Link
            to="/blog"
            onClick={() => {
              setOpen(false);
              setBookOpen(false);
            }}
            onMouseEnter={() => handleEnter(7)}
            onMouseLeave={() => handleLeave(7)}
          >
            <span className="hover-circle" ref={el => circleRefs.current[7] = el}></span>
            <span className="label-stack">
              <span className="pill-label" ref={el => labelRefs.current[7] = el}>Blog</span>
              <span className="pill-label-hover" ref={el => hoverLabelRefs.current[7] = el}>Blog</span>
            </span>
          </Link>
        </li>

      </ul>
    </nav>
  );
};

export default Navbar;
