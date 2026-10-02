import React from 'react';
import {
  Building2,
  MapPin,
  Phone,
  Globe,
  Award,
  BookOpen,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { DAEJIN_DEPARTMENTS, DAEJIN_SCHOOL_INFO } from '../types/timetable';

export const SchoolView: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Hero School Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-700 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
              DJ
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 font-mono mb-1">
                <span>{DAEJIN_SCHOOL_INFO.officeName}</span>
                <span>·</span>
                <span>{DAEJIN_SCHOOL_INFO.schoolCategory}</span>
                <span>·</span>
                <span>설립 1995년</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {DAEJIN_SCHOOL_INFO.schoolName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                {DAEJIN_SCHOOL_INFO.schoolEnglishName}
              </p>
            </div>
          </div>

          <a
            href={DAEJIN_SCHOOL_INFO.homepage}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5 self-start md:self-center"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>학교 공식 홈페이지 방문</span>
            <ExternalLink className="w-3 h-3 text-sky-500" />
          </a>
        </div>

        {/* School Specs Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">나이스 표준 식별코드</span>
            <span className="font-mono font-bold text-slate-800 text-sm">
              C10 · 7150597
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              부산시교육청 / 대진전자통신고
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">학교 위치 및 주소</span>
            <div className="flex items-start gap-1 font-medium text-slate-800">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{DAEJIN_SCHOOL_INFO.address}</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              금정구 장전동 (부산대역·장전역 인근)
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">연락처 및 팩스</span>
            <div className="font-mono text-slate-800">
              TEL: {DAEJIN_SCHOOL_INFO.tel}
            </div>
            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
              FAX: 051-582-8120
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100">
            <span className="text-slate-400 block mb-1">학교 유형 / 구분</span>
            <div className="font-semibold text-slate-800">
              {DAEJIN_SCHOOL_INFO.schoolCategory} (남여공학)
            </div>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              전기 / 주간 / 사립고등학교
            </span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-600" />
          <span>대진전자통신고등학교 학과 구성 및 실습 환경</span>
        </h2>
        <p className="text-xs text-slate-500">
          특성화고 전문교과 특성에 맞추어 학과별 시간표 및 전공 실습실 이동 수업이 운영됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {DAEJIN_DEPARTMENTS.map((dept) => (
            <div
              key={dept.id}
              className="border border-slate-200 rounded-xl p-4 hover:border-sky-300 transition-colors bg-slate-50/50"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-slate-900 text-sm">{dept.name}</h3>
                <span className="text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-medium">
                  {dept.classes.map((c) => `${c}반`).join(', ')}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {dept.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
