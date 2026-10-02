import React, { useState } from 'react';
import {
  FileText,
  Search,
  CheckCircle2,
  Copy,
  Download,
  ExternalLink,
  ChevronRight,
  Database,
  Layers,
  Sparkles,
  Printer,
} from 'lucide-react';
import { DAEJIN_TIMETABLE_PRD } from '../data/prdContent';

interface PrdViewerProps {
  onOpenExport: () => void;
  onGoToApp: () => void;
  onGoToApi: () => void;
}

export const PrdViewer: React.FC<PrdViewerProps> = ({
  onOpenExport,
  onGoToApp,
  onGoToApi,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState(DAEJIN_TIMETABLE_PRD.sections[0].id);
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);

  // 검색 필터링
  const filteredSections = DAEJIN_TIMETABLE_PRD.sections.filter((sec) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      sec.title.toLowerCase().includes(q) ||
      sec.summary.toLowerCase().includes(q) ||
      sec.content.toLowerCase().includes(q)
    );
  });

  const handleCopySection = (sectionTitle: string, content: string, id: string) => {
    const text = `# ${sectionTitle}\n\n${content}`;
    navigator.clipboard.writeText(text);
    setCopiedSectionId(id);
    setTimeout(() => setCopiedSectionId(null), 2000);
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Top PRD Document Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 mb-8 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-2">
              <span className="font-semibold text-sky-700">문서번호: PRD-2026-DJ01</span>
              <span>·</span>
              <span>상태: 승인완료 (Approved)</span>
              <span>·</span>
              <span>버전: {DAEJIN_TIMETABLE_PRD.version}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-2">
              {DAEJIN_TIMETABLE_PRD.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl">
              {DAEJIN_TIMETABLE_PRD.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onGoToApp}
              className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>실제 시간표 구동</span>
            </button>
            <button
              onClick={onGoToApi}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3.5 h-3.5" />
              <span>API 파라미터 검증</span>
            </button>
            <button
              onClick={onOpenExport}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>전체 PRD 마크다운 다운로드</span>
            </button>
          </div>
        </div>

        {/* PRD Metadata Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 text-xs text-slate-600">
          <div>
            <span className="block text-slate-400 font-medium mb-1">대상 학교</span>
            <span className="font-semibold text-slate-800">대진전자통신고 (부산 C10-7150597)</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium mb-1">기준 오픈데이터 API</span>
            <span className="font-semibold text-slate-800">NEIS hisTimetable (OPEN18620200826103326268120)</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium mb-1">작성자 / 부서</span>
            <span className="font-semibold text-slate-800">{DAEJIN_TIMETABLE_PRD.author}</span>
          </div>
          <div>
            <span className="block text-slate-400 font-medium mb-1">최종 개정일자</span>
            <span className="font-semibold text-slate-800 font-mono">{DAEJIN_TIMETABLE_PRD.lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content: Left Sticky TOC / Right PRD Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Navigation Column */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="PRD 문서 내 키워드 검색 (예: hisTimetable, 실습실)..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>

          {/* Table of Contents */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                문서 목차 (Table of Contents)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {filteredSections.length}개 챕터
              </span>
            </div>

            <nav className="space-y-1">
              {filteredSections.map((sec) => (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3 py-2 text-xs rounded-lg transition-colors flex items-center justify-between group ${
                    activeSectionId === sec.id
                      ? 'bg-sky-50 text-sky-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-slate-400 group-hover:text-slate-600">
                      {sec.number}.
                    </span>
                    <span className="truncate">{sec.title.split('(')[0]}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                      activeSectionId === sec.id
                        ? 'text-sky-600 translate-x-0.5'
                        : 'text-slate-300 group-hover:text-slate-400'
                    }`}
                  />
                </button>
              ))}
            </nav>

            {/* Quick Reference Box */}
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-4 -mb-4 p-4 rounded-b-xl text-xs space-y-2">
              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>핵심 파라미터 요약</span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                부산교육청(<code className="font-mono text-slate-700 bg-white px-1 py-0.5 border border-slate-200 rounded">C10</code>), 대진전자통신고(
                <code className="font-mono text-slate-700 bg-white px-1 py-0.5 border border-slate-200 rounded">7150597</code>), 엔드포인트(
                <code className="font-mono text-slate-700 bg-white px-1 py-0.5 border border-slate-200 rounded">hisTimetable</code>)
              </p>
            </div>
          </div>
        </div>

        {/* Right Content Column: PRD Sections */}
        <div className="lg:col-span-8 space-y-8">
          {filteredSections.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs scroll-mt-24"
            >
              {/* Section Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <div className="text-xs font-mono text-sky-600 font-semibold mb-1">
                    SECTION {sec.number}
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                    {sec.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    {sec.summary}
                  </p>
                </div>
                <button
                  onClick={() => handleCopySection(sec.title, sec.content, sec.id)}
                  className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1 shrink-0"
                  title="섹션 내용 복사"
                >
                  {copiedSectionId === sec.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-medium">복사됨</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>복사</span>
                    </>
                  )}
                </button>
              </div>

              {/* Section Content */}
              <div className="prose prose-slate prose-sm sm:prose-base max-w-none leading-relaxed text-slate-700 whitespace-pre-line">
                {sec.content}
              </div>

              {/* Section Tables */}
              {sec.tables && sec.tables.length > 0 && (
                <div className="mt-6 space-y-6">
                  {sec.tables.map((table, tIdx) => (
                    <div key={tIdx} className="overflow-hidden border border-slate-200 rounded-lg">
                      <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-semibold text-slate-700 flex items-center justify-between">
                        <span>{table.caption}</span>
                        <span className="text-slate-400 font-normal">{table.rows.length}개 항목</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs sm:text-sm">
                          <thead className="bg-slate-50/50 text-slate-600 border-b border-slate-200 font-medium">
                            <tr>
                              {table.headers.map((h, hIdx) => (
                                <th key={hIdx} className="px-4 py-2.5 font-semibold text-slate-800">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {table.rows.map((row, rIdx) => (
                              <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`px-4 py-2.5 ${
                                      cIdx === 0
                                        ? 'font-medium text-slate-900 font-mono text-xs'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          {/* PRD End Action Banner */}
          <div className="bg-gradient-to-r from-sky-900 to-slate-900 text-white rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs uppercase tracking-wider text-sky-300 font-semibold block mb-1">
                대진전자통신고 시간표 플랫폼
              </span>
              <h3 className="text-lg sm:text-xl font-bold">
                본 PRD를 바탕으로 구축된 실제 시간표 서비스를 체험해보세요
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                부산교육청(C10) 및 대진전자통신고(7150597) 실시간 NEIS OpenAPI 연동 지원
              </p>
            </div>
            <button
              onClick={onGoToApp}
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              시간표 앱 실행하기 →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
