"use client";

import React from "react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#1f40ed] to-[#4A628A] text-white py-4 text-center fixed bottom-0 w-full font-montserrat">
      <p className="inline">
        Developed with <span className="text-red-500">&hearts;</span> by{" "}
        <a
          href="https://jatinsuri.in"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-[#4A628A] transition-colors duration-300 font-bold"
        >
          Jatin
        </a>{" "}
        and{" "}
        <a
          href="https://www.linkedin.com/in/om-sanjay-sangwan/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white underline hover:text-[#4A628A] transition-colors duration-300 font-bold"
        >
          Om
        </a>
      </p>
    </footer>
  );
}
