"use client";

import { useRouter } from "next/navigation";
import { MeetingData } from "../types";
import { saveMeeting } from "../lib/storage";

const SEED_DATA: MeetingData = {
  metadata: {
    id: "test-meeting-001",
    title: "Meeting 2026-03-01 10:00",
    startedAt: "2026-03-01T10:00:00.000Z",
    endedAt: null,
    durationSeconds: 847,
  },
  segments: [
    {
      id: "seg-001",
      timestamp: "00:00:12",
      korean: "안녕하세요, 오늘 회의를 시작하겠습니다. 첫 번째 안건은 신규 프로젝트 일정입니다.",
      chinese: "大家好，今天的会议正式开始。第一个议题是新项目的日程安排。",
    },
    {
      id: "seg-002",
      timestamp: "00:01:05",
      korean: "개발팀에서 백엔드 API 설계를 완료했습니다. 다음 주까지 프론트엔드 작업을 마무리할 예정입니다.",
      chinese: "开发团队已经完成了后端API设计。计划在下周之前完成前端开发工作。",
    },
    {
      id: "seg-003",
      timestamp: "00:02:30",
      korean: "테스트 일정이 좀 촉박한데, QA팀과 협의가 필요합니다.",
      chinese: "测试日程比较紧张，需要和QA团队进行协商。",
    },
    {
      id: "seg-004",
      timestamp: "00:03:45",
      korean: "예산 관련해서 클라우드 서버 비용이 예상보다 20% 초과했습니다.",
      chinese: "关于预算方面，云服务器费用比预期超出了20%。",
    },
    {
      id: "seg-005",
      timestamp: "00:05:10",
      korean: "비용 절감을 위해 서버리스 아키텍처로 전환하는 것을 검토하겠습니다.",
      chinese: "为了节省成本，将研究转换为无服务器架构的方案。",
    },
    {
      id: "seg-006",
      timestamp: "00:06:22",
      korean: "디자인팀에서 새로운 UI 목업을 공유했는데, 피드백 부탁드립니다.",
      chinese: "设计团队分享了新的UI模型，请大家给出反馈。",
    },
    {
      id: "seg-007",
      timestamp: "00:08:15",
      korean: "사용자 인증 방식을 OAuth에서 패스키로 변경하기로 결정했습니다.",
      chinese: "决定将用户认证方式从OAuth改为Passkey。",
    },
    {
      id: "seg-008",
      timestamp: "00:09:40",
      korean: "다음 릴리즈는 3월 15일로 확정합니다. 각 팀별로 마감일 준수 부탁드립니다.",
      chinese: "下一次发布日期确定为3月15日。请各团队遵守截止日期。",
    },
    {
      id: "seg-009",
      timestamp: "00:11:05",
      korean: "고객사에서 다국어 지원 요청이 왔습니다. 우선순위를 논의해야 합니다.",
      chinese: "客户提出了多语言支持的需求。需要讨论优先级。",
    },
    {
      id: "seg-010",
      timestamp: "00:13:20",
      korean: "김 팀장님이 다음 주 수요일까지 기술 검토 보고서를 제출해 주세요.",
      chinese: "请金组长在下周三之前提交技术评审报告。",
    },
    {
      id: "seg-011",
      timestamp: "00:14:07",
      korean: "오늘 회의는 여기까지 하겠습니다. 수고하셨습니다.",
      chinese: "今天的会议到此结束。辛苦大家了。",
    },
  ],
  bookmarks: [],
  summary: null,
};

export default function DevSeedPage() {
  const router = useRouter();

  const seed = () => {
    saveMeeting(SEED_DATA);
    router.push("/");
  };

  const seedWithBookmarks = () => {
    const data: MeetingData = {
      ...SEED_DATA,
      bookmarks: [
        {
          id: "bm-001",
          segmentId: "seg-004",
          type: "star",
          createdAt: "2026-03-01T10:03:50.000Z",
        },
        {
          id: "bm-002",
          segmentId: "seg-003",
          type: "question",
          createdAt: "2026-03-01T10:02:35.000Z",
        },
        {
          id: "bm-003",
          segmentId: "seg-007",
          type: "pin",
          createdAt: "2026-03-01T10:08:20.000Z",
        },
        {
          id: "bm-004",
          segmentId: "seg-010",
          type: "star",
          createdAt: "2026-03-01T10:13:25.000Z",
        },
      ],
    };
    saveMeeting(data);
    router.push("/");
  };

  const clear = () => {
    localStorage.removeItem("kmat_current_meeting");
    router.push("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0a0a0a] text-white gap-6">
      <h1 className="text-2xl font-semibold">KMAT Dev Seed</h1>
      <p className="text-white/40 text-sm max-w-md text-center">
        Inject test meeting data into localStorage to test bookmarks, transcript, and summary flows without a microphone.
      </p>
      <div className="flex flex-col gap-3">
        <button
          onClick={seed}
          className="px-8 py-3 rounded-full text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-all"
        >
          Seed 11 segments (no bookmarks)
        </button>
        <button
          onClick={seedWithBookmarks}
          className="px-8 py-3 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all"
        >
          Seed 11 segments + 4 bookmarks
        </button>
        <button
          onClick={clear}
          className="px-8 py-3 rounded-full text-sm font-medium bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
        >
          Clear localStorage
        </button>
      </div>
    </div>
  );
}
