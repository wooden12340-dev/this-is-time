import React from 'react';
import { FileText, Calendar, Terminal, Info, Download, Bookmark } from 'lucide-react';
import { SavedClassSetting } from '../types/timetable';

interface HeaderProps {
  activeTab: 'timetable' | 'prd' | 'api' | 'school';
  setActiveTab: (tab: 'timetable' | 'prd' | 'api' | 'school') => void;
  onOpenExport: () => void;
  savedClass: SavedClassSetting | null;
  onQuickSelectSaved: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenExport,
  savedClass,
  onQuickSelectSaved,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('timetable')}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-sky-700 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-sky-800 transition-colors">
              DJ
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-sky-700 transition-colors block">
                대진전자통신고 시간표
              </span>
              <span className="text-xs text-slate-500 font-mono hidden sm:block">
                NEIS OpenAPI · 부산 C10-7150597
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timetable'
                ? 'bg-sky-50 text-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>시간표 서비스</span>
          </button>

          <button
            onClick={() => setActiveTab('prd')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'prd'
                ? 'bg-sky-50 text-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-sky-600" />
            <span>제품 기획서 (PRD)</span>
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap hidden md:flex ${
              activeTab === 'api'
                ? 'bg-sky-50 text-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Terminal className="w-4 h-4 text-sky-600" />
            <span>NEIS API 콘솔</span>
          </button>

          <button
            onClick={() => setActiveTab('school')}
            className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap hidden lg:flex ${
              activeTab === 'school'
                ? 'bg-sky-50 text-sky-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Info className="w-4 h-4 text-sky-600" />
            <span>학교 정보</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          {savedClass && (
            <button
              onClick={onQuickSelectSaved}
              title={`저장된 내 반 (${savedClass.grade}학년 ${savedClass.classNum}반)으로 즉시 이동`}
              className="px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200/70 transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
              <span className="hidden sm:inline">내 반:</span> {savedClass.grade}-{savedClass.classNum}
            </button>
          )}

          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PRD</span> 내보내기
          </button>
        </div>
      </div>
    </header>
  );
};
