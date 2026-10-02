/**
 * 대진전자통신고등학교 시간표 및 PRD 데이터 타입 정의
 * NEIS Open API (hisTimetable - OPEN18620200826103326268120) 기준
 */

export interface SchoolInfo {
  officeCode: string;       // 시도교육청코드: C10 (부산광역시교육청)
  officeName: string;       // 부산광역시교육청
  schoolCode: string;       // 행정표준코드: 7150597
  schoolName: string;       // 대진전자통신고등학교
  schoolEnglishName: string;// Daejin High School of Electronics & Communication
  schoolType: string;       // 고등학교
  schoolCategory: string;   // 특성화고 / 전문계
  address: string;          // 부산광역시 금정구 수림로 92 (장전동)
  tel: string;              // 051-582-8100
  homepage: string;         // www.pdj.hs.kr
  establishedDate: string;  // 19951030
}

export const DAEJIN_SCHOOL_INFO: SchoolInfo = {
  officeCode: 'C10',
  officeName: '부산광역시교육청',
  schoolCode: '7150597',
  schoolName: '대진전자통신고등학교',
  schoolEnglishName: 'Daejin High School of Electronics & Communication',
  schoolType: '고등학교',
  schoolCategory: '특성화고 (전문계)',
  address: '부산광역시 금정구 수림로 92 (장전동)',
  tel: '051-582-8100',
  homepage: 'http://www.pdj.hs.kr',
  establishedDate: '1995-10-30',
};

// 대진전자통신고 학과 목록
export interface Department {
  id: string;
  name: string;
  codeName: string;
  description: string;
  classes: number[];
}

export const DAEJIN_DEPARTMENTS: Department[] = [
  {
    id: 'elec',
    name: '전기전자과',
    codeName: '전기전자과',
    description: '하드웨어 회로 설계, 하드웨어 측정분석 및 전자 제작 실습 (1~3반)',
    classes: [1, 2, 3],
  },
  {
    id: 'ai-sw',
    name: 'AI소프트웨어과',
    codeName: 'AI소프트웨어과',
    description: '프로그래밍 언어 응용, 컴퓨터 구조, AI 및 디지털 논리회로 (4~5반, 3학년 구 컴퓨터소프트웨어과)',
    classes: [4, 5],
  },
  {
    id: 'content',
    name: '스마트콘텐츠과',
    codeName: '스마트콘텐츠과',
    description: '소셜미디어 영상·음향제작, 3D 애니메이팅, 게임 콘텐츠 제작 및 e스포츠 윤리 (6~8반)',
    classes: [6, 7, 8],
  },
  {
    id: 'design',
    name: '산업디자인과',
    codeName: '산업디자인과',
    description: '비주얼 아이데이션 전개, 애니메이션 기초 및 최종 디자인 실무 (9~10반)',
    classes: [9, 10],
  },
];

// NEIS hisTimetable API 응답 구조
export interface NeisTimetableRow {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string;   // 시도교육청명
  SD_SCHUL_CODE: string;      // 행정표준코드
  SCHUL_NM: string;           // 학교명
  AY: string;                 // 학년도
  SEM: string;                // 학기
  ALL_TI_YMD: string;         // 시간표일자 (YYYYMMDD)
  GRADE: string;              // 학년
  CLASS_NM: string;           // 반명
  PERIO: string;              // 교시
  ITRT_CNTNT: string;         // 수업내용 (과목명)
  LOAD_DTM?: string;          // 수정일
  CLRM_NM?: string;           // 강의실명 (선택)
}

export interface NeisTimetableResponse {
  hisTimetable?: [
    {
      head: [
        { list_total_count: number },
        { RESULT: { CODE: string; MESSAGE: string } }
      ];
    },
    {
      row: NeisTimetableRow[];
    }
  ];
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}

// 클라이언트 정규화 시간표 아이템
export interface TimetableItem {
  period: number;             // 교시 (1 ~ 7)
  startTime: string;          // 시작시간 (e.g., '08:50')
  endTime: string;            // 종료시간 (e.g., '09:40')
  subject: string;            // 과목명
  teacher?: string;           // 교사명
  classroom?: string;         // 강의실/실습실 (e.g. '제2전기실습실')
  memo?: string;              // 학생 개인 메모 / 준비물
  isCurrent?: boolean;        // 현재 진행 교시 여부
  isPast?: boolean;           // 종료 교시 여부
  category?: '전공실습' | '전공이론' | '일반교과' | '자율/창체';
}

export interface DaySchedule {
  date: string;               // YYYYMMDD
  displayDate: string;        // '2026.10.02 (금)'
  dayOfWeek: string;          // '월' | '화' | '수' | '목' | '금'
  grade: number;
  classNum: number;
  department: string;
  items: TimetableItem[];
}

export interface PeriodTimeSlot {
  period: number;
  label: string;
  startTime: string;
  endTime: string;
  type: '수업' | '점심' | '청소/종례';
}

export const PERIOD_SLOTS: PeriodTimeSlot[] = [
  { period: 1, label: '1교시', startTime: '08:50', endTime: '09:40', type: '수업' },
  { period: 2, label: '2교시', startTime: '09:50', endTime: '10:40', type: '수업' },
  { period: 3, label: '3교시', startTime: '10:50', endTime: '11:40', type: '수업' },
  { period: 4, label: '4교시', startTime: '11:50', endTime: '12:40', type: '수업' },
  { period: 0, label: '점심시간', startTime: '12:40', endTime: '13:40', type: '점심' },
  { period: 5, label: '5교시', startTime: '13:40', endTime: '14:30', type: '수업' },
  { period: 6, label: '6교시', startTime: '14:40', endTime: '15:30', type: '수업' },
  { period: 7, label: '7교시', startTime: '15:40', endTime: '16:30', type: '수업' },
];

export interface MealInfo {
  date: string;
  dishName: string[];
  calorie: string;
  origin: string;
}

export interface SavedClassSetting {
  grade: number;
  classNum: number;
  departmentId: string;
  saveDate: string;
}
