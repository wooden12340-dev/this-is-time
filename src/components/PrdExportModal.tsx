import React, { useState } from 'react';
import { X, Copy, Download, Check, FileText } from 'lucide-react';
import { DAEJIN_TIMETABLE_PRD } from '../data/prdContent';

interface PrdExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrdExportModal: React.FC<PrdExportModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 마크다운 텍스트 합성
  const generateFullMarkdown = (): string => {
    let md = `# ${DAEJIN_TIMETABLE_PRD.title}\n\n`;
    md += `> ${DAEJIN_TIMETABLE_PRD.subtitle}\n\n`;
    md += `- **버전**: ${DAEJIN_TIMETABLE_PRD.version}\n`;
    md += `- **상태**: ${DAEJIN_TIMETABLE_PRD.status}\n`;
    md += `- **대상 학교**: ${DAEJIN_TIMETABLE_PRD.targetSchool}\n`;
    md += `- **참조 API**: ${DAEJIN_TIMETABLE_PRD.apiSource}\n`;
    md += `- **작성자**: ${DAEJIN_TIMETABLE_PRD.author}\n`;
    md += `- **최종 개정일**: ${DAEJIN_TIMETABLE_PRD.lastUpdated}\n\n`;
    md += `---\n\n`;

    DAEJIN_TIMETABLE_PRD.sections.forEach((sec) => {
      md += `## ${sec.number}. ${sec.title}\n\n`;
      md += `*요약: ${sec.summary}*\n\n`;
      md += `${sec.content}\n\n`;

      if (sec.tables && sec.tables.length > 0) {
        sec.tables.forEach((t) => {
          md += `### [표] ${t.caption}\n\n`;
          md += `| ${t.headers.join(' | ')} |\n`;
          md += `| ${t.headers.map(() => '---').join(' | ')} |\n`;
          t.rows.forEach((r) => {
            md += `| ${r.join(' | ')} |\n`;
          });
          md += `\n`;
        });
      }

      md += `---\n\n`;
    });

    return md;
  };

  const fullMarkdown = generateFullMarkdown();

  const handleCopy = () => {
    navigator.clipboard.writeText(fullMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `대진전자통신고_시간표_PRD_${DAEJIN_TIMETABLE_PRD.version}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                PRD (제품 기획서) 마크다운 전문 내보내기
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                {DAEJIN_TIMETABLE_PRD.title} ({DAEJIN_TIMETABLE_PRD.version})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료' : '전체 복사'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.md 파일 다운로드</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Markdown Body */}
        <div className="flex-1 overflow-auto p-6 bg-slate-950 text-slate-200 font-mono text-xs leading-relaxed selection:bg-sky-700 selection:text-white">
          <pre className="whitespace-pre-wrap">{fullMarkdown}</pre>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            총 길이: {fullMarkdown.length.toLocaleString()} 자 · GitHub 및 Notion에 바로 붙여넣을 수 있습니다.
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
