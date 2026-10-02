import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimetableApp } from './components/TimetableApp';
import { PrdViewer } from './components/PrdViewer';
import { ApiConsole } from './components/ApiConsole';
import { SchoolView } from './components/SchoolModal';
import { PrdExportModal } from './components/PrdExportModal';
import { SavedClassSetting, DAEJIN_SCHOOL_INFO } from './types/timetable';

export default function App() {
  const [activeTab, setActiveTab] = useState<'timetable' | 'prd' | 'api' | 'school'>('timetable');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [savedClass, setSavedClass] = useState<SavedClassSetting | null>(null);

  // 로컬스토리지에서 내 학급 설정 불러오기
  useEffect(() => {
    try {
      const stored = localStorage.getItem('daejin_saved_class');
      if (stored) {
        setSavedClass(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveClass = (setting: SavedClassSetting) => {
    setSavedClass(setting);
    localStorage.setItem('daejin_saved_class', JSON.stringify(setting));
  };

  const handleQuickSelectSaved = () => {
    setActiveTab('timetable');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-sky-100 selection:text-sky-900">
      {/* 3-Zone Header Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenExport={() => setIsExportOpen(true)}
        savedClass={savedClass}
        onQuickSelectSaved={handleQuickSelectSaved}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {activeTab === 'timetable' && (
          <TimetableApp
            savedClass={savedClass}
            onSaveClass={handleSaveClass}
            onOpenPrd={() => setActiveTab('prd')}
          />
        )}

        {activeTab === 'prd' && (
          <PrdViewer
            onOpenExport={() => setIsExportOpen(true)}
            onGoToApp={() => setActiveTab('timetable')}
            onGoToApi={() => setActiveTab('api')}
          />
        )}

        {activeTab === 'api' && <ApiConsole />}

        {activeTab === 'school' && <SchoolView />}
      </main>

      {/* PRD Export Modal */}
      <PrdExportModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />

      {/* Quiet, Clean Footer adhering to Anti-Slop Guidelines */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-3 text-center sm:text-left">
            <span className="font-semibold text-slate-800">
              {DAEJIN_SCHOOL_INFO.schoolName}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>부산광역시 금정구 수림로 92</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span>교무실: {DAEJIN_SCHOOL_INFO.tel}</span>
          </div>

          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>교육부 나이스(NEIS) 교육정보 개방포털 OpenAPI 연동</span>
            <span aria-hidden="true">·</span>
            <span>hisTimetable (OPEN18620200826103326268120)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
