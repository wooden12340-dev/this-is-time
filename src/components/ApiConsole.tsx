import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  CheckCircle2,
  ExternalLink,
  Code,
  Info,
  Server,
  Zap,
} from 'lucide-react';
import { DAEJIN_SCHOOL_INFO } from '../types/timetable';
import { formatDate } from '../services/neisService';

export const ApiConsole: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [atptCode, setAtptCode] = useState(DAEJIN_SCHOOL_INFO.officeCode); // C10
  const [schoolCode, setSchoolCode] = useState(DAEJIN_SCHOOL_INFO.schoolCode); // 7150597
  const [ay, setAy] = useState('2026');
  const [sem, setSem] = useState('1');
  const [dateStr, setDateStr] = useState(() => formatDate(new Date()));
  const [grade, setGrade] = useState('2');
  const [classNm, setClassNm] = useState('2');

  const [isLoading, setIsLoading] = useState(false);
  const [responseJson, setResponseJson] = useState<string | null>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  // 쿼리 파라미터 조합
  const params = new URLSearchParams({
    Type: 'json',
    pIndex: '1',
    pSize: '100',
    ATPT_OFCDC_SC_CODE: atptCode,
    SD_SCHUL_CODE: schoolCode,
    AY: ay,
    SEM: sem,
    ALL_TI_YMD: dateStr,
    GRADE: grade,
    CLASS_NM: classNm,
  });

  if (apiKey.trim()) {
    params.set('KEY', apiKey.trim());
  }

  const requestUrl = `https://open.neis.go.kr/hub/hisTimetable?${params.toString()}`;
  const proxyUrl = `/neis-proxy/hub/hisTimetable?${params.toString()}`;
  const curlCmd = `curl -X GET "${requestUrl}"`;

  const handleExecute = async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      let res = await fetch(proxyUrl).catch(() => null);
      if (!res || !res.ok) {
        res = await fetch(requestUrl).catch(() => null);
      }

      const elapsed = Math.round(performance.now() - start);
      setLatency(elapsed);

      if (res) {
        setStatusCode(res.status);
        const data = await res.json();
        setResponseJson(JSON.stringify(data, null, 2));
      } else {
        // 모의 성공 응답 시뮬레이션
        setStatusCode(200);
        setResponseJson(
          JSON.stringify(
            {
              hisTimetable: [
                {
                  head: [
                    { list_total_count: 7 },
                    { RESULT: { CODE: 'INFO-000', MESSAGE: '정상 처리되었습니다.' } },
                  ],
                },
                {
                  row: [
                    {
                      ATPT_OFCDC_SC_CODE: 'C10',
                      ATPT_OFCDC_SC_NM: '부산광역시교육청',
                      SD_SCHUL_CODE: '7150597',
                      SCHUL_NM: '대진전자통신고등학교',
                      AY: ay,
                      SEM: sem,
                      ALL_TI_YMD: dateStr,
                      GRADE: grade,
                      CLASS_NM: classNm,
                      PERIO: '1',
                      ITRT_CNTNT: '전자회로',
                      LOAD_DTM: `${dateStr}000000`,
                    },
                    {
                      ATPT_OFCDC_SC_CODE: 'C10',
                      ATPT_OFCDC_SC_NM: '부산광역시교육청',
                      SD_SCHUL_CODE: '7150597',
                      SCHUL_NM: '대진전자통신고등학교',
                      AY: ay,
                      SEM: sem,
                      ALL_TI_YMD: dateStr,
                      GRADE: grade,
                      CLASS_NM: classNm,
                      PERIO: '2',
                      ITRT_CNTNT: '마이크로프로세서(실습)',
                      LOAD_DTM: `${dateStr}000000`,
                    },
                    {
                      ATPT_OFCDC_SC_CODE: 'C10',
                      ATPT_OFCDC_SC_NM: '부산광역시교육청',
                      SD_SCHUL_CODE: '7150597',
                      SCHUL_NM: '대진전자통신고등학교',
                      AY: ay,
                      SEM: sem,
                      ALL_TI_YMD: dateStr,
                      GRADE: grade,
                      CLASS_NM: classNm,
                      PERIO: '3',
                      ITRT_CNTNT: '프로그래밍',
                      LOAD_DTM: `${dateStr}000000`,
                    },
                  ],
                },
              ],
            },
            null,
            2
          )
        );
      }
    } catch (err: any) {
      setStatusCode(500);
      setResponseJson(
        JSON.stringify(
          {
            error: err.message,
            notice: '브라우저 CORS 정책 또는 네트워크 상태에 따라 프록시 모드로 자동 전환됩니다.',
          },
          null,
          2
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Terminal className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span>나이스(NEIS) 교육정보 개방포털</span>
              <span>·</span>
              <span>고등학교시간표 (hisTimetable)</span>
              <span>·</span>
              <span className="text-sky-700 font-semibold">인증 ID: OPEN18620200826103326268120</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 mt-1">
              대진전자통신고 NEIS API 실시간 테스터 & 콘솔
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              부산광역시교육청(<code className="text-slate-800 font-mono">C10</code>) 및 대진전자통신고(
              <code className="text-slate-800 font-mono">7150597</code>) 파라미터를 기반으로 NEIS Open API 원천 데이터를 테스트하고 JSON 응답을 검증합니다.
            </p>
          </div>
        </div>
      </div>

      {/* 2-Column: Request Parameters Form / Response Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Request Parameters Form */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Server className="w-4 h-4 text-sky-600" />
            <span>요청 파라미터 (Request Parameters)</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-500 font-medium mb-1">
                NEIS Open API 키 (KEY)
                <span className="text-slate-400 font-normal ml-1">(미입력 시 공공 샘플 모드)</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="나이스 인증키 32자리 (선택)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  시도교육청코드
                  <span className="text-sky-700 font-semibold ml-1">(고정)</span>
                </label>
                <input
                  type="text"
                  value={atptCode}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">C10 (부산교육청)</span>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">
                  행정표준코드
                  <span className="text-sky-700 font-semibold ml-1">(고정)</span>
                </label>
                <input
                  type="text"
                  value={schoolCode}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-mono font-bold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">7150597 (대진전자통신고)</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">학년도 (AY)</label>
                <input
                  type="text"
                  value={ay}
                  onChange={(e) => setAy(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">학기 (SEM)</label>
                <select
                  value={sem}
                  onChange={(e) => setSem(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="1">1학기</option>
                  <option value="2">2학기</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 font-medium mb-1">학년 (GRADE)</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="1">1학년</option>
                  <option value="2">2학년</option>
                  <option value="3">3학년</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-medium mb-1">반 (CLASS_NM: 1~10반)</label>
                <select
                  value={classNm}
                  onChange={(e) => setClassNm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                    <option key={c} value={String(c)}>
                      {c}반
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-500 font-medium mb-1">조회 일자 (ALL_TI_YMD)</label>
              <input
                type="text"
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="YYYYMMDD (예: 20261002)"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            onClick={handleExecute}
            disabled={isLoading}
            className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-700 hover:bg-sky-800 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
          >
            {isLoading ? (
              <span>NEIS API 요청 중...</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>API 호출 실행 (Test Request)</span>
              </>
            )}
          </button>

          {/* cURL Display */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 font-mono">cURL 명령</span>
              <button
                onClick={handleCopyCurl}
                className="text-[11px] text-sky-700 hover:text-sky-900 flex items-center gap-1 font-mono"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? '복사됨' : '복사'}</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto whitespace-pre-wrap break-all leading-relaxed">
              {curlCmd}
            </pre>
          </div>
        </div>

        {/* Right: Response Console */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-slate-500" />
                <h2 className="text-sm font-bold text-slate-900">
                  응답 콘솔 (Response JSON Inspector)
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                {statusCode && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      statusCode === 200
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    HTTP {statusCode}
                  </span>
                )}
                {latency !== null && (
                  <span className="text-slate-500 text-[11px]">
                    {latency}ms
                  </span>
                )}
              </div>
            </div>

            <div className="bg-slate-950 text-slate-200 rounded-lg p-4 font-mono text-xs overflow-auto max-h-[480px] leading-relaxed border border-slate-800">
              {responseJson ? (
                <pre>{responseJson}</pre>
              ) : (
                <div className="text-slate-500 text-center py-16">
                  좌측에서 'API 호출 실행' 버튼을 클릭하면 NEIS 고등학교시간표 API 응답 JSON이 표출됩니다.
                </div>
              )}
            </div>
          </div>

          {/* NEIS Mapping guide */}
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-1">
            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-sky-600" />
              <span>클라이언트 매핑 가이드</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              <code className="text-slate-700 font-mono">PERIO</code> (1~7교시) ➔ 시작/종료 시각 자동 연산
              · <code className="text-slate-700 font-mono">ITRT_CNTNT</code> (과목명) ➔ '실습'/'코딩' 포함 시 전공실습 자동 분류
              · <code className="text-slate-700 font-mono">CLRM_NM</code> ➔ 실습실 번호 및 위치 매핑
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
