import type { JobCard } from "./types";
import {
  differenceInCalendarDays,
  differenceInHours,
  differenceInMinutes,
  isToday,
  isTomorrow,
} from "date-fns";
import { getNextPendingInterviewRound } from "./interviewRounds";

/** 下一场面试的 ISO 时间：仅来自时间轴 `interviewRounds`（与详情页一致） */
export function getNextInterviewIso(card: JobCard): string | undefined {
  return getNextPendingInterviewRound(card.interviewRounds)?.scheduledAt;
}

/**
 * 看板「面试中」列排序用：越早的面试越小；无下一场时间或非法时间排最后。
 * 与 `getNextInterviewIso` / 卡片倒计时徽章数据源一致。
 */
export function getInterviewingSortTimestamp(card: JobCard): number {
  const iso = getNextInterviewIso(card);
  if (!iso) return Number.POSITIVE_INFINITY;
  const t = new Date(iso).getTime();
  return Number.isFinite(t) ? t : Number.POSITIVE_INFINITY;
}

/** 备选池投递截止（兼容旧数据的 `deadline`） */
export function getApplicationDeadlineIso(card: JobCard): string | undefined {
  return card.applicationDeadline ?? card.deadline;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 本地「明日 14:00」 */
function formatTomorrowClock(d: Date) {
  return `明日 ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export function formatPoolDeadlineBadge(iso: string, now = new Date()): string | null {
  const end = new Date(iso);
  const mins = differenceInMinutes(end, now);
  if (mins < 0) return "⚠️ 已过截止";

  const calDays = differenceInCalendarDays(end, now);
  if (calDays === 0 || isToday(end)) return "🚨 今日截止";
  if (calDays === 1) return "⏳ 明日截止";
  if (calDays > 1) return `⏳ 投递截止: ${calDays}天`;
  return null;
}

export function formatInterviewCountdownBadge(iso: string, now = new Date()): string | null {
  const t = new Date(iso);
  const mins = differenceInMinutes(t, now);
  if (mins < 0) return "⏰ 面试已开始/已过";

  if (isTomorrow(t)) return `⏰ ${formatTomorrowClock(t)}`;

  const hours = differenceInHours(t, now);
  if (hours < 24 && hours >= 1) return `⏰ 距面试: ${hours}小时`;

  if (hours < 1) {
    if (mins < 60) return `⏰ 距面试: ${mins}分钟`;
    return "⏰ 距面试: 1小时内";
  }

  const days = differenceInCalendarDays(t, now);
  if (days >= 1) return `⏰ 距面试: ${days}天`;

  return "⏰ 即将面试";
}

export function getFocusUrgentAtIso(card: JobCard): string | undefined {
  if (card.stage === "backlog") return getApplicationDeadlineIso(card);
  if (card.stage === "interviewing") return getNextInterviewIso(card);
  return undefined;
}
