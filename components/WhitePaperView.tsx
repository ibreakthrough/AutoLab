import React from 'react';
import ReactMarkdown from 'react-markdown';
import { WhitePaper } from '../types';
import { FileText, Download, Calendar, User } from 'lucide-react';

interface WhitePaperViewProps {
  paper: WhitePaper;
  onReset: () => void;
}

const WhitePaperView: React.FC<WhitePaperViewProps> = ({ paper, onReset }) => {
  
  const handleExportPDF = () => {
    const content = document.getElementById('white-paper-content');
    if (!content) return;

    // Create a print window
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Please allow popups to export PDF");
        return;
    }

    // We strip the tailwind classes effectively by not including tailwind in the print window
    // and instead providing our own semantic CSS.
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${paper.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;1,400&display=swap');
            
            @media print {
                @page { margin: 2.5cm; }
                body { margin: 0; }
                .no-print { display: none; }
                .print-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
            }
            
            body {
              font-family: 'Merriweather', 'Times New Roman', serif;
              line-height: 1.8;
              color: #1a1a1a;
              max-width: 800px;
              margin: 40px auto;
              padding: 40px;
            }

            .header-meta {
                border-bottom: 1px solid #eee;
                padding-bottom: 20px;
                margin-bottom: 40px;
            }
            
            .brand-logo {
                font-family: sans-serif;
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #666;
                margin-bottom: 20px;
            }

            h1 { font-size: 32px; margin-bottom: 10px; font-weight: 700; line-height: 1.3; }
            .meta-row { font-family: sans-serif; font-size: 14px; color: #555; display: flex; gap: 20px; margin-top: 15px; }

            h2 { font-size: 24px; margin-top: 32px; color: #111; font-weight: 700; border-bottom: 2px solid #f0f0f0; padding-bottom: 8px; }
            h3 { font-size: 18px; margin-top: 24px; font-weight: 700; color: #333; }
            p { margin-bottom: 16px; text-align: justify; }
            ul, ol { margin-bottom: 16px; padding-left: 24px; }
            li { margin-bottom: 6px; }
            blockquote { border-left: 3px solid #3b82f6; padding-left: 20px; font-style: italic; color: #444; margin: 20px 0; background: #f8fafc; padding: 15px 20px; }
            code { background: #f1f5f9; padding: 2px 4px; border-radius: 3px; font-family: 'Courier New', monospace; font-size: 0.9em; }
            
            .footer-branding {
                margin-top: 60px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                text-align: center;
                font-family: sans-serif;
                font-size: 12px;
                color: #888;
            }
          </style>
        </head>
        <body>
          <div class="header-meta">
            <div class="brand-logo">Powered by iBreakthrough Research Science</div>
            <h1>${paper.title}</h1>
            <div class="meta-row">
                <span><strong>Author:</strong> ${paper.author || 'Unknown'}</span>
                <span><strong>Date:</strong> ${paper.date || new Date().toLocaleDateString()}</span>
            </div>
          </div>
          
          ${content.innerHTML}
          
          <div class="footer-branding print-footer">
            Powered by iBreakthrough Research Science
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      <div className="p-6 border-b border-slate-700 bg-lab-panel flex justify-between items-center sticky top-0 z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">White Paper Generated</h2>
            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                <span className="flex items-center gap-1"><User size={12} /> {paper.author}</span>
                <span className="flex items-center gap-1"><Calendar size={12} /> {paper.date}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
             <button 
                onClick={onReset}
                className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
                New Experiment
            </button>
            <button 
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-md transition-all shadow-lg shadow-indigo-500/20"
            >
                <Download size={16} />
                Export PDF
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-900 p-8 flex justify-center">
        <div className="w-full max-w-3xl flex flex-col">
            {/* Paper Header (Visual only, redundant with PDF but nice for UI) */}
            <div className="mb-8 pb-6 border-b border-slate-800">
                 <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">{paper.title}</h1>
                 <div className="flex flex-wrap gap-6 text-sm text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Principal Investigator</span>
                        <span className="text-slate-200">{paper.author || 'AutoLab AI'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-indigo-400 font-bold uppercase tracking-wider text-xs">Date</span>
                        <span className="text-slate-200">{paper.date}</span>
                    </div>
                 </div>
            </div>

            <article id="white-paper-content" className="prose prose-invert prose-slate max-w-none w-full">
                <ReactMarkdown
                    components={{
                        h1: ({node, ...props}) => <h1 className="hidden" {...props} />, // Hide H1 in markdown since we have custom header
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-indigo-300 mt-10 mb-6 pb-2 border-b border-slate-800" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-semibold text-indigo-200 mt-8 mb-4" {...props} />,
                        p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-6 text-lg" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc pl-6 mb-6 text-slate-300 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-6 italic text-slate-400 my-8 py-2 bg-slate-800/30 rounded-r-lg" {...props} />,
                        code: ({node, ...props}) => <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-sm" {...props} />
                    }}
                >
                    {paper.content}
                </ReactMarkdown>
            </article>

            {/* Footer Branding */}
            <div className="mt-20 pt-8 border-t border-slate-800 text-center">
                <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Powered by iBreakthrough Research Science</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default WhitePaperView;