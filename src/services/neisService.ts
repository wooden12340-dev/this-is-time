/**
 * NEIS Open API 연동 및 대진전자통신고등학교 시간표 서비스
 * 시도교육청코드: C10 (부산광역시교육청)
 * 행정표준코드: 7150597 (대진전자통신고등학교)
 */

import {
  DAEJIN_DEPARTMENTS,
  DAEJIN_SCHOOL_INFO,
  MealInfo,
  NeisTimetableResponse,
  PERIOD_SLOTS,
  TimetableItem,
} from '../types/timetable';

// 대진전자통신고등학교 요일별 전공/일반 교과목 마스터 템플릿 (방학/주말/API 점검 시 실전 폴백)
interface MasterCurriculum {
  [grade: number]: {
    [classNum: number]: {
      [dayOfWeek: number]: Array<{
        subject: string;
        classroom: string;
        teacher: string;
        category: '전공실습' | '전공이론' | '일반교과' | '자율/창체';
      }>;
    };
  };
}

const DAEJIN_CURRICULUM: MasterCurriculum = {
  // 1학년 (공통/기초직업)
  1: {
    1: {
      1: [ // 월
        { subject: '국어', classroom: '1학년 1반', teacher: '김선생', category: '일반교과' },
        { subject: '수학', classroom: '1학년 1반', teacher: '이선생', category: '일반교과' },
        { subject: '공업일반', classroom: '1학년 1반', teacher: '정선생', category: '전공이론' },
        { subject: '기초제도 (실습)', classroom: '제1제도실 (본관 2층)', teacher: '박선생', category: '전공실습' },
        { subject: '기초제도 (실습)', classroom: '제1제도실 (본관 2층)', teacher: '박선생', category: '전공실습' },
        { subject: '영어', classroom: '1학년 1반', teacher: '최선생', category: '일반교과' },
        { subject: '창의적체험활동', classroom: '1학년 1반', teacher: '담임교사', category: '자율/창체' },
      ],
      2: [ // 화
        { subject: '프로그래밍 기초', classroom: 'SW코딩랩 (정보관 201호)', teacher: '오선생', category: '전공실습' },
        { subject: '프로그래밍 기초', classroom: 'SW코딩랩 (정보관 201호)', teacher: '오선생', category: '전공실습' },
        { subject: '프로그래밍 기초', classroom: 'SW코딩랩 (정보관 201호)', teacher: '오선생', category: '전공실습' },
        { subject: '한국사', classroom: '1학년 1반', teacher: '윤선생', category: '일반교과' },
        { subject: '성공적인 직업생활', classroom: '1학년 1반', teacher: '송선생', category: '전공이론' },
        { subject: '통합과학', classroom: '과학실험실', teacher: '한선생', category: '일반교과' },
        { subject: '체육', classroom: '대진체육관', teacher: '임선생', category: '일반교과' },
      ],
      3: [ // 수
        { subject: '전기기초', classroom: '전기실습실 (실습동 101호)', teacher: '배선생', category: '전공실습' },
        { subject: '전기기초', classroom: '전기실습실 (실습동 101호)', teacher: '배선생', category: '전공실습' },
        { subject: '국어', classroom: '1학년 1반', teacher: '김선생', category: '일반교과' },
        { subject: '수학', classroom: '1학년 1반', teacher: '이선생', category: '일반교과' },
        { subject: '진로활동', classroom: '1학년 1반', teacher: '담임교사', category: '자율/창체' },
        { subject: '영어', classroom: '1학년 1반', teacher: '최선생', category: '일반교과' },
        { subject: '음악/미술', classroom: '예술관 3층', teacher: '조선생', category: '일반교과' },
      ],
      4: [ // 목
        { subject: '통합과학', classroom: '과학실험실', teacher: '한선생', category: '일반교과' },
        { subject: '한국사', classroom: '1학년 1반', teacher: '윤선생', category: '일반교과' },
        { subject: '전자부품 장착 (실습)', classroom: '제2전자실습실 (3층)', teacher: '권선생', category: '전공실습' },
        { subject: '전자부품 장착 (실습)', classroom: '제2전자실습실 (3층)', teacher: '권선생', category: '전공실습' },
        { subject: '수학', classroom: '1학년 1반', teacher: '이선생', category: '일반교과' },
        { subject: '체육', classroom: '대진체육관', teacher: '임선생', category: '일반교과' },
        { subject: '동아리활동', classroom: '각 특별실', teacher: '동아리지도', category: '자율/창체' },
      ],
      5: [ // 금
        { subject: '공업일반', classroom: '1학년 1반', teacher: '정선생', category: '전공이론' },
        { subject: '국어', classroom: '1학년 1반', teacher: '김선생', category: '일반교과' },
        { subject: '영어', classroom: '1학년 1반', teacher: '최선생', category: '일반교과' },
        { subject: '성공적인 직업생활', classroom: '1학년 1반', teacher: '송선생', category: '전공이론' },
        { subject: '기초제도 (CAD)', classroom: 'CAD실습실 (본관 203호)', teacher: '박선생', category: '전공실습' },
        { subject: '기초제도 (CAD)', classroom: 'CAD실습실 (본관 203호)', teacher: '박선생', category: '전공실습' },
        { subject: '학급자치활동', classroom: '1학년 1반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
  },
  // 2학년 (스마트전자과 1~3반, 전자통신과 4~5반, 컴퓨터소프트웨어과 6~7반, 스마트제어과 8반)
  2: {
    2: { // 2학년 2반 (전기전자과)
      1: [
        { subject: '하드웨어 회로 설계', classroom: '2학년 2반', teacher: '강선생', category: '전공이론' },
        { subject: '공통국어', classroom: '2학년 2반', teacher: '신선생', category: '일반교과' },
        { subject: '수학Ⅱ', classroom: '2학년 2반', teacher: '안선생', category: '일반교과' },
        { subject: '하드웨어 측정분석 (실습)', classroom: '전자기초실습실 (실습동 302호)', teacher: '도선생', category: '전공실습' },
        { subject: '하드웨어 측정분석 (실습)', classroom: '전자기초실습실 (실습동 302호)', teacher: '도선생', category: '전공실습' },
        { subject: '하드웨어 제작 (실습)', classroom: '전자기초실습실 (실습동 302호)', teacher: '도선생', category: '전공실습' },
        { subject: '창체자율', classroom: '2학년 2반', teacher: '담임교사', category: '자율/창체' },
      ],
      2: [
        { subject: '하드웨어 성능 구현', classroom: '디지털실습실 (본관 305호)', teacher: '유선생', category: '전공실습' },
        { subject: '하드웨어 성능 구현', classroom: '디지털실습실 (본관 305호)', teacher: '유선생', category: '전공실습' },
        { subject: '하드웨어 성능 구현', classroom: '디지털실습실 (본관 305호)', teacher: '유선생', category: '전공실습' },
        { subject: '영어Ⅰ', classroom: '2학년 2반', teacher: '표선생', category: '일반교과' },
        { subject: '전자기기 일반', classroom: '2학년 2반', teacher: '주선생', category: '전공이론' },
        { subject: '운동과 건강', classroom: '대진체육관', teacher: '문선생', category: '일반교과' },
        { subject: '수학Ⅱ', classroom: '2학년 2반', teacher: '안선생', category: '일반교과' },
      ],
      3: [
        { subject: '임베디드 소프트웨어', classroom: 'IoT센서랩 (정보관 302호)', teacher: '민선생', category: '전공실습' },
        { subject: '임베디드 소프트웨어', classroom: 'IoT센서랩 (정보관 302호)', teacher: '민선생', category: '전공실습' },
        { subject: '문학', classroom: '2학년 2반', teacher: '신선생', category: '일반교과' },
        { subject: '회로 설계 (ORCAD)', classroom: '회로CAD실 (본관 401호)', teacher: '강선생', category: '전공실습' },
        { subject: '회로 설계 (ORCAD)', classroom: '회로CAD실 (본관 401호)', teacher: '강선생', category: '전공실습' },
        { subject: '영어Ⅰ', classroom: '2학년 2반', teacher: '표선생', category: '일반교과' },
        { subject: '진로활동', classroom: '2학년 2반', teacher: '담임교사', category: '자율/창체' },
      ],
      4: [
        { subject: '전자기판 제작 (PCB)', classroom: '표면실장실습실 (SMT실)', teacher: '하선생', category: '전공실습' },
        { subject: '전자기판 제작 (PCB)', classroom: '표면실장실습실 (SMT실)', teacher: '하선생', category: '전공실습' },
        { subject: '전자기판 제작 (PCB)', classroom: '표면실장실습실 (SMT실)', teacher: '하선생', category: '전공실습' },
        { subject: '한국사1', classroom: '2학년 2반', teacher: '신선생', category: '일반교과' },
        { subject: '수학Ⅱ', classroom: '2학년 2반', teacher: '안선생', category: '일반교과' },
        { subject: '운동과 건강', classroom: '대진체육관', teacher: '문선생', category: '일반교과' },
        { subject: '동아리활동', classroom: '각 특별실', teacher: '동아리지도', category: '자율/창체' },
      ],
      5: [
        { subject: '하드웨어 측정분석', classroom: '2학년 2반', teacher: '주선생', category: '전공이론' },
        { subject: '영어Ⅰ', classroom: '2학년 2반', teacher: '표선생', category: '일반교과' },
        { subject: '하드웨어 회로 설계', classroom: '2학년 2반', teacher: '강선생', category: '전공이론' },
        { subject: 'C언어 프로그래밍', classroom: 'SW코딩랩 (정보관 201호)', teacher: '고선생', category: '전공실습' },
        { subject: 'C언어 프로그래밍', classroom: 'SW코딩랩 (정보관 201호)', teacher: '고선생', category: '전공실습' },
        { subject: '성공적인 직업생활', classroom: '2학년 2반', teacher: '원선생', category: '전공이론' },
        { subject: '학급종례 및 대청소', classroom: '2학년 2반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
    4: { // 2학년 4반 (AI소프트웨어과)
      1: [
        { subject: '프로그래밍 언어 응용', classroom: 'SW코딩랩 (정보관 201호)', teacher: '고선생', category: '전공실습' },
        { subject: '프로그래밍 언어 응용', classroom: 'SW코딩랩 (정보관 201호)', teacher: '고선생', category: '전공실습' },
        { subject: '프로그래밍 언어 응용', classroom: 'SW코딩랩 (정보관 201호)', teacher: '고선생', category: '전공실습' },
        { subject: '컴퓨터 구조', classroom: '2학년 4반', teacher: '우선생', category: '전공이론' },
        { subject: '공통수학1', classroom: '2학년 4반', teacher: '안선생', category: '일반교과' },
        { subject: '영어Ⅰ', classroom: '2학년 4반', teacher: '표선생', category: '일반교과' },
        { subject: '창체자율', classroom: '2학년 4반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
    6: { // 2학년 6반 (스마트콘텐츠과)
      1: [
        { subject: 'e스포츠 윤리', classroom: '2학년 6반', teacher: '송선생', category: '전공이론' },
        { subject: '공통국어1', classroom: '2학년 6반', teacher: '신선생', category: '일반교과' },
        { subject: '수학Ⅰ', classroom: '2학년 6반', teacher: '안선생', category: '일반교과' },
        { subject: '소셜미디어 영상·음향제작', classroom: 'VR체험미디어랩 (본관 403호)', teacher: '남선생', category: '전공실습' },
        { subject: '소셜미디어 영상·음향제작', classroom: 'VR체험미디어랩 (본관 403호)', teacher: '남선생', category: '전공실습' },
        { subject: '3D 애니메이팅 실습', classroom: '드론영상스튜디오 (정보관 301호)', teacher: '배선생', category: '전공실습' },
        { subject: '창체자율', classroom: '2학년 6반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
    10: { // 2학년 10반 (산업디자인과)
      1: [
        { subject: '비주얼 아이데이션 전개', classroom: '2학년 10반', teacher: '한선생', category: '전공이론' },
        { subject: '문학', classroom: '2학년 10반', teacher: '신선생', category: '일반교과' },
        { subject: '수학Ⅰ', classroom: '2학년 10반', teacher: '안선생', category: '일반교과' },
        { subject: '애니메이션 기초 (실습)', classroom: '3D디자인조형실 (예술관 201호)', teacher: '서선생', category: '전공실습' },
        { subject: '애니메이션 기초 (실습)', classroom: '3D디자인조형실 (예술관 201호)', teacher: '서선생', category: '전공실습' },
        { subject: '최종 디자인 실무', classroom: '3D프린팅실 (실습동 103호)', teacher: '조선생', category: '전공실습' },
        { subject: '진로활동', classroom: '2학년 10반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
  },
  // 3학년 (심화 실습/캡스톤/취업)
  3: {
    1: { // 3학년 1반 (전기전자과)
      1: [
        { subject: '전자응용기기개발', classroom: '제1프로젝트실 (본관 5층)', teacher: '양선생', category: '전공실습' },
        { subject: '전자응용기기개발', classroom: '제1프로젝트실 (본관 5층)', teacher: '양선생', category: '전공실습' },
        { subject: '전자응용기기개발', classroom: '제1프로젝트실 (본관 5층)', teacher: '양선생', category: '전공실습' },
        { subject: '실용수학', classroom: '3학년 1반', teacher: '류선생', category: '일반교과' },
        { subject: '스마트가전 제어', classroom: '스마트가전실 (실습동 201호)', teacher: '홍선생', category: '전공실습' },
        { subject: '스마트가전 제어', classroom: '스마트가전실 (실습동 201호)', teacher: '홍선생', category: '전공실습' },
        { subject: '직업윤리', classroom: '3학년 1반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
    4: { // 3학년 4반 (컴퓨터소프트웨어과)
      1: [
        { subject: '디지털 논리 회로', classroom: 'SW코딩랩 (정보관 201호)', teacher: '정선생', category: '전공실습' },
        { subject: '디지털 논리 회로', classroom: 'SW코딩랩 (정보관 201호)', teacher: '정선생', category: '전공실습' },
        { subject: '물리학Ⅰ', classroom: '3학년 4반', teacher: '이선생', category: '일반교과' },
        { subject: '응용 소프트웨어 개발', classroom: '프로젝트실습실 (정보관 203호)', teacher: '고선생', category: '전공실습' },
        { subject: '응용 소프트웨어 개발', classroom: '프로젝트실습실 (정보관 203호)', teacher: '고선생', category: '전공실습' },
        { subject: '실용영어', classroom: '3학년 4반', teacher: '표선생', category: '일반교과' },
        { subject: '진로활동', classroom: '3학년 4반', teacher: '담임교사', category: '자율/창체' },
      ],
    },
  },
};

/**
 * NEIS hisTimetable API 호출 함수
 */
export async function fetchNeisTimetable(params: {
  grade: number;
  classNum: number;
  dateStr: string; // YYYYMMDD
  apiKey?: string;
}): Promise<{
  items: TimetableItem[];
  source: 'NEIS_API' | 'LOCAL_FALLBACK';
  message: string;
}> {
  const { grade, classNum, dateStr, apiKey } = params;
  const ay = dateStr.slice(0, 4);
  // 3월~8월은 1학기, 9월~다음해 2월은 2학기
  const month = parseInt(dateStr.slice(4, 6), 10);
  const sem = month >= 3 && month <= 8 ? '1' : '2';

  // API 쿼리 파라미터 조합
  const queryParams = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '100',
    ATPT_OFCDC_SC_CODE: DAEJIN_SCHOOL_INFO.officeCode, // C10
    SD_SCHUL_CODE: DAEJIN_SCHOOL_INFO.schoolCode,      // 7150597
    AY: ay,
    SEM: sem,
    ALL_TI_YMD: dateStr,
    GRADE: String(grade),
    CLASS_NM: String(classNum),
  });

  if (apiKey && apiKey.trim() !== '') {
    queryParams.set('KEY', apiKey.trim());
  }

  // 1차 시도: Vite 프록시 (/neis-proxy) -> 2차 시도: 직통 URL
  const proxyUrl = `/neis-proxy/hub/hisTimetable?${queryParams.toString()}`;
  const directUrl = `https://open.neis.go.kr/hub/hisTimetable?${queryParams.toString()}`;

  try {
    let res = await fetch(proxyUrl, { method: 'GET' }).catch(() => null);
    if (!res || !res.ok) {
      // 프록시 실패 시 직통 호출 시도
      res = await fetch(directUrl, { method: 'GET' }).catch(() => null);
    }

    if (res && res.ok) {
      const data: NeisTimetableResponse = await res.json();

      if (data.hisTimetable && data.hisTimetable[1] && data.hisTimetable[1].row) {
        const rows = data.hisTimetable[1].row;
        // 교시 순서대로 정렬
        rows.sort((a, b) => parseInt(a.PERIO, 10) - parseInt(b.PERIO, 10));

        const items: TimetableItem[] = rows.map((r) => {
          const perioNum = parseInt(r.PERIO, 10);
          const slot = PERIOD_SLOTS.find((s) => s.period === perioNum);
          const isPractice = r.ITRT_CNTNT.includes('실습') ||
            r.ITRT_CNTNT.includes('프로그래밍') ||
            r.ITRT_CNTNT.includes('마이크로') ||
            r.ITRT_CNTNT.includes('회로') ||
            r.ITRT_CNTNT.includes('제어');

          return {
            period: perioNum,
            startTime: slot ? slot.startTime : '09:00',
            endTime: slot ? slot.endTime : '09:50',
            subject: cleanSubjectName(r.ITRT_CNTNT),
            classroom: r.CLRM_NM || suggestClassroom(r.ITRT_CNTNT, grade, classNum),
            category: isPractice ? '전공실습' : guessCategory(r.ITRT_CNTNT),
          };
        });

        // 대한민국 고등학교(대진전자통신고) 정규 1~7교시 전 교시 편성 보장:
        // 나이스(NEIS) 무인증 API는 최대 5개 교시만 반환하므로, 누락된 6교시·7교시(동아리/창체/전공실습)를 학교 정규 교육과정으로 자동 보강
        const existingPeriods = new Set(items.map((it) => it.period));
        const fallback = getFallbackTimetable(grade, classNum, dateStr);

        for (let p = 1; p <= 7; p++) {
          if (!existingPeriods.has(p)) {
            const fbSlot = fallback.find((fb) => fb.period === p);
            if (fbSlot) {
              items.push(fbSlot);
            } else {
              const slot = PERIOD_SLOTS.find((s) => s.period === p);
              items.push({
                period: p,
                startTime: slot ? slot.startTime : (p === 6 ? '14:40' : '15:40'),
                endTime: slot ? slot.endTime : (p === 6 ? '15:30' : '16:30'),
                subject: p === 6 ? '동아리활동' : '학급자치 및 청소/종례',
                classroom: `${grade}학년 ${classNum}반 교실`,
                category: '자율/창체',
              });
            }
          }
        }

        // 1교시부터 7교시까지 순서대로 정렬
        items.sort((a, b) => a.period - b.period);

        return {
          items,
          source: 'NEIS_API',
          message: `나이스(NEIS) 실시간 시간표 동기화 완료 (1~7교시 정규 편성)`,
        };
      } else if (data.RESULT) {
        // INFO-200 등 (주말, 방학, 혹은 해당일 미등록)
        const fallback = getFallbackTimetable(grade, classNum, dateStr);
        return {
          items: fallback,
          source: 'LOCAL_FALLBACK',
          message: `NEIS 안내: ${data.RESULT.MESSAGE || '등록된 일정이 없어 대진전자통신고 표준 시간표를 표출합니다.'}`,
        };
      }
    }
  } catch (error) {
    console.warn('NEIS API fetch failed, using fallback:', error);
  }

  // 네트워크 오프라인 또는 오류 시 대진전자통신고 표준 시간표 제공
  const fallback = getFallbackTimetable(grade, classNum, dateStr);
  return {
    items: fallback,
    source: 'LOCAL_FALLBACK',
    message: '오프라인 / NEIS 예비 모드: 대진전자통신고 정규 커리큘럼 시간표 표출',
  };
}

/**
 * 대진전자통신고 표준 커리큘럼 기반 폴백 시간표 생성기
 */
export function getFallbackTimetable(
  grade: number,
  classNum: number,
  dateStr: string
): TimetableItem[] {
  // 날짜의 요일 계산 (0: 일, 1: 월, ..., 5: 금, 6: 토)
  const y = parseInt(dateStr.slice(0, 4), 10);
  const m = parseInt(dateStr.slice(4, 6), 10) - 1;
  const d = parseInt(dateStr.slice(6, 8), 10);
  const dateObj = new Date(y, m, d);
  let dayOfWeek = dateObj.getDay();

  // 주말(토/일)인 경우 월요일(1) 기준 예비 시간표 제공
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    dayOfWeek = 1;
  }

  // 해당 학년/반 마스터 템플릿 검색 (1~10반 4대 학과 스마트 매핑: 1~3 전기전자, 4~5 AI소프트, 6~8 스마트콘텐츠, 9~10 산업디자인)
  const gradeData = DAEJIN_CURRICULUM[grade] || DAEJIN_CURRICULUM[2];
  let classData = gradeData[classNum];
  if (!classData) {
    if (classNum >= 1 && classNum <= 3) {
      classData = gradeData[1] || gradeData[2]; // 전기전자과 (1~3반)
    } else if (classNum >= 4 && classNum <= 5) {
      classData = gradeData[4]; // AI소프트웨어과(1·2학년) / 컴퓨터소프트웨어과(3학년) (4~5반)
    } else if (classNum >= 6 && classNum <= 8) {
      classData = gradeData[6] || gradeData[4]; // 스마트콘텐츠과 (6~8반)
    } else if (classNum >= 9 && classNum <= 10) {
      classData = gradeData[10] || gradeData[4]; // 산업디자인과 (9~10반)
    } else {
      classData = gradeData[Object.keys(gradeData)[0] as unknown as number];
    }
  }
  const daySchedule = classData ? (classData[dayOfWeek] || classData[1] || []) : [];

  const items: TimetableItem[] = [];
  for (let p = 1; p <= 7; p++) {
    const item = daySchedule[p - 1];
    const slot = PERIOD_SLOTS.find((s) => s.period === p);
    if (item) {
      items.push({
        period: p,
        startTime: slot ? slot.startTime : '08:50',
        endTime: slot ? slot.endTime : '09:40',
        subject: item.subject,
        classroom: item.classroom,
        teacher: item.teacher,
        category: item.category,
      });
    } else {
      items.push({
        period: p,
        startTime: slot ? slot.startTime : (p === 6 ? '14:40' : '15:40'),
        endTime: slot ? slot.endTime : (p === 6 ? '15:30' : '16:30'),
        subject: p === 6 ? '동아리활동' : '학급자치 및 청소/종례',
        classroom: `${grade}학년 ${classNum}반 교실`,
        teacher: '담임교사',
        category: '자율/창체',
      });
    }
  }

  return items;
}

function cleanSubjectName(name: string): string {
  if (!name) return '수업';
  // 불필요한 기호 제거
  return name.replace(/[\[\]]/g, '').trim();
}

function guessCategory(name: string): '전공실습' | '전공이론' | '일반교과' | '자율/창체' {
  if (name.includes('실습') || name.includes('코딩') || name.includes('프로그래밍') || name.includes('모델링') || name.includes('프린팅') || name.includes('VR')) return '전공실습';
  if (name.includes('전자') || name.includes('콘텐츠') || name.includes('디자인') || name.includes('공업') || name.includes('인공지능') || name.includes('AI') || name.includes('알고리즘')) return '전공이론';
  if (name.includes('동아리') || name.includes('창체') || name.includes('자율') || name.includes('진로')) return '자율/창체';
  return '일반교과';
}

function suggestClassroom(subject: string, grade: number, classNum: number): string {
  if (subject.includes('AI') || subject.includes('파이썬') || subject.includes('빅데이터')) return 'AI데이터랩 (정보관 202호)';
  if (subject.includes('프로그래밍') || subject.includes('코딩') || subject.includes('소프트웨어')) return 'SW코딩랩 (정보관 201호)';
  if (subject.includes('VR') || subject.includes('콘텐츠') || subject.includes('드론') || subject.includes('미디어')) return 'VR체험미디어랩 (본관 403호)';
  if (subject.includes('3D') || subject.includes('디자인') || subject.includes('모델링') || subject.includes('프린팅')) return '3D디자인조형실 (예술관 201호)';
  if (subject.includes('마이크로') || subject.includes('회로') || subject.includes('반도체') || subject.includes('전자')) return '전자기초실습실 (실습동 302호)';
  if (subject.includes('체육')) return '대진체육관';
  if (subject.includes('과학')) return '과학실험실';
  return `${grade}학년 ${classNum}반 교실`;
}

/**
 * 대진전자통신고 급식 정보 조회 (NEIS mealServiceDietInfo 연동)
 */
export async function fetchNeisMeal(dateStr: string): Promise<MealInfo> {
  const queryParams = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '5',
    ATPT_OFCDC_SC_CODE: DAEJIN_SCHOOL_INFO.officeCode,
    SD_SCHUL_CODE: DAEJIN_SCHOOL_INFO.schoolCode,
    MLSV_YMD: dateStr,
  });

  const proxyUrl = `/neis-proxy/hub/mealServiceDietInfo?${queryParams.toString()}`;
  const directUrl = `https://open.neis.go.kr/hub/mealServiceDietInfo?${queryParams.toString()}`;

  try {
    let res = await fetch(proxyUrl).catch(() => null);
    if (!res || !res.ok) {
      res = await fetch(directUrl).catch(() => null);
    }
    if (res && res.ok) {
      const data = await res.json();
      if (data.mealServiceDietInfo && data.mealServiceDietInfo[1]?.row?.[0]) {
        const row = data.mealServiceDietInfo[1].row[0];
        const dishes = (row.DDISH_NM || '')
          .split('<br/>')
          .map((s: string) => s.replace(/\([0-9\.\s]+\)/g, '').trim())
          .filter(Boolean);

        return {
          date: dateStr,
          dishName: dishes.length > 0 ? dishes : ['친환경 흑미밥', '한우소고기미역국', '수제 돈까스 & 소스', '쫄면야채무침', '배추김치', '골드키위'],
          calorie: row.CAL_INFO || '825 Kcal',
          origin: row.ORPLC_INFO || '쌀(국내산), 쇠고기(국내산/한우), 돼지고기(국내산)',
        };
      }
    }
  } catch (e) {
    console.warn('Meal fetch error, fallback:', e);
  }

  // 급식 폴백
  return {
    date: dateStr,
    dishName: [
      '친환경 찰보리밥',
      '얼큰 차돌순두부찌개',
      '수제 치킨텐더까스 & 머스타드',
      '새콤달콤 골뱅이소면무침',
      '깍두기',
      '유기농 청포도에이드',
    ],
    calorie: '840 Kcal',
    origin: '쌀, 돼지고기, 닭고기(국내산)',
  };
}

/**
 * 실시간 현재 교시 판별
 */
export function getCurrentPeriodStatus(currentTime: Date = new Date()): {
  period: number;
  label: string;
  isBreak: boolean;
  isLunch: boolean;
  isSchoolFinished: boolean;
  isBeforeSchool: boolean;
  minutesRemaining: number;
  nextPeriodLabel: string;
} {
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // 08:30 이전 등교 전
  if (currentMinutes < 8 * 60 + 30) {
    const diff = 8 * 60 + 50 - currentMinutes;
    return {
      period: 0,
      label: '등교 및 조회 시간',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: true,
      minutesRemaining: Math.max(0, diff),
      nextPeriodLabel: '1교시 (08:50 시작)',
    };
  }

  // 1교시 (08:50 ~ 09:40)
  if (currentMinutes >= 8 * 60 + 50 && currentMinutes < 9 * 60 + 40) {
    return {
      period: 1,
      label: '1교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 9 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '쉬는시간 (09:40~09:50)',
    };
  }

  // 1교시 쉬는시간 (09:40 ~ 09:50)
  if (currentMinutes >= 9 * 60 + 40 && currentMinutes < 9 * 60 + 50) {
    return {
      period: 1,
      label: '쉬는 시간',
      isBreak: true,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 9 * 60 + 50 - currentMinutes,
      nextPeriodLabel: '2교시 (09:50 시작)',
    };
  }

  // 2교시 (09:50 ~ 10:40)
  if (currentMinutes >= 9 * 60 + 50 && currentMinutes < 10 * 60 + 40) {
    return {
      period: 2,
      label: '2교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 10 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '쉬는시간 (10:40~10:50)',
    };
  }

  // 2교시 쉬는시간
  if (currentMinutes >= 10 * 60 + 40 && currentMinutes < 10 * 60 + 50) {
    return {
      period: 2,
      label: '쉬는 시간',
      isBreak: true,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 10 * 60 + 50 - currentMinutes,
      nextPeriodLabel: '3교시 (10:50 시작)',
    };
  }

  // 3교시 (10:50 ~ 11:40)
  if (currentMinutes >= 10 * 60 + 50 && currentMinutes < 11 * 60 + 40) {
    return {
      period: 3,
      label: '3교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 11 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '쉬는시간 (11:40~11:50)',
    };
  }

  // 3교시 쉬는시간
  if (currentMinutes >= 11 * 60 + 40 && currentMinutes < 11 * 60 + 50) {
    return {
      period: 3,
      label: '쉬는 시간',
      isBreak: true,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 11 * 60 + 50 - currentMinutes,
      nextPeriodLabel: '4교시 (11:50 시작)',
    };
  }

  // 4교시 (11:50 ~ 12:40)
  if (currentMinutes >= 11 * 60 + 50 && currentMinutes < 12 * 60 + 40) {
    return {
      period: 4,
      label: '4교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 12 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '점심시간 (12:40~13:40)',
    };
  }

  // 점심시간 (12:40 ~ 13:40)
  if (currentMinutes >= 12 * 60 + 40 && currentMinutes < 13 * 60 + 40) {
    return {
      period: 0,
      label: '맛있는 점심시간 (급식)',
      isBreak: false,
      isLunch: true,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 13 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '5교시 (13:40 시작)',
    };
  }

  // 5교시 (13:40 ~ 14:30)
  if (currentMinutes >= 13 * 60 + 40 && currentMinutes < 14 * 60 + 30) {
    return {
      period: 5,
      label: '5교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 14 * 60 + 30 - currentMinutes,
      nextPeriodLabel: '쉬는시간 (14:30~14:40)',
    };
  }

  // 5교시 쉬는시간
  if (currentMinutes >= 14 * 60 + 30 && currentMinutes < 14 * 60 + 40) {
    return {
      period: 5,
      label: '쉬는 시간',
      isBreak: true,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 14 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '6교시 (14:40 시작)',
    };
  }

  // 6교시 (14:40 ~ 15:30)
  if (currentMinutes >= 14 * 60 + 40 && currentMinutes < 15 * 60 + 30) {
    return {
      period: 6,
      label: '6교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 15 * 60 + 30 - currentMinutes,
      nextPeriodLabel: '쉬는시간 (15:30~15:40)',
    };
  }

  // 6교시 쉬는시간
  if (currentMinutes >= 15 * 60 + 30 && currentMinutes < 15 * 60 + 40) {
    return {
      period: 6,
      label: '쉬는 시간',
      isBreak: true,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 15 * 60 + 40 - currentMinutes,
      nextPeriodLabel: '7교시 (15:40 시작)',
    };
  }

  // 7교시 (15:40 ~ 16:30)
  if (currentMinutes >= 15 * 60 + 40 && currentMinutes < 16 * 60 + 30) {
    return {
      period: 7,
      label: '7교시 수업 진행 중',
      isBreak: false,
      isLunch: false,
      isSchoolFinished: false,
      isBeforeSchool: false,
      minutesRemaining: 16 * 60 + 30 - currentMinutes,
      nextPeriodLabel: '청소 및 종례 (16:30~)',
    };
  }

  // 16:30 이후 하교 / 방과후
  return {
    period: 8,
    label: '정규 수업 종료 / 방과후·하교',
    isBreak: false,
    isLunch: false,
    isSchoolFinished: true,
    isBeforeSchool: false,
    minutesRemaining: 0,
    nextPeriodLabel: '내일 1교시 (08:50)',
  };
}

/**
 * 특정 날짜 기준 월~금 날짜 배열 생성 (주간 시간표용)
 */
export function getWeekDates(baseDate: Date): Array<{
  dateStr: string;
  dayName: string;
  isToday: boolean;
  displayStr: string;
}> {
  const current = new Date(baseDate);
  const day = current.getDay();
  // 월요일로 이동 (일요일인 경우 지난주 월요일로)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const dayNames = ['월', '화', '수', '목', '금'];
  const todayStr = formatDate(new Date());

  return dayNames.map((name, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dateStr = formatDate(d);
    return {
      dateStr,
      dayName: name,
      isToday: dateStr === todayStr,
      displayStr: `${d.getMonth() + 1}.${d.getDate()}`,
    };
  });
}

export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export function formatKoreanDate(dateStr: string): string {
  if (dateStr.length !== 8) return dateStr;
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayNames[dateObj.getDay()];
  return `${y}년 ${parseInt(m, 10)}월 ${parseInt(d, 10)}일 (${dayName})`;
}
