
import React, { useRef, useState } from 'react';
import { Certificate } from './Certificate';
import { Button } from './Button';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface CertificatePreviewProps {
  studentName: string;
  courseTitle: string;
  onBack: () => void;
}

export const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  studentName,
  courseTitle,
  onBack
}) => {
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadCertificate = async () => {
    if (!certificateRef.current) return;
    setIsGeneratingPdf(true);

    try {
      // 1. Convert DOM to Canvas
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2, // Higher resolution for print
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      // 2. Convert Canvas to Image Data
      const imgData = canvas.toDataURL('image/png');

      // 3. Create PDF (Landscape, Millimeters, A4)
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Certificado-Quantum-${studentName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error("Error generating PDF", error);
      alert("Houve um erro ao gerar o certificado. Tente novamente.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="h-full bg-slate-900 flex flex-col overflow-hidden">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto w-full px-4 py-6 md:py-8 custom-scrollbar">
        <div className="max-w-6xl mx-auto flex flex-col min-h-full">
          
          {/* Header Actions */}
          <div className="w-full flex items-center justify-between mb-6 flex-shrink-0">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
            >
              <div className="p-2 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-medium text-sm md:text-base">Voltar</span>
            </button>
            <h1 className="text-white font-bold text-lg hidden md:block">Pré-visualização</h1>
            <div className="w-10 md:w-24"></div> {/* Spacer */}
          </div>

          {/* Certificate Container with Explicit Height Control */}
          <div className="flex-1 flex flex-col items-center justify-center w-full mb-8">
            <div className="bg-slate-800 p-1 md:p-8 rounded-2xl shadow-2xl border border-slate-700 w-full flex justify-center overflow-hidden">
               {/* 
                  CRITICAL FIX: 
                  Use explicit height classes on the wrapper to match the visual height of the scaled element.
                  Original Height: 794px.
                  Scale 0.26 (Mobile) -> Height ~206px -> Class h-[210px]
                  Scale 0.45 (SM) -> Height ~357px -> Class sm:h-[360px]
                  Scale 0.60 (MD) -> Height ~476px -> Class md:h-[480px]
                  Scale 0.85 (XL) -> Height ~675px -> Class xl:h-[680px]
               */}
               <div className="relative w-full flex justify-center h-[210px] sm:h-[360px] md:h-[480px] lg:h-[600px] xl:h-[680px] transition-all duration-300">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 origin-top transform scale-[0.26] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.85]">
                    <Certificate 
                      ref={certificateRef}
                      studentName={studentName}
                      courseTitle={courseTitle}
                      completionDate={new Date().toLocaleDateString('pt-BR')}
                    />
                 </div>
               </div>
            </div>

            <p className="text-slate-500 text-xs md:text-sm text-center mt-4 max-w-md">
              Visualize acima como seu certificado será impresso. A versão PDF possui alta resolução (A4).
            </p>
          </div>

          {/* Action Bar - Always visible at bottom of content flow */}
          <div className="flex flex-col items-center gap-4 pb-8 md:pb-0 mt-auto">
            <Button 
              onClick={handleDownloadCertificate} 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-900/40 shadow-xl w-full md:w-auto md:px-12 py-4 text-base md:text-lg font-semibold"
              disabled={isGeneratingPdf}
            >
              {isGeneratingPdf ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Gerando PDF...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar Certificado PDF
                </span>
              )}
            </Button>
            <p className="text-slate-600 text-[10px] md:hidden">
              Recomendamos baixar via Wi-Fi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
