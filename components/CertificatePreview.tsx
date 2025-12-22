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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center py-8 px-4 overflow-y-auto">
      {/* Header Actions */}
      <div className="w-full max-w-6xl flex items-center justify-between mb-8">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Voltar ao Painel
        </button>
        <h1 className="text-white font-bold text-xl hidden md:block">Pré-visualização do Certificado</h1>
        <div className="w-24"></div> {/* Spacer for center alignment */}
      </div>

      {/* Certificate Preview Container */}
      <div className="flex-1 flex flex-col items-center justify-center w-full">
        <div className="bg-slate-800 p-2 md:p-8 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden max-w-full">
           {/* 
              Scale container: 
              The Certificate is fixed at 1123px width. 
              We use CSS transform to scale it down to fit smaller screens without altering the PDF generation layout.
           */}
           <div className="overflow-x-auto md:overflow-hidden flex justify-center">
             <div className="origin-top transform scale-[0.28] sm:scale-[0.45] md:scale-[0.6] lg:scale-[0.75] xl:scale-[0.85] 2xl:scale-100 transition-transform duration-300">
                <Certificate 
                  ref={certificateRef}
                  studentName={studentName}
                  courseTitle={courseTitle}
                  completionDate={new Date().toLocaleDateString('pt-BR')}
                />
             </div>
             {/* 
                Placeholder spacer to maintain height of the scaled element in the flow 
                Height of Cert (794) * Scale factor approx
             */}
             <div className="hidden md:block h-[500px] lg:h-[600px] w-0"></div> 
           </div>
        </div>

        {/* Action Bar */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="text-slate-400 text-sm text-center max-w-md">
            Este é o modelo final do seu certificado. Clique abaixo para baixar a versão em alta resolução.
          </p>
          
          <Button 
            onClick={handleDownloadCertificate} 
            size="lg" 
            className="bg-amber-500 hover:bg-amber-600 text-white shadow-amber-900/20 shadow-xl px-12 py-4 text-lg"
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando PDF...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Baixar Certificado PDF
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};