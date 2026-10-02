import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Bookmark,
  Share2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Edit3,
  Check,
  RefreshCw,
  AlertCircle,
  Sparkles,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';
import {
  DAEJIN_DEPARTMENTS,
  DAEJIN_SCHOOL_INFO,
  MealInfo,
  PERIOD_SLOTS,
  SavedClassSetting,
  TimetableItem,
  getDepartment,
  getDepartmentsForGrade,
} from '../types/timetable';
import {
  fetchNeisMeal,
  fetchNeisTimetable,
  formatDate,
  formatKoreanDate,
  getCurrentPeriodStatus,
  getFallbackTimetable,
  getWeekDates,
} from '../services/neisService';

interface TimetableAppProps {
  savedClass: SavedClassSetting | null;
  onSaveClass: (setting: SavedClassSetting) => void;
  onOpenPrd: () => void;
}

export const TimetableApp: React.FC<TimetableAppProps> = ({
  savedClass,
  onSaveClass,
  onOpenPrd,
}) => {
  // 상태 관리
  const [selectedGrade, setSelectedGrade] = useState<number>(savedClass?.grade || 2);
  const [selectedClass, setSelectedClass] = useState<number>(savedClass?.classNum || 2);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatDate(new Date()));
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');

  // 데이터 상태
  const [dailyItems, setDailyItems] = useState<TimetableItem[]>([]);
  const [weeklyData, setWeeklyData] = useState<{ [dateStr: string]: TimetableItem[] }>({});
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'NEIS_API' | 'LOCAL_FALLBACK'>('NEIS_API');
  const [statusMessage, setStatusMessage] = useState<string>('');

  // 급식 상태
  const [mealInfo, setMealInfo] = useState<MealInfo | null>(null);
  const [showMeal, setShowMeal] = useState<boolean>(true);

  // 실시간 교시 상태
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [currentPeriodStatus, setCurrentPeriodStatus] = useState(() => getCurrentPeriodStatus(new Date()));

  // 개인 메모 상태 (localStorage: daejin_memos_{grade}_{class})
  const [memos, setMemos] = useState<{ [key: string]: string }>({});
  const [editingPeriod, setEditingPeriod] = useState<number | null>(null);
  const [tempMemoText, setTempMemoText] = useState('');
  const [copyToast, setCopyToast] = useState(false);

  // 현재 학과 추론 (3학년 4~5반: 컴퓨터소프트웨어과, 1·2학년 4~5반: AI소프트웨어과)
  const currentDept = getDepartment(selectedGrade, selectedClass);
  const departmentsForGrade = getDepartmentsForGrade(selectedGrade);

  // 실시간 시계 타이머 (1초 간격 갱신)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setCurrentPeriodStatus(getCurrentPeriodStatus(now));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 메모 로드
  useEffect(() => {
    try {
      const key = `daejin_memos_${selectedGrade}_${selectedClass}_${selectedDate}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        setMemos(JSON.parse(saved));
      } else {
        setMemos({});
      }
    } catch {
      setMemos({});
    }
  }, [selectedGrade, selectedClass, selectedDate]);

  // 시간표 데이터 로드 (일간)
  useEffect(() => {
    let isMounted = true;
    async function loadDaily() {
      setIsLoading(true);
      try {
        const result = await fetchNeisTimetable({
          grade: selectedGrade,
          classNum: selectedClass,
          dateStr: selectedDate,
        });
        if (isMounted) {
          setDailyItems(result.items);
          setDataSource(result.source);
          setStatusMessage(result.message);
        }
      } catch (err) {
        if (isMounted) {
          const fallback = getFallbackTimetable(selectedGrade, selectedClass, selectedDate);
          setDailyItems(fallback);
          setDataSource('LOCAL_FALLBACK');
          setStatusMessage('대진전자통신고 표준 시간표가 로드되었습니다.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadDaily();
    return () => {
      isMounted = false;
    };
  }, [selectedGrade, selectedClass, selectedDate]);

  // 주간 데이터 로드 (주간 모드일 때)
  useEffect(() => {
    if (viewMode !== 'weekly') return;

    const y = parseInt(selectedDate.slice(0, 4), 10);
    const m = parseInt(selectedDate.slice(4, 6), 10) - 1;
    const d = parseInt(selectedDate.slice(6, 8), 10);
    const weekDates = getWeekDates(new Date(y, m, d));

    async function loadWeekly() {
      const map: { [dateStr: string]: TimetableItem[] } = {};
      for (const w of weekDates) {
        const res = await fetchNeisTimetable({
          grade: selectedGrade,
          classNum: selectedClass,
          dateStr: w.dateStr,
        });
        map[w.dateStr] = res.items;
      }
      setWeeklyData(map);
    }

    loadWeekly();
  }, [viewMode, selectedGrade, selectedClass, selectedDate]);

  // 급식 데이터 로드
  useEffect(() => {
    async function loadMeal() {
      const m = await fetchNeisMeal(selectedDate);
      setMealInfo(m);
    }
    loadMeal();
  }, [selectedDate]);

  // 날짜 이동 핸들러
  const handleShiftDate = (days: number) => {
    const y = parseInt(selectedDate.slice(0, 4), 10);
    const m = parseInt(selectedDate.slice(4, 6), 10) - 1;
    const d = parseInt(selectedDate.slice(6, 8), 10);
    const target = new Date(y, m, d + days);
    setSelectedDate(formatDate(target));
  };

  const handleSetToday = () => {
    setSelectedDate(formatDate(new Date()));
  };

  const handleSetTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(formatDate(tomorrow));
  };

  // 내 학급 저장
  const handleBookmarkClass = () => {
    onSaveClass({
      grade: selectedGrade,
      classNum: selectedClass,
      departmentId: currentDept.id,
      saveDate: new Date().toISOString(),
    });
  };

  const isCurrentSaved =
    savedClass && savedClass.grade === selectedGrade && savedClass.classNum === selectedClass;

  // 메모 저장
  const handleSaveMemo = (period: number) => {
    const key = `daejin_memos_${selectedGrade}_${selectedClass}_${selectedDate}`;
    const next = { ...memos, [period]: tempMemoText.trim() };
    setMemos(next);
    localStorage.setItem(key, JSON.stringify(next));
    setEditingPeriod(null);
    setTempMemoText('');
  };

  // 시간표 텍스트 복사 (카카오톡/단톡방 공유용)
  const handleShareTimetable = () => {
    const lines = [
      `[대진전자통신고등학교 ${selectedGrade}학년 ${selectedClass}반 (${currentDept.name})]`,
      `📅 ${formatKoreanDate(selectedDate)} 시간표`,
      '--------------------------------',
      ...dailyItems.map(
        (it) => `${it.period}교시: ${it.subject} (${it.classroom || '교실'})${memos[it.period] ? ` [준비: ${memos[it.period]}]` : ''}`
      ),
      '--------------------------------',
      '대진전자통신고 스마트 시간표 서비스',
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setCopyToast(true);
    setTimeout(() => setCopyToast(false), 2500);
  };

  const weekList = getWeekDates(
    new Date(
      parseInt(selectedDate.slice(0, 4), 10),
      parseInt(selectedDate.slice(4, 6), 10) - 1,
      parseInt(selectedDate.slice(6, 8), 10)
    )
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* School Top Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center font-bold text-lg shadow-xs shrink-0">
            DJ
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>{DAEJIN_SCHOOL_INFO.schoolName}</span>
              <span>·</span>
              <span>{DAEJIN_SCHOOL_INFO.officeName}</span>
              <span>·</span>
              <span className="text-sky-700 font-semibold">{currentDept.name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-0.5">
              {selectedGrade}학년 {selectedClass}반 시간표
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentDept.description} (실습실 이동 수업 전 교시 확인 필수)
            </p>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBookmarkClass}
            className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              isCurrentSaved
                ? 'bg-amber-50 text-amber-800 border border-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bookmark
              className={`w-3.5 h-3.5 ${
                isCurrentSaved ? 'fill-amber-500 text-amber-600' : 'text-slate-500'
              }`}
            />
            <span>{isCurrentSaved ? '내 반으로 등록됨' : '이 반을 내 반으로 저장'}</span>
          </button>

          <button
            onClick={handleShareTimetable}
            className="px-3 py-2 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
            title="오늘 시간표 텍스트 복사"
          >
            {copyToast ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">복사 완료!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-500" />
                <span>시간표 공유</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenPrd}
            className="px-3 py-2 text-xs font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>기획서 (PRD) 보기</span>
          </button>
        </div>
      </div>

      {/* Control Panel: Grade/Class Selector & Date Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Grade & Department/Class Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Grade Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              학년 선택:
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {[1, 2, 3].map((g) => (
                <button
                  key={g}
                  onClick={() => setSelectedGrade(g)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                    selectedGrade === g
                      ? 'bg-white text-sky-800 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'daily'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              일간 타임라인
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              주간 매트릭스 (월~금)
            </button>
          </div>
        </div>

        {/* 4 Official Departments Tabs */}
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            대진전자통신고 {selectedGrade}학년 학과:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {departmentsForGrade.map((dept) => {
              const isDeptActive = dept.classes.includes(selectedClass);
              return (
                <button
                  key={dept.id}
                  onClick={() => setSelectedClass(dept.classes[0])}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    isDeptActive
                      ? 'border-sky-600 bg-sky-50/80 shadow-xs ring-1 ring-sky-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {dept.name}
                    </span>
                    <span className="text-[10px] text-sky-700 font-mono font-medium bg-sky-100/60 px-1.5 py-0.5 rounded">
                      {dept.classes[0]}~{dept.classes[dept.classes.length - 1]}반
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 truncate mt-1">
                    {dept.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Class Selection Buttons (1~10반 with department affiliation) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              학급(반) 선택 (1~10반):
            </span>
            <span className="text-xs text-slate-500">
              현재: <strong className="text-sky-800 font-bold">{currentDept.name}</strong> ({selectedGrade}학년 {selectedClass}반)
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
              const dept = getDepartment(selectedGrade, c);
              const isSelected = selectedClass === c;
              return (
                <button
                  key={c}
                  onClick={() => setSelectedClass(c)}
                  className={`p-2 rounded-lg border text-left transition-all relative ${
                    isSelected
                      ? 'border-sky-600 bg-sky-50/80 ring-2 ring-sky-500/30 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-bold ${
                        isSelected ? 'text-sky-900' : 'text-slate-800'
                      }`}
                    >
                      {c}반
                    </span>
                    {savedClass &&
                      savedClass.grade === selectedGrade &&
                      savedClass.classNum === c && (
                        <Bookmark className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate mt-0.5 font-medium">
                    {dept.name.replace('과', '')}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Selector Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShiftDate(-1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="이전 날짜"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span className="text-sm font-semibold text-slate-800 font-mono">
                {formatKoreanDate(selectedDate)}
              </span>
            </div>
            <button
              onClick={() => handleShiftDate(1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
              title="다음 날짜"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSetToday}
              className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                selectedDate === formatDate(new Date())
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              오늘
            </button>
            <button
              onClick={handleSetTomorrow}
              className="px-2.5 py-1 text-xs rounded-md font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              내일
            </button>
            <input
              type="date"
              value={`${selectedDate.slice(0, 4)}-${selectedDate.slice(4, 6)}-${selectedDate.slice(6, 8)}`}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value.replace(/-/g, ''));
                }
              }}
              className="text-xs bg-slate-100 border border-slate-200 rounded-md px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Real-time Current Period Live Tracker Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white rounded-xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-sky-300 font-mono">
                <span>현재 시각 {currentTime.toLocaleTimeString('ko-KR')}</span>
                <span>·</span>
                <span>대진전자통신고 벨소리 타임라인</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-0.5 text-white">
                {currentPeriodStatus.label}
              </h2>
              <p className="text-xs text-slate-300 mt-1">
                다음 일정:{' '}
                <strong className="text-sky-200">{currentPeriodStatus.nextPeriodLabel}</strong>
                {currentPeriodStatus.minutesRemaining > 0 && (
                  <span className="ml-2 font-mono text-amber-300">
                    ({currentPeriodStatus.minutesRemaining}분 남음)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-white/10 px-3 py-2 rounded-lg border border-white/10 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-200 font-mono">
              {dataSource === 'NEIS_API' ? 'NEIS 실시간 연동 중' : '예비 커리큘럼 모드'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Timetable Content: Daily Timeline vs Weekly Matrix */}
      {viewMode === 'daily' ? (
        <div className="space-y-4">
          {/* Daily Status Banner */}
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              {statusMessage || '대진전자통신고 실시간 시간표 조회 완료'}
            </span>
            <span className="font-mono">
              총 {dailyItems.length}교시 편성
            </span>
          </div>

          {/* Daily Timetable Period Cards List */}
          <div className="space-y-3">
            {dailyItems.map((item) => {
              const isCurrent =
                currentPeriodStatus.period === item.period && !currentPeriodStatus.isBreak;
              const hasMemo = Boolean(memos[item.period]);

              return (
                <div
                  key={item.period}
                  className={`bg-white border rounded-xl p-4 sm:p-5 transition-all shadow-xs relative ${
                    isCurrent
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Period and Subject Info */}
                    <div className="flex items-start sm:items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold text-sm ${
                          isCurrent
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        <span className="text-xs font-semibold">
                          {item.period}
                        </span>
                        <span className="text-[10px] font-normal opacity-80">
                          교시
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                          <span>
                            {item.startTime} ~ {item.endTime}
                          </span>
                          <span>·</span>
                          <span
                            className={`font-semibold ${
                              item.category === '전공실습'
                                ? 'text-emerald-700'
                                : item.category === '전공이론'
                                ? 'text-sky-700'
                                : 'text-slate-600'
                            }`}
                          >
                            {item.category || '일반교과'}
                          </span>
                          {isCurrent && (
                            <>
                              <span>·</span>
                              <span className="text-sky-600 font-bold animate-pulse">
                                ● 지금 수업 중
                              </span>
                            </>
                          )}
                        </div>

                        <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-0.5">
                          {item.subject}
                        </h3>

                        <div className="flex items-center gap-1.5 text-xs text-slate-600 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.classroom || '해당 학급 교실'}</span>
                          {item.teacher && (
                            <>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">{item.teacher} 선생님</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Memo & Action trigger */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {editingPeriod === item.period ? (
                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            value={tempMemoText}
                            onChange={(e) => setTempMemoText(e.target.value)}
                            placeholder="준비물/메모 입력 (예: 멀티미터 지참)"
                            className="text-xs border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-sky-500 w-48 sm:w-60"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveMemo(item.period);
                            }}
                          />
                          <button
                            onClick={() => handleSaveMemo(item.period)}
                            className="px-2.5 py-1.5 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingPeriod(null)}
                            className="px-2 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                          >
                            취소
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingPeriod(item.period);
                            setTempMemoText(memos[item.period] || '');
                          }}
                          className={`px-3 py-1.5 text-xs rounded-lg border transition-colors flex items-center gap-1.5 ${
                            hasMemo
                              ? 'bg-amber-50/70 border-amber-200 text-amber-900 font-medium'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                          <span>
                            {hasMemo ? `메모: ${memos[item.period]}` : '+ 준비물/메모 등록'}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Weekly Timetable Matrix Grid */
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {selectedGrade}학년 {selectedClass}반 주간 시간표 매트릭스
              </h2>
              <p className="text-xs text-slate-500">
                월요일부터 금요일까지 1~7교시 전체 일정
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>전공실습</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                <span>전공이론</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <span>일반교과</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                  <th className="p-3 w-16 text-center font-bold">교시</th>
                  {weekList.map((w) => (
                    <th
                      key={w.dateStr}
                      className={`p-3 text-center font-semibold ${
                        w.isToday ? 'bg-sky-100/70 text-sky-900 font-bold' : ''
                      }`}
                    >
                      <div>
                        {w.dayName}요일{' '}
                        {w.isToday && (
                          <span className="text-[10px] text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-300">
                            오늘
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 font-normal">
                        {w.displayStr}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[1, 2, 3, 4, 5, 6, 7].map((periodNum) => {
                  const slot = PERIOD_SLOTS.find((s) => s.period === periodNum);
                  return (
                    <tr key={periodNum} className="hover:bg-slate-50/50">
                      <td className="p-3 text-center font-bold text-slate-700 bg-slate-50/80 border-r border-slate-200">
                        <div>{periodNum}교시</div>
                        <div className="text-[10px] text-slate-400 font-mono font-normal">
                          {slot?.startTime}
                        </div>
                      </td>

                      {weekList.map((w) => {
                        const daySchedule = weeklyData[w.dateStr] || [];
                        const item = daySchedule.find((it) => it.period === periodNum);
                        const isPractice = item?.category === '전공실습';

                        return (
                          <td
                            key={w.dateStr}
                            className={`p-2.5 border-r border-slate-100 align-top ${
                              w.isToday ? 'bg-sky-50/30' : ''
                            }`}
                          >
                            {item ? (
                              <div
                                className={`p-2 rounded-lg border text-left ${
                                  isPractice
                                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                    : item.category === '전공이론'
                                    ? 'bg-sky-50/60 border-sky-200 text-sky-900'
                                    : 'bg-white border-slate-200 text-slate-800'
                                }`}
                              >
                                <div className="font-bold text-xs truncate">
                                  {item.subject}
                                </div>
                                <div className="text-[10px] text-slate-500 truncate mt-0.5">
                                  {item.classroom || '교실'}
                                </div>
                              </div>
                            ) : (
                              <div className="text-slate-300 text-center py-2">-</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bonus Feature: NEIS School Lunch Menu Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-amber-600" />
            <h2 className="text-sm font-bold text-slate-900">
              오늘 대진전자통신고 급식 식단 (NEIS 연동)
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              {formatKoreanDate(selectedDate)}
            </span>
          </div>
          <button
            onClick={() => setShowMeal(!showMeal)}
            className="text-xs text-slate-500 hover:text-slate-800 underline"
          >
            {showMeal ? '접기' : '펼치기'}
          </button>
        </div>

        {showMeal && mealInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-2">
                {mealInfo.dishName.map((dish, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-amber-50/70 border border-amber-200/80 rounded-lg text-xs font-medium text-amber-900"
                  >
                    {dish}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-xs text-slate-500 space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
              <div>
                칼로리: <strong className="text-slate-800">{mealInfo.calorie}</strong>
              </div>
              <div className="text-[11px] text-slate-400 leading-relaxed">
                원산지: {mealInfo.origin}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
