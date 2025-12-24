
import React, { forwardRef } from 'react';
import { CertificateConfig } from '../types';

interface CertificateProps {
  studentName: string;
  courseTitle: string;
  completionDate: string;
  config: CertificateConfig; // Novo prop de configuração
  className?: string;
}

export const Certificate = forwardRef<HTMLDivElement, CertificateProps>(({ 
  studentName, 
  courseTitle, 
  completionDate,
  config,
  className = ''
}, ref) => {
  return (
    <div 
      ref={ref} 
      className={`w-[1123px] h-[794px] bg-white text-slate-900 relative overflow-hidden flex flex-col items-center justify-center p-20 shadow-2xl ${className}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Background Decorative Elements (Geometric/Quantum) - Colorized by Config */}
      <div 
        className="absolute top-0 left-0 w-64 h-64 border-[40px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-60"
        style={{ borderColor: config.primaryColor, opacity: 0.1 }}
      ></div>
      <div 
        className="absolute top-0 left-0 w-80 h-80 border-[2px] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ borderColor: config.primaryColor, opacity: 0.3 }}
      ></div>
      
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-slate-900 rounded-full translate-x-1/3 translate-y-1/3 opacity-5"></div>
      <div className="absolute bottom-10 right-10 w-24 h-24 rounded-full opacity-20" style={{ backgroundColor: config.primaryColor }}></div>

      <div className="absolute top-10 right-10 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
          <div className="w-2 h-2 rounded-full bg-slate-300"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full border border-slate-200 flex flex-col items-center justify-between py-16 px-12 bg-white/50 backdrop-blur-sm">
          
          {/* Header */}
          <div className="text-center">
              <div 
                className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center text-white font-bold text-2xl mb-6 shadow-lg"
                style={{ backgroundColor: config.primaryColor, boxShadow: `0 10px 15px -3px ${config.primaryColor}40` }}
              >
                {config.institutionName.charAt(0)}
              </div>
              <h1 className="text-5xl font-light tracking-[0.2em] text-slate-800 uppercase font-sans">
                  {config.title}
              </h1>
              <p 
                className="text-sm tracking-[0.3em] font-bold uppercase mt-3"
                style={{ color: config.primaryColor }}
              >
                  {config.subtitle}
              </p>
          </div>

          {/* Main Body */}
          <div className="text-center space-y-8 w-full max-w-4xl flex flex-col items-center">
              <p className="text-slate-500 text-lg">{config.bodyText}</p>
              
              <h2 className="text-6xl font-serif font-bold text-slate-900 italic py-4 border-b border-slate-200 inline-block w-full">
                  {studentName}
              </h2>

              <p className="text-slate-600 text-lg leading-relaxed max-w-2xl mx-auto">
                  Por completar com êxito todos os módulos, avaliações e requisitos práticos do curso avançado de
              </p>

              <h3 
                className="text-3xl font-bold w-full max-w-3xl mx-auto text-center leading-snug break-words"
                style={{ color: config.primaryColor }} // Usando cor primária para o título do curso
              >
                  {courseTitle}
              </h3>
          </div>

          {/* Footer */}
          <div className="w-full flex justify-between items-end mt-12 px-12">
              <div className="text-center">
                  <div className="text-lg font-medium text-slate-900 mb-2">{completionDate}</div>
                  <div className="w-40 h-px bg-slate-300 mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">Data de Emissão</p>
              </div>

              {/* Seal */}
              {config.displaySeal && (
                <div className="relative w-32 h-32 flex items-center justify-center">
                    <div 
                        className="absolute inset-0 border-2 rounded-full border-dashed animate-spin-slow"
                        style={{ borderColor: config.primaryColor, opacity: 0.3 }}
                    ></div>
                    <div className="absolute inset-2 border border-slate-200 rounded-full"></div>
                    <div className="text-center transform -rotate-12">
                        <span 
                            className="block font-bold text-xs tracking-widest uppercase"
                            style={{ color: config.primaryColor }}
                        >
                            {config.institutionName}
                        </span>
                        <span className="block text-[10px] text-slate-400 uppercase">Verified</span>
                    </div>
                </div>
              )}

              <div className="text-center">
                  <div className="font-serif italic text-2xl text-slate-800 mb-2">{config.signerName}</div>
                  <div className="w-40 h-px bg-slate-300 mx-auto"></div>
                  <p className="text-xs text-slate-400 mt-2 uppercase tracking-wider">{config.signerRole}</p>
              </div>
          </div>
      </div>
    </div>
  );
});

Certificate.displayName = 'Certificate';
