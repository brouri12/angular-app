import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  BadgeModel,
  CatalogQuestionModel,
  ChapterModel,
  CoachChatMessage,
  CourseMaterialModel,
  CourseModel,
  EnrollmentRowModel,
  HistoryModel,
  HistoryTimelineItem,
  LessonModel,
  LevelModel,
  QuizModel,
  QuizQuestionModel,
  StudentApiService,
  StudentNotificationModel,
  StudentModel
} from './student-api.service';

interface CoachUiMessage {
  role: 'user' | 'bot';
  text: string;
}

interface BadgeTier {
  points: number;
  badgeLevel: string;
  badgeName: string;
  icon: string;
  accent: string;
}

export type StudentMainTab = 'parcours' | 'courses' | 'enrollments' | 'badges' | 'quiz';

@Component({
  selector: 'app-student',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './student.html',
  styleUrl: './student.css'
})
export class Student implements OnInit, OnDestroy {
  private static readonly LOAD_GUARD_MS = 20000;
  private static readonly LS_STUDENT = 'selectedStudentId';
  private static readonly LS_DARK = 'jungleDarkTheme';
  private static readonly LS_COACH = 'jungleStudentChatHistoryV1';

  protected initialBusy = true;
  protected errorMessage = '';

  protected students: StudentModel[] = [];
  protected selectedStudentId: number | null = null;

  protected allLevels: LevelModel[] = [];
  protected searchTerm = '';
  protected selectedSort: 'pedagogy' | 'name' = 'pedagogy';

  protected points = 0;
  protected currentBadge = 'Beginner';
  protected progressPercent = 0;
  protected coursesStarted = 0;
  protected coursesCompleted = 0;
  protected quizzesTaken = 0;
  protected totalLevels = 0;
  protected averageQuizScore = 0;
  protected pendingLevels = 0;

  protected history: HistoryModel | null = null;
  protected timeline: HistoryTimelineItem[] = [];

  protected activeTab: StudentMainTab = 'parcours';
  protected darkTheme = false;
  protected toastText = '';

  /** Parcours: levels | chapters | detail */
  protected parcoursStep: 'levels' | 'chapters' | 'detail' = 'levels';
  protected parcoursLevelId: number | null = null;
  protected parcoursChapterId: number | null = null;
  protected parcoursChapterSearch = '';
  protected parcoursDetailPane: 'lessons' | 'quiz' = 'lessons';
  protected selectedParcoursQuizId: number | null = null;
  protected parcoursQuizQuestions: QuizQuestionModel[] = [];
  protected parcoursQuizAnswers: Record<number, string> = {};
  protected parcoursQuizReviewMap: Record<number, boolean> = {};
  protected quizReviewTodoQuestionIds: number[] = [];
  protected quizReviewTodoLevelId: number | null = null;
  protected quizReviewTodoChapterId: number | null = null;
  protected quizReviewTodoQuizId: number | null = null;
  protected parcoursQuizBusy = false;
  protected parcoursQuizMessage = '';
  protected parcoursQuizStarted = false;
  protected parcoursQuizIndex = 0;
  protected parcoursQuizSubmitting = false;
  protected parcoursQuizRemainingSec = 0;
  protected parcoursQuizCameraReady = false;
  protected parcoursQuizCameraLabel = 'Camera non active';
  protected quizCameraDevices: MediaDeviceInfo[] = [];
  protected selectedQuizCameraDeviceId = '';
  @ViewChild('quizCameraVideo') private quizCameraVideo?: ElementRef<HTMLVideoElement>;
  private parcoursQuizTimerId: number | null = null;
  private parcoursQuizMediaStream: MediaStream | null = null;
  protected parcoursQuizProctorHint = '';
  protected parcoursQuizProctorAlert = '';
  private parcoursQuizDetectIntervalId: number | null = null;
  private parcoursQuizDetectModel: any = null;
  private parcoursQuizPhoneHits = 0;
  private parcoursQuizPersonHits = 0;
  private quizAntiCheatBound = false;
  private readonly quizAntiCheatClipboardHandler = (ev: Event) => {
    if (!this.parcoursQuizStarted || this.parcoursQuizSubmitting) return;
    ev.preventDefault();
    this.terminateQuizForFraud('Copier/coller detecte. Quiz termine et retour a l accueil.');
  };
  private readonly quizAntiCheatVisibilityHandler = () => {
    if (!this.parcoursQuizStarted || this.parcoursQuizSubmitting) return;
    if (document.visibilityState === 'hidden') {
      this.terminateQuizForFraud('Changement d onglet detecte. Quiz termine et retour a l accueil.');
    }
  };

  protected coursesList: CourseModel[] = [];
  protected coursesLoadError = '';
  protected courseDetailId: number | null = null;
  protected courseDetail: CourseModel | null = null;
  protected courseMaterials: CourseMaterialModel[] = [];

  protected enrollmentsRows: EnrollmentRowModel[] = [];
  protected badgesTabList: BadgeModel[] = [];
  private readonly badgeTiers: BadgeTier[] = [
    { points: 50, badgeLevel: 'BRONZE', badgeName: 'Bronze Explorer', icon: '🧭', accent: '#CD7F32' },
    { points: 100, badgeLevel: 'SILVER', badgeName: 'Silver Achiever', icon: '🥈', accent: '#C0C0C0' },
    { points: 150, badgeLevel: 'GOLD', badgeName: 'Gold Master', icon: '🏅', accent: '#F59E0B' },
    { points: 200, badgeLevel: 'PLATINUM', badgeName: 'Platinum Champion', icon: '💎', accent: '#06B6D4' }
  ];

  protected quizCourses: CourseModel[] = [];
  protected selectedQuizCourseId: number | null = null;
  protected catalogQuestions: CatalogQuestionModel[] = [];
  protected catalogAnswers: Record<number, string> = {};
  protected catalogBusy = false;

  /** Barre dictionnaire : envoie le mot vers le coach (panneau chatbot) */
  protected dictionaryWord = '';
  protected dictionaryBusy = false;

  /** Coach flottant (student.html legacy) */
  @ViewChild('coachChatBody') private coachChatBody?: ElementRef<HTMLDivElement>;
  @ViewChild('coachInputEl') private coachInputEl?: ElementRef<HTMLInputElement>;
  protected coachPanelOpen = false;
  protected coachMessages: CoachUiMessage[] = [];
  protected coachInput = '';
  protected coachBusy = false;

  /** Notifications (comme la page legacy) */
  protected notificationsOpen = false;
  protected notificationsBusy = false;
  protected notifications: StudentNotificationModel[] = [];
  private notificationTimerId: number | null = null;
  protected notifBellAnimate = false;
  protected notifBadgeAnimate = false;
  protected notifScreenFlashActive = false;
  protected notifBannerActive = false;
  protected notifBannerText = 'Nouvelle notification recue';
  protected notifBannerMeta = '';
  private notificationsBootstrapped = false;
  private lastNotificationId: number | null = null;

  constructor(
    private readonly studentApi: StudentApiService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    try {
      this.darkTheme = localStorage.getItem(Student.LS_DARK) === '1';
      localStorage.removeItem('jungleStudentAccountLocked');
      localStorage.removeItem('jungleStudentAccountLockReason');
    } catch {
      this.darkTheme = false;
    }
    this.initCoachMessages();
    void this.refreshNotifications(false);
    this.notificationTimerId = window.setInterval(() => {
      void this.refreshNotifications(true);
    }, 30000);
    void this.initializeDashboard();
  }

  ngOnDestroy(): void {
    if (this.notificationTimerId != null) {
      window.clearInterval(this.notificationTimerId);
      this.notificationTimerId = null;
    }
    this.stopParcoursQuizTimer();
    this.stopParcoursQuizCamera();
    this.stopParcoursQuizDetection();
    this.detachQuizSecurityGuards();
  }

  protected toggleCoachPanel(): void {
    this.coachPanelOpen = !this.coachPanelOpen;
    if (this.coachPanelOpen) {
      window.setTimeout(() => this.coachInputEl?.nativeElement?.focus(), 0);
    }
  }

  protected closeCoachPanel(): void {
    this.coachPanelOpen = false;
  }

  protected async lookupDictionary(): Promise<void> {
    const w = this.dictionaryWord.trim();
    if (!w || this.dictionaryBusy || this.coachBusy) return;
    this.dictionaryBusy = true;
    try {
      this.coachPanelOpen = true;
      this.cdr.detectChanges();
      await new Promise<void>((r) => window.setTimeout(r, 0));
      window.setTimeout(() => this.coachInputEl?.nativeElement?.focus(), 0);

      const explanation = await this.studentApi.tryExplainEnglishWord(w);
      if (explanation) {
        this.appendCoachWordTurn(w, explanation);
      } else {
        const prompt =
          `The student selected the English word "${w}" from the dictionary bar. ` +
          `Explain its meaning in simple English (A2/B1), how to use it, and give one example sentence. Answer in English only.`;
        await this.runCoachTurn(prompt, w);
      }
    } finally {
      this.dictionaryBusy = false;
      this.scrollCoachToBottom();
      this.cdr.detectChanges();
    }
  }

  private appendCoachWordTurn(word: string, reply: string): void {
    this.coachMessages = [...this.coachMessages, { role: 'user', text: word }, { role: 'bot', text: reply }];
    this.saveCoachToStorage();
    this.scrollCoachToBottom();
  }

  protected async submitCoachMessage(): Promise<void> {
    const q = this.coachInput.trim();
    if (!q || this.coachBusy) return;
    await this.runCoachTurn(q);
    this.coachInput = '';
  }

  protected notificationLabel(n: StudentNotificationModel): string {
    const title = n.courseTitle?.trim() || 'Nouveau contenu';
    const t = (n.type ?? '').toLowerCase();
    if (t.includes('lesson')) return `Nouvelle lecon: ${title}`;
    if (t.includes('chapter')) return `Nouveau chapitre: ${title}`;
    if (t.includes('course')) return `Nouveau cours: ${title}`;
    return title;
  }

  protected notificationDateLabel(raw: string | null | undefined): string {
    if (!raw) return '-';
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return '-';
    return d.toLocaleString();
  }

  protected toggleNotifications(): void {
    this.notificationsOpen = !this.notificationsOpen;
    if (this.notificationsOpen) {
      void this.refreshNotifications(false);
    }
  }

  protected async refreshNotifications(animateOnNew = false): Promise<void> {
    this.notificationsBusy = true;
    try {
      const list = await this.studentApi.getNotifications(30);
      const next = Array.isArray(list) ? list : [];
      this.handleNotificationAnimations(next, animateOnNew);
      this.notifications = next;
    } catch {
      this.notifications = [];
    } finally {
      this.notificationsBusy = false;
      this.cdr.detectChanges();
    }
  }

  protected async openNotification(n: StudentNotificationModel): Promise<void> {
    this.notificationsOpen = false;
    if (n.courseId && Number(n.courseId) > 0) {
      await this.openCourseDetail(Number(n.courseId));
      return;
    }
    await this.setTab('courses');
  }

  protected async deleteNotification(n: StudentNotificationModel): Promise<void> {
    if (!n.id) return;
    try {
      await this.studentApi.deleteNotification(n.id);
      this.notifications = this.notifications.filter((x) => x.id !== n.id);
      this.toast('Notification supprimee.');
    } catch (e) {
      this.toast((e as Error).message);
    } finally {
      this.cdr.detectChanges();
    }
  }

  protected async clearAllNotifications(): Promise<void> {
    if (!this.notifications.length) return;
    const ok = window.confirm('Supprimer toutes les notifications ?');
    if (!ok) return;
    try {
      await this.studentApi.deleteAllNotifications();
      this.notifications = [];
      this.toast('Toutes les notifications sont supprimees.');
    } catch (e) {
      this.toast((e as Error).message);
    } finally {
      this.cdr.detectChanges();
    }
  }

  private handleNotificationAnimations(
    next: StudentNotificationModel[],
    animateOnNew: boolean
  ): void {
    const previousTopId = this.lastNotificationId;
    const nextTopId = next.length ? Number(next[0]?.id ?? 0) : null;
    const hasNewTop =
      !!next.length &&
      this.notificationsBootstrapped &&
      previousTopId != null &&
      nextTopId != null &&
      nextTopId > previousTopId;

    this.lastNotificationId = nextTopId;
    if (!this.notificationsBootstrapped) {
      this.notificationsBootstrapped = true;
      return;
    }
    if (!animateOnNew || !hasNewTop) return;

    const first = next[0];
    this.notifBannerText = this.notificationLabel(first);
    this.notifBannerMeta = this.notificationDateLabel(first?.createdAt);
    this.notifScreenFlashActive = true;
    this.notifBannerActive = true;
    this.notifBellAnimate = true;
    this.notifBadgeAnimate = true;

    window.setTimeout(() => {
      this.notifScreenFlashActive = false;
      this.cdr.detectChanges();
    }, 1100);
    window.setTimeout(() => {
      this.notifBellAnimate = false;
      this.notifBadgeAnimate = false;
      this.cdr.detectChanges();
    }, 2400);
    window.setTimeout(() => {
      this.notifBannerActive = false;
      this.cdr.detectChanges();
    }, 3600);
  }

  protected async sendCoachTip(tip: string): Promise<void> {
    const q = tip.trim();
    if (!q || this.coachBusy) return;
    await this.runCoachTurn(q);
  }

  private initCoachMessages(): void {
    if (this.loadCoachFromStorage()) return;
    this.coachMessages = [
      {
        role: 'bot',
        text:
          'Hi! I am Jungle English Coach. Ask me in English about courses, chapters, quizzes, grammar, or speaking practice.'
      }
    ];
  }

  private loadCoachFromStorage(): boolean {
    try {
      const raw = localStorage.getItem(Student.LS_COACH);
      if (!raw) return false;
      const list = JSON.parse(raw) as Array<{ role?: string; text?: string }>;
      if (!Array.isArray(list) || !list.length) return false;
      this.coachMessages = list.map((m) => ({
        role: m.role === 'user' ? 'user' : 'bot',
        text: String(m.text ?? '')
      }));
      return true;
    } catch {
      return false;
    }
  }

  private saveCoachToStorage(): void {
    try {
      const items = this.coachMessages
        .filter((m) => m.text && m.text !== 'Typing...')
        .slice(-80)
        .map((m) => ({
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          text: m.text
        }));
      localStorage.setItem(Student.LS_COACH, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }

  /** Comme getApiHistory() dans student.html : historique lu depuis localStorage seulement (pas le tour en cours). */
  private coachHistoryForApi(): CoachChatMessage[] {
    try {
      const raw = localStorage.getItem(Student.LS_COACH);
      if (!raw) return [];
      const list = JSON.parse(raw) as Array<{ role?: string; text?: string }>;
      if (!Array.isArray(list)) return [];
      return list
        .slice(-12)
        .map((m): CoachChatMessage => ({
          role: m.role === 'user' ? 'user' : 'assistant',
          content: String(m.text ?? '').slice(0, 900)
        }))
        .filter((m) => m.content.trim().length > 0);
    } catch {
      return [];
    }
  }

  private async runCoachTurn(apiMessage: string, displayInChat?: string): Promise<void> {
    const history = this.coachHistoryForApi();
    const display = (displayInChat ?? apiMessage).trim();
    this.coachBusy = true;
    this.coachMessages = [
      ...this.coachMessages,
      { role: 'user', text: display },
      { role: 'bot', text: 'Typing...' }
    ];
    this.scrollCoachToBottom();
    this.cdr.detectChanges();
    try {
      const reply = await this.studentApi.postStudentCoach(apiMessage, history);
      this.replaceLastCoachBot(reply);
    } catch {
      this.replaceLastCoachBot(this.coachFallbackText());
    } finally {
      this.coachBusy = false;
      this.saveCoachToStorage();
      this.scrollCoachToBottom();
      this.cdr.detectChanges();
    }
  }

  private replaceLastCoachBot(text: string): void {
    const copy = [...this.coachMessages];
    for (let i = copy.length - 1; i >= 0; i--) {
      if (copy[i].role === 'bot') {
        copy[i] = { role: 'bot', text };
        break;
      }
    }
    this.coachMessages = copy;
  }

  private coachFallbackText(): string {
    return 'I cannot reach the coach service right now. Please try again in a few seconds, and keep your question in English.';
  }

  private scrollCoachToBottom(): void {
    window.setTimeout(() => {
      const el = this.coachChatBody?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    }, 0);
  }

  protected get selectedStudent(): StudentModel | undefined {
    return this.students.find((s) => s.id === this.selectedStudentId);
  }

  protected get fullName(): string {
    const s = this.selectedStudent;
    if (!s) return 'Student';
    return `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || 'Student';
  }

  protected get initials(): string {
    return this.fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((v) => v[0]?.toUpperCase() ?? '')
      .join('');
  }

  protected get greeting(): string {
    return this.fullName === 'Student' ? 'Hello, student' : `Hello, ${this.fullName}`;
  }

  protected get filteredLevels(): LevelModel[] {
    const q = this.searchTerm.trim().toLowerCase();
    let levels = this.allLevels;
    if (q) {
      levels = levels.filter((l) =>
        `${l.code ?? ''} ${l.name ?? ''}`.toLowerCase().includes(q)
      );
    }
    if (this.selectedSort === 'name') {
      return levels.slice().sort((a, b) => `${a.name ?? ''}`.localeCompare(`${b.name ?? ''}`));
    }
    return levels
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || (a.id ?? 0) - (b.id ?? 0));
  }

  protected get recentActivity(): HistoryTimelineItem[] {
    return this.timeline.slice(0, 2);
  }

  protected get progressLabel(): string {
    return `${this.progressPercent}% path explored`;
  }

  protected get parcoursLevel(): LevelModel | undefined {
    return this.allLevels.find((l) => l.id === this.parcoursLevelId);
  }

  protected get parcoursChaptersFiltered(): ChapterModel[] {
    const level = this.parcoursLevel;
    const list = (level?.chapters ?? []).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
    const q = this.parcoursChapterSearch.trim().toLowerCase();
    if (!q) return list;
    return list.filter((c) => (c.title ?? '').toLowerCase().includes(q));
  }

  protected get parcoursChapter(): ChapterModel | undefined {
    const level = this.parcoursLevel;
    if (!level || this.parcoursChapterId == null) return undefined;
    return (level.chapters ?? []).find((c) => c.id === this.parcoursChapterId);
  }

  protected get sortedLessons() {
    const ch = this.parcoursChapter;
    return (ch?.lessons ?? [])
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.id - b.id);
  }

  protected get parcoursChapterQuizzes(): QuizModel[] {
    const ch = this.parcoursChapter;
    if (!ch) return [];
    const list = Array.isArray(ch.quizzes) ? ch.quizzes.filter((q) => Number(q?.id) > 0) : [];
    const single = ch.quiz && Number(ch.quiz.id) > 0 ? [ch.quiz] : [];
    const merged = [...single, ...list];
    const seen = new Set<number>();
    const out: QuizModel[] = [];
    for (const q of merged) {
      const id = Number(q.id);
      if (!id || seen.has(id)) continue;
      seen.add(id);
      out.push(q);
    }
    return out;
  }

  protected get selectedParcoursQuiz(): QuizModel | null {
    const list = this.parcoursChapterQuizzes;
    if (!list.length) return null;
    if (this.selectedParcoursQuizId == null) return list[0] ?? null;
    const selectedId = Number(this.selectedParcoursQuizId);
    return list.find((q) => Number(q.id) === selectedId) ?? list[0] ?? null;
  }

  protected get levelCards() {
    const attempts = this.history?.quizAttempts ?? [];
    return this.filteredLevels.map((level, index) => {
      const chapters = level.chapters ?? [];
      const chapterIds = new Set(chapters.map((c) => c.id));
      const levelAttempts = attempts.filter(
        (a) =>
          String(a.levelCode ?? '').toUpperCase() === String(level.code ?? '').toUpperCase() &&
          chapterIds.has(Number(a.chapterId))
      );
      const attempted = new Set(levelAttempts.map((a) => Number(a.chapterId))).size;
      const chaptersCount = chapters.length;
      const lessonsCount = chapters.reduce((s, c) => s + (c.lessons?.length ?? 0), 0);
      const progress = chaptersCount ? Math.round((attempted / chaptersCount) * 100) : 0;
      const status = progress > 0 ? 'En cours' : index === 0 ? 'Debut' : 'Pas commence';
      const action = progress > 0 ? 'Continuer' : 'Commencer';
      return {
        id: level.id,
        code: level.code ?? '-',
        title: level.name ?? 'Niveau',
        chaptersCount,
        lessonsCount,
        progress,
        status,
        action,
        imageUrl: level.imageUrl ?? null
      };
    });
  }

  protected trackByLevelId(_: number, level: { id: number }): number {
    return level.id;
  }

  protected trackByChapterId(_: number, c: { id: number }): number {
    return c.id;
  }

  protected async setTab(tab: StudentMainTab): Promise<void> {
    this.activeTab = tab;
    this.courseDetailId = null;
    this.courseDetail = null;
    if (tab === 'parcours') {
      this.parcoursStep = 'levels';
      this.parcoursLevelId = null;
      this.parcoursChapterId = null;
    }
    if (tab === 'courses' && !this.coursesList.length) {
      await this.loadCoursesList();
    }
    if (tab === 'enrollments') {
      await this.refreshEnrollments();
    }
    if (tab === 'badges') {
      await this.refreshBadgesTab();
    }
    if (tab === 'quiz') {
      await this.prepareQuizTab();
    }
    this.cdr.detectChanges();
  }

  protected toggleDark(): void {
    this.darkTheme = !this.darkTheme;
    try {
      localStorage.setItem(Student.LS_DARK, this.darkTheme ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  protected resolveMediaUrl(url: string | undefined): string {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    const port = window.location.port;
    const origin =
      port === '4200' || port === '4300' ? 'http://localhost:8083' : '';
    return origin + (url.startsWith('/') ? url : `/${url}`);
  }

  protected async openLessonAndMarkComplete(lesson: LessonModel): Promise<void> {
    const target = this.resolveMediaUrl(lesson.url);
    const sid = this.selectedStudentId;
    const lid = Number(lesson.id);
    if (sid && lid > 0) {
      await this.studentApi.completeLesson(sid, lid).catch(() => void 0);
    }
    window.open(target, '_blank', 'noopener');
  }

  protected openParcoursLevel(levelId: number): void {
    this.parcoursLevelId = levelId;
    this.parcoursChapterSearch = '';
    this.parcoursStep = 'chapters';
    this.cdr.detectChanges();
  }

  protected backParcoursLevels(): void {
    this.parcoursStep = 'levels';
    this.parcoursLevelId = null;
    this.parcoursChapterId = null;
    this.cdr.detectChanges();
  }

  protected async openParcoursChapter(chapterId: number): Promise<void> {
    this.parcoursChapterId = chapterId;
    this.parcoursStep = 'detail';
    this.parcoursDetailPane = 'lessons';
    this.parcoursQuizAnswers = {};
    this.parcoursQuizMessage = '';
    this.resetParcoursQuizSession();
    await this.refreshParcoursChapterQuizzes(chapterId);
    this.selectedParcoursQuizId = Number(this.parcoursChapterQuizzes[0]?.id ?? 0) || null;
    await this.loadParcoursQuizQuestions();
    this.cdr.detectChanges();
  }

  protected async backParcoursChapters(): Promise<void> {
    await this.completeCurrentChapterLessons();
    this.parcoursStep = 'chapters';
    this.parcoursChapterId = null;
    this.selectedParcoursQuizId = null;
    this.parcoursQuizQuestions = [];
    this.parcoursQuizAnswers = {};
    this.parcoursQuizMessage = '';
    this.resetParcoursQuizSession();
    this.cdr.detectChanges();
  }

  protected async setParcoursPane(pane: 'lessons' | 'quiz'): Promise<void> {
    this.parcoursDetailPane = pane;
    if (pane === 'quiz') {
      if (this.parcoursChapterId != null) {
        await this.refreshParcoursChapterQuizzes(this.parcoursChapterId);
      }
      await this.loadParcoursQuizQuestions();
      this.startParcoursQuizSession();
    } else {
      this.stopParcoursQuizTimer();
      this.stopParcoursQuizCamera();
    }
    this.cdr.detectChanges();
  }

  protected async onParcoursQuizChange(): Promise<void> {
    this.parcoursQuizAnswers = {};
    this.parcoursQuizReviewMap = {};
    this.parcoursQuizMessage = '';
    this.resetParcoursQuizSession();
    await this.loadParcoursQuizQuestions();
    if (this.parcoursDetailPane === 'quiz') {
      this.startParcoursQuizSession();
    }
    this.cdr.detectChanges();
  }

  private async loadParcoursQuizQuestions(): Promise<void> {
    const selected = this.selectedParcoursQuiz;
    const qid = selected?.id;
    if (!qid) {
      this.parcoursQuizQuestions = [];
      return;
    }
    try {
      const meta = await this.studentApi.getQuiz(Number(qid));
      this.patchQuizMetaInCurrentChapter(meta);
    } catch {
      // keep existing metadata if dedicated quiz endpoint fails
    }
    const embedded = selected.questions;
    if (Array.isArray(embedded) && embedded.length) {
      this.parcoursQuizQuestions = embedded;
      return;
    }
    try {
      this.parcoursQuizQuestions = await this.studentApi.getQuizQuestions(qid);
    } catch {
      this.parcoursQuizQuestions = [];
    }
  }

  private patchQuizMetaInCurrentChapter(meta: QuizModel): void {
    const chapter = this.parcoursChapter;
    if (!chapter || !meta?.id) return;
    const id = Number(meta.id);
    if (chapter.quiz && Number(chapter.quiz.id) === id) {
      chapter.quiz = { ...chapter.quiz, ...meta };
    }
    if (Array.isArray(chapter.quizzes)) {
      const idx = chapter.quizzes.findIndex((q) => Number(q?.id) === id);
      if (idx >= 0) {
        chapter.quizzes[idx] = { ...chapter.quizzes[idx], ...meta };
      }
    }
  }

  private async refreshParcoursChapterQuizzes(chapterId: number): Promise<void> {
    try {
      const fetched = await this.studentApi.getChapterQuizzes(chapterId);
      const list = (Array.isArray(fetched) ? fetched : []).filter((q) => Number(q?.id) > 0);
      const level = this.parcoursLevel;
      if (!level?.chapters?.length) return;
      const chapter = level.chapters.find((c) => c.id === chapterId);
      if (!chapter) return;
      chapter.quizzes = list;
      if (!chapter.quiz && list.length) {
        chapter.quiz = list[0];
      }
      if (
        this.selectedParcoursQuizId == null ||
        !list.some((q) => Number(q.id) === Number(this.selectedParcoursQuizId))
      ) {
        this.selectedParcoursQuizId = Number(list[0]?.id ?? 0) || null;
      }
    } catch {
      // keep local embedded quiz data if dedicated endpoint fails
    }
  }

  private async completeCurrentChapterLessons(): Promise<void> {
    const sid = this.selectedStudentId;
    const lessonIds = this.sortedLessons.map((l) => Number(l.id)).filter((id) => id > 0);
    if (!sid || !lessonIds.length) return;
    await Promise.allSettled(lessonIds.map((lessonId) => this.studentApi.completeLesson(sid, lessonId)));
  }

  protected get parcoursQuizCurrent(): QuizQuestionModel | null {
    if (!this.parcoursQuizQuestions.length) return null;
    const idx = Math.min(this.parcoursQuizIndex, this.parcoursQuizQuestions.length - 1);
    return this.parcoursQuizQuestions[idx] ?? null;
  }

  protected get markedQuizQuestionIndexes(): number[] {
    return this.parcoursQuizQuestions
      .map((q, idx) => ({ idx, marked: !!this.parcoursQuizReviewMap[q.id] }))
      .filter((x) => x.marked)
      .map((x) => x.idx);
  }

  protected get quizReviewTodoCount(): number {
    return this.quizReviewTodoQuestionIds.length;
  }

  protected isCurrentQuizQuestionMarkedForReview(): boolean {
    const q = this.parcoursQuizCurrent;
    if (!q) return false;
    return !!this.parcoursQuizReviewMap[q.id];
  }

  protected toggleCurrentQuizQuestionReview(): void {
    const q = this.parcoursQuizCurrent;
    if (!q) return;
    const next = !this.parcoursQuizReviewMap[q.id];
    this.parcoursQuizReviewMap[q.id] = next;
    this.saveQuizReviewTodoSnapshot();
    this.cdr.detectChanges();
  }

  protected jumpToQuizQuestion(index: number): void {
    if (index < 0 || index >= this.parcoursQuizQuestions.length) return;
    this.parcoursQuizIndex = index;
  }

  protected isTrueFalseQuizQuestion(q: QuizQuestionModel | null): boolean {
    const t = String(q?.questionType ?? '').toUpperCase();
    return t === 'TRUE_FALSE';
  }

  protected setTrueFalseAnswer(questionId: number, value: 'true' | 'false'): void {
    this.parcoursQuizAnswers[questionId] = value;
  }

  protected get parcoursQuizProgressPercent(): number {
    if (!this.parcoursQuizQuestions.length) return 0;
    return Math.round(((this.parcoursQuizIndex + 1) / this.parcoursQuizQuestions.length) * 100);
  }

  protected get parcoursQuizRemainingLabel(): string {
    const sec = Math.max(0, this.parcoursQuizRemainingSec);
    const mm = String(Math.floor(sec / 60)).padStart(2, '0');
    const ss = String(sec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  protected get parcoursQuizCanPrev(): boolean {
    return this.parcoursQuizIndex > 0;
  }

  protected get parcoursQuizCanNext(): boolean {
    return this.parcoursQuizIndex < this.parcoursQuizQuestions.length - 1;
  }

  protected startParcoursQuizSession(): void {
    if (!this.parcoursQuizQuestions.length) return;
    this.parcoursQuizStarted = true;
    this.parcoursQuizIndex = 0;
    this.parcoursQuizMessage = '';
    this.parcoursQuizReviewMap = {};
    this.parcoursQuizSubmitting = false;
    this.parcoursQuizProctorAlert = '';
    this.parcoursQuizPhoneHits = 0;
    this.parcoursQuizPersonHits = 0;
    this.saveQuizReviewTodoSnapshot();
    this.startParcoursQuizTimer();
    void this.startParcoursQuizCamera();
    void this.startParcoursQuizDetection();
    this.attachQuizSecurityGuards();
  }

  protected parcoursQuizPrev(): void {
    if (this.parcoursQuizIndex > 0) this.parcoursQuizIndex--;
  }

  protected parcoursQuizNext(): void {
    if (this.parcoursQuizIndex < this.parcoursQuizQuestions.length - 1) this.parcoursQuizIndex++;
  }

  private startParcoursQuizTimer(): void {
    this.stopParcoursQuizTimer();
    const quizMeta = this.selectedParcoursQuiz as
      | { timeLimitSeconds?: number; timeLimitMinutes?: number }
      | null
      | undefined;
    const totalSec = Math.max(
      60,
      Number(quizMeta?.timeLimitSeconds ?? Number(quizMeta?.timeLimitMinutes ?? 10) * 60)
    );
    this.parcoursQuizRemainingSec = totalSec;
    this.parcoursQuizTimerId = window.setInterval(() => {
      this.parcoursQuizRemainingSec = Math.max(0, this.parcoursQuizRemainingSec - 1);
      if (this.parcoursQuizRemainingSec <= 0) {
        this.stopParcoursQuizTimer();
        if (!this.parcoursQuizSubmitting) {
          void this.submitParcoursQuiz();
        }
      }
      this.cdr.detectChanges();
    }, 1000);
  }

  private stopParcoursQuizTimer(): void {
    if (this.parcoursQuizTimerId != null) {
      window.clearInterval(this.parcoursQuizTimerId);
      this.parcoursQuizTimerId = null;
    }
  }

  private stopParcoursQuizDetection(): void {
    if (this.parcoursQuizDetectIntervalId != null) {
      window.clearInterval(this.parcoursQuizDetectIntervalId);
      this.parcoursQuizDetectIntervalId = null;
    }
  }

  private async ensureProctorModel(): Promise<any | null> {
    if (this.parcoursQuizDetectModel) return this.parcoursQuizDetectModel;
    const w = window as unknown as {
      cocoSsd?: { load: () => Promise<any> };
      tf?: unknown;
      cocoSsdModel?: any;
    };
    if (w.cocoSsdModel) {
      this.parcoursQuizDetectModel = w.cocoSsdModel;
      return this.parcoursQuizDetectModel;
    }
    try {
      await this.loadScriptOnce('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js', 'tf');
      await this.loadScriptOnce(
        'https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.3/dist/coco-ssd.min.js',
        'cocoSsd'
      );
      if (!w.cocoSsd?.load) return null;
      this.parcoursQuizProctorHint = 'Chargement detection telephone/personne...';
      this.parcoursQuizDetectModel = await w.cocoSsd.load();
      w.cocoSsdModel = this.parcoursQuizDetectModel;
      return this.parcoursQuizDetectModel;
    } catch {
      return null;
    }
  }

  private loadScriptOnce(src: string, key: 'tf' | 'cocoSsd'): Promise<void> {
    const w = window as unknown as Record<string, unknown>;
    if (w[key]) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[data-proctor="${key}"]`) as HTMLScriptElement | null;
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('script error')), { once: true });
        return;
      }
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.setAttribute('data-proctor', key);
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('script error'));
      document.head.appendChild(s);
    });
  }

  private async startParcoursQuizDetection(): Promise<void> {
    this.stopParcoursQuizDetection();
    this.parcoursQuizProctorHint = '';
    const model = await this.ensureProctorModel();
    if (!model) {
      this.parcoursQuizProctorHint =
        'Detection telephone/personne indisponible (reseau/CDN bloque).';
      this.cdr.detectChanges();
      return;
    }
    this.parcoursQuizProctorHint = 'Camera active - detection telephone/personne...';
    this.parcoursQuizDetectIntervalId = window.setInterval(async () => {
      if (!this.parcoursQuizStarted || this.parcoursQuizSubmitting) return;
      const video = this.quizCameraVideo?.nativeElement;
      if (!video || video.readyState < 2 || video.videoWidth < 10 || video.videoHeight < 10) return;
      try {
        const preds: Array<{ class?: string; score?: number }> = await model.detect(video);
        let phoneFound = false;
        let personCount = 0;
        for (const p of preds) {
          const c = String(p.class ?? '').toLowerCase();
          const s = Number(p.score ?? 0);
          if ((c.includes('cell phone') || c.includes('mobile phone')) && s >= 0.3) phoneFound = true;
          if (c === 'person' && s >= 0.55) personCount++;
        }

        if (phoneFound) {
          this.parcoursQuizPhoneHits++;
        } else {
          this.parcoursQuizPhoneHits = 0;
        }
        if (personCount > 1) {
          this.parcoursQuizPersonHits++;
        } else {
          this.parcoursQuizPersonHits = 0;
        }

        if (this.parcoursQuizPhoneHits >= 2) {
          this.parcoursQuizProctorAlert = 'Telephone detecte - quiz termine.';
          this.parcoursQuizPhoneHits = 0;
          this.terminateQuizForFraud('Telephone detecte pendant le quiz. Quiz termine et retour a l accueil.');
        } else if (this.parcoursQuizPersonHits >= 2) {
          this.parcoursQuizProctorAlert = 'Deuxieme personne detectee - quiz termine.';
          this.parcoursQuizPersonHits = 0;
          this.terminateQuizForFraud('Deuxieme personne detectee pendant le quiz. Quiz termine et retour a l accueil.');
        }
        this.cdr.detectChanges();
      } catch {
        this.parcoursQuizProctorHint = 'Detection indisponible temporairement.';
      }
    }, 1000);
  }

  protected async startParcoursQuizCamera(): Promise<void> {
    this.stopParcoursQuizCamera();
    this.parcoursQuizCameraReady = false;
    this.parcoursQuizCameraLabel = 'Camera non active';
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        this.parcoursQuizCameraLabel = 'Camera indisponible';
        return;
      }
      await this.refreshQuizCameraDevices();
      const videoConstraints = this.selectedQuizCameraDeviceId
        ? ({ deviceId: { exact: this.selectedQuizCameraDeviceId } } as MediaTrackConstraints)
        : undefined;
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      this.parcoursQuizMediaStream = stream;
      const video = this.quizCameraVideo?.nativeElement;
      if (video) {
        video.srcObject = stream;
        await video.play().catch(() => void 0);
      }
      const track = stream.getVideoTracks()[0];
      this.parcoursQuizCameraLabel = track?.label || 'Camera active';
      if (!this.selectedQuizCameraDeviceId && track?.getSettings()?.deviceId) {
        this.selectedQuizCameraDeviceId = String(track.getSettings().deviceId);
      }
      this.parcoursQuizCameraReady = true;
    } catch {
      this.parcoursQuizCameraLabel = 'Permission camera refusee';
      this.parcoursQuizCameraReady = false;
    }
    this.cdr.detectChanges();
  }

  protected async refreshQuizCameraDevices(): Promise<void> {
    try {
      if (!navigator.mediaDevices?.enumerateDevices) return;
      const list = await navigator.mediaDevices.enumerateDevices();
      this.quizCameraDevices = list.filter((d) => d.kind === 'videoinput');
      if (
        this.selectedQuizCameraDeviceId &&
        !this.quizCameraDevices.some((d) => d.deviceId === this.selectedQuizCameraDeviceId)
      ) {
        this.selectedQuizCameraDeviceId = '';
      }
    } catch {
      this.quizCameraDevices = [];
    }
  }

  protected async onQuizCameraDeviceChange(): Promise<void> {
    await this.startParcoursQuizCamera();
  }

  private stopParcoursQuizCamera(): void {
    if (this.parcoursQuizMediaStream) {
      this.parcoursQuizMediaStream.getTracks().forEach((t) => t.stop());
      this.parcoursQuizMediaStream = null;
    }
    const video = this.quizCameraVideo?.nativeElement;
    if (video) video.srcObject = null;
    this.parcoursQuizCameraReady = false;
  }

  private resetParcoursQuizSession(): void {
    this.parcoursQuizStarted = false;
    this.parcoursQuizIndex = 0;
    this.parcoursQuizSubmitting = false;
    this.parcoursQuizRemainingSec = 0;
    this.parcoursQuizProctorHint = '';
    this.parcoursQuizProctorAlert = '';
    this.parcoursQuizReviewMap = {};
    this.parcoursQuizPhoneHits = 0;
    this.parcoursQuizPersonHits = 0;
    this.stopParcoursQuizTimer();
    this.stopParcoursQuizCamera();
    this.stopParcoursQuizDetection();
    this.detachQuizSecurityGuards();
  }

  protected async submitParcoursQuiz(): Promise<void> {
    const sid = this.selectedStudentId;
    const qid = this.selectedParcoursQuiz?.id;
    if (!sid || !qid) {
      this.toast('Choisissez un etudiant et un quiz valide.');
      return;
    }
    const answers = this.parcoursQuizQuestions.map((q) => ({
      questionId: q.id,
      answerText: (this.parcoursQuizAnswers[q.id] ?? '').trim()
    }));
    this.parcoursQuizBusy = true;
    this.parcoursQuizSubmitting = true;
    this.parcoursQuizMessage = '';
    try {
      const r = await this.studentApi.postQuizAttempt({ studentId: sid, quizId: qid, answers });
      const latest = await this.studentApi.getLatestQuizAttempt(sid, qid).catch(() => null);
      const scorePercent = Number.isFinite(Number(latest?.scorePercent))
        ? Number(latest?.scorePercent)
        : Number.isFinite(Number(r.scorePercent))
          ? Number(r.scorePercent)
          : this.estimateScorePercentFromAnswers();
      const pointsEarned = Number.isFinite(Number(latest?.pointsEarned))
        ? Number(latest?.pointsEarned)
        : Number.isFinite(Number(r.pointsEarned))
          ? Number(r.pointsEarned)
          : 0;
      const passed = typeof r.passed === 'boolean' ? r.passed : scorePercent >= 50;
      const resultText = `${passed ? 'Reussi' : 'Echec'} — ${Math.round(scorePercent)}% · +${pointsEarned} pts`;
      this.parcoursQuizMessage = resultText;
      this.saveQuizReviewTodoSnapshot();
      await this.loadStudentData(sid);
      this.toast(resultText);
      this.parcoursQuizStepResetToHome();
    } catch (e) {
      this.parcoursQuizMessage = (e as Error).message;
    } finally {
      this.parcoursQuizBusy = false;
      this.parcoursQuizSubmitting = false;
      this.stopParcoursQuizTimer();
      this.stopParcoursQuizCamera();
      this.stopParcoursQuizDetection();
      this.parcoursQuizStarted = false;
      this.detachQuizSecurityGuards();
      this.cdr.detectChanges();
    }
  }

  private estimateScorePercentFromAnswers(): number {
    if (!this.parcoursQuizQuestions.length) return 0;
    const answered = this.parcoursQuizQuestions.filter((q) => String(this.parcoursQuizAnswers[q.id] ?? '').trim()).length;
    return Math.round((answered / this.parcoursQuizQuestions.length) * 100);
  }

  private terminateQuizForFraud(reason: string): void {
    this.stopParcoursQuizDetection();
    this.stopParcoursQuizTimer();
    this.stopParcoursQuizCamera();
    this.detachQuizSecurityGuards();
    this.parcoursQuizStarted = false;
    this.parcoursQuizSubmitting = false;
    this.parcoursQuizBusy = false;
    this.parcoursQuizStepResetToHome();
    this.parcoursQuizMessage = reason;
    this.toast(reason);
    this.cdr.detectChanges();
  }

  private attachQuizSecurityGuards(): void {
    if (this.quizAntiCheatBound) return;
    document.addEventListener('copy', this.quizAntiCheatClipboardHandler, true);
    document.addEventListener('cut', this.quizAntiCheatClipboardHandler, true);
    document.addEventListener('paste', this.quizAntiCheatClipboardHandler, true);
    document.addEventListener('visibilitychange', this.quizAntiCheatVisibilityHandler, true);
    this.quizAntiCheatBound = true;
  }

  private detachQuizSecurityGuards(): void {
    if (!this.quizAntiCheatBound) return;
    document.removeEventListener('copy', this.quizAntiCheatClipboardHandler, true);
    document.removeEventListener('cut', this.quizAntiCheatClipboardHandler, true);
    document.removeEventListener('paste', this.quizAntiCheatClipboardHandler, true);
    document.removeEventListener('visibilitychange', this.quizAntiCheatVisibilityHandler, true);
    this.quizAntiCheatBound = false;
  }

  private parcoursQuizStepResetToHome(): void {
    this.activeTab = 'parcours';
    this.parcoursStep = 'levels';
    this.parcoursLevelId = null;
    this.parcoursChapterId = null;
    this.parcoursDetailPane = 'lessons';
  }

  protected async openQuizReviewTodo(): Promise<void> {
    const levelId = this.quizReviewTodoLevelId;
    const chapterId = this.quizReviewTodoChapterId;
    if (!levelId || !chapterId || !this.quizReviewTodoQuestionIds.length) {
      this.toast('Aucune question marquee pour review.');
      return;
    }
    this.activeTab = 'parcours';
    this.parcoursLevelId = levelId;
    this.parcoursChapterId = chapterId;
    this.parcoursStep = 'detail';
    this.parcoursDetailPane = 'quiz';
    if (this.quizReviewTodoQuizId) {
      this.selectedParcoursQuizId = this.quizReviewTodoQuizId;
    }
    await this.loadParcoursQuizQuestions();
    this.startParcoursQuizSession();
    const firstId = this.quizReviewTodoQuestionIds[0];
    const idx = this.parcoursQuizQuestions.findIndex((q) => Number(q.id) === Number(firstId));
    if (idx >= 0) this.parcoursQuizIndex = idx;
    this.cdr.detectChanges();
  }

  private saveQuizReviewTodoSnapshot(): void {
    const ids = this.parcoursQuizQuestions
      .filter((q) => !!this.parcoursQuizReviewMap[q.id])
      .map((q) => Number(q.id))
      .filter((id) => id > 0);
    this.quizReviewTodoQuestionIds = ids;
    this.quizReviewTodoLevelId = this.parcoursLevelId;
    this.quizReviewTodoChapterId = this.parcoursChapterId;
    this.quizReviewTodoQuizId = Number(this.selectedParcoursQuiz?.id ?? 0) || null;
  }

  protected async loadCoursesList(): Promise<void> {
    this.coursesLoadError = '';
    try {
      const list = await this.studentApi.getCourses();
      this.coursesList = (Array.isArray(list) ? list : []).filter(
        (c) => String(c.status ?? '').toUpperCase() === 'ACTIVE'
      );
    } catch (e) {
      this.coursesLoadError = (e as Error).message;
      this.coursesList = [];
    }
    this.cdr.detectChanges();
  }

  protected async openCourseDetail(courseId: number): Promise<void> {
    this.activeTab = 'courses';
    this.courseDetailId = courseId;
    this.courseDetail = null;
    this.courseMaterials = [];
    try {
      const [c, mats] = await Promise.all([
        this.studentApi.getCourse(courseId),
        this.studentApi.getCourseMaterials(courseId).catch(() => [])
      ]);
      this.courseDetail = c;
      this.courseMaterials = Array.isArray(mats) ? mats : [];
    } catch (e) {
      this.toast((e as Error).message);
      this.courseDetailId = null;
    }
    this.cdr.detectChanges();
  }

  protected backFromCourseDetail(): void {
    this.courseDetailId = null;
    this.courseDetail = null;
    this.courseMaterials = [];
  }

  protected async enrollCurrentCourse(): Promise<void> {
    const sid = this.selectedStudentId;
    const cid = this.courseDetail?.id;
    if (!sid || !cid) {
      this.toast('Selection invalide.');
      return;
    }
    try {
      await this.studentApi.postEnrollment({
        studentId: sid,
        courseId: cid,
        status: 'ACTIVE',
        completionPercentage: 0
      });
      this.toast('Inscription enregistree.');
      await this.refreshEnrollments();
      await this.loadStudentData(sid);
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected async refreshEnrollments(): Promise<void> {
    const sid = this.selectedStudentId;
    if (!sid) {
      this.enrollmentsRows = [];
      return;
    }
    try {
      const rows = await this.studentApi.getEnrollments(sid);
      this.enrollmentsRows = Array.isArray(rows) ? rows : [];
    } catch {
      this.enrollmentsRows = [];
    }
    this.cdr.detectChanges();
  }

  protected async refreshBadgesTab(): Promise<void> {
    const sid = this.selectedStudentId;
    if (!sid) {
      this.badgesTabList = [];
      return;
    }
    try {
      const b = await this.studentApi.getBadges(sid);
      this.badgesTabList = Array.isArray(b) ? b : [];
    } catch {
      this.badgesTabList = [];
    }
    this.cdr.detectChanges();
  }

  protected get nextBadgeTier(): BadgeTier | null {
    const pts = Number(this.points ?? 0);
    return this.badgeTiers.find((t) => pts < t.points) ?? null;
  }

  protected get badgeProgressText(): string {
    const pts = Number(this.points ?? 0);
    const next = this.nextBadgeTier;
    if (!next) return 'Felicitations ! Tous les badges sont debloques.';
    const remaining = Math.max(0, next.points - pts);
    return `Vous avez ${pts} points. Il vous en reste ${remaining} pour debloquer le badge ${next.badgeName}.`;
  }

  protected get earnedBadgeCards(): Array<{ tier: BadgeTier; badge: BadgeModel | null }> {
    const byLevel = new Map<string, BadgeModel>();
    for (const b of this.badgesTabList) {
      const lvl = String(b.badgeLevel ?? '').toUpperCase();
      if (lvl) byLevel.set(lvl, b);
    }
    return this.badgeTiers
      .filter((t) => byLevel.has(t.badgeLevel))
      .map((tier) => ({ tier, badge: byLevel.get(tier.badgeLevel) ?? null }));
  }

  protected get lockedBadgeCards(): BadgeTier[] {
    const unlocked = new Set(this.earnedBadgeCards.map((x) => x.tier.badgeLevel));
    return this.badgeTiers.filter((t) => !unlocked.has(t.badgeLevel));
  }

  protected badgeCertificateUrl(badge: BadgeModel | null | undefined): string {
    const id = Number(badge?.id ?? 0);
    if (!id) return '#';
    return `${this.backendApiOrigin()}/api/badges/${id}/certificate`;
  }

  protected badgeCertificateDownloadUrl(badge: BadgeModel | null | undefined): string {
    const base = this.badgeCertificateUrl(badge);
    if (base === '#') return '#';
    return `${base}?ts=${Date.now()}`;
  }

  protected badgeShareUrl(badge: BadgeModel | null | undefined): string {
    const base = this.badgeCertificateUrl(badge);
    if (base === '#') return '#';
    return base;
  }

  private backendApiOrigin(): string {
    const port = window.location.port;
    if (port === '4200' || port === '4300') return 'http://localhost:8083';
    return '';
  }

  protected badgeShareLink(
    network: 'facebook' | 'linkedin' | 'whatsapp' | 'x',
    badge: BadgeModel | null | undefined,
    tier: { badgeName: string }
  ): string {
    const shareUrl = this.badgeShareUrl(badge);
    if (shareUrl === '#') return '#';
    const text = encodeURIComponent(`Mon badge: ${badge?.badgeName || tier.badgeName}`);
    const u = encodeURIComponent(shareUrl);
    if (network === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    if (network === 'linkedin') return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    if (network === 'whatsapp') return `https://wa.me/?text=${text}%20${u}`;
    return `https://twitter.com/intent/tweet?text=${text}&url=${u}`;
  }

  protected async copyBadgeShareLink(badge: BadgeModel | null | undefined): Promise<void> {
    const link = this.badgeShareUrl(badge);
    if (link === '#') {
      this.toast('Lien de partage indisponible.');
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      this.toast('Lien copie.');
    } catch {
      this.toast('Copie impossible.');
    }
  }

  protected async downloadBadgeCertificate(badge: BadgeModel | null | undefined, fallbackName: string): Promise<void> {
    const url = this.badgeCertificateDownloadUrl(badge);
    if (url === '#') {
      this.toast('Certificat indisponible.');
      return;
    }
    try {
      const response = await fetch(url, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const contentType = String(response.headers.get('content-type') || '').toLowerCase();
      if (contentType && !contentType.includes('application/pdf')) {
        throw new Error('Not a PDF');
      }
      const bytes = await response.arrayBuffer();
      if (!bytes || bytes.byteLength < 100) {
        throw new Error('PDF vide');
      }
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const safe = String(fallbackName || 'Badge').replace(/[^a-zA-Z0-9_-]+/g, '_');
      a.download = `Certificate_${safe}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(blobUrl), 15000);
      this.toast('Telechargement du certificat demarre.');
    } catch {
      window.open(url, '_blank', 'noopener');
    }
  }

  protected async updateEnrollmentProgress(row: EnrollmentRowModel): Promise<void> {
    const sid = this.selectedStudentId;
    if (!sid) return;
    const raw = window.prompt('Nouveau % (0-100)', String(row.completionPercentage ?? 0));
    if (raw == null) return;
    const pct = Math.min(100, Math.max(0, parseFloat(raw) || 0));
    try {
      await this.studentApi.putEnrollment(row.id, {
        status: 'ACTIVE',
        completionPercentage: pct,
        finalGrade: null
      });
      await this.refreshEnrollments();
      await this.loadStudentData(sid);
      this.toast('Progression mise a jour.');
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected async prepareQuizTab(): Promise<void> {
    if (!this.coursesList.length) {
      await this.loadCoursesList();
    }
    this.quizCourses = this.coursesList;
    this.selectedQuizCourseId = null;
    this.catalogQuestions = [];
    this.catalogAnswers = {};
    this.cdr.detectChanges();
  }

  protected async onQuizCourseChange(): Promise<void> {
    const id = this.selectedQuizCourseId;
    if (!id) {
      this.catalogQuestions = [];
      return;
    }
    try {
      const q = await this.studentApi.getCatalogQuestions(id);
      this.catalogQuestions = Array.isArray(q) ? q : [];
      this.catalogAnswers = {};
    } catch {
      this.catalogQuestions = [];
    }
    this.cdr.detectChanges();
  }

  protected async submitCatalogQuiz(): Promise<void> {
    const sid = this.selectedStudentId;
    if (!sid) {
      this.toast('Choisissez un etudiant.');
      return;
    }
    this.catalogBusy = true;
    try {
      for (const q of this.catalogQuestions) {
        const text = (this.catalogAnswers[q.id] ?? '').trim();
        if (!text) continue;
        await this.studentApi.postResponse({
          studentId: sid,
          questionId: q.id,
          answerText: text
        });
      }
      this.toast('Reponses enregistrees.');
      await this.loadStudentData(sid);
    } catch (e) {
      this.toast((e as Error).message);
    } finally {
      this.catalogBusy = false;
      this.cdr.detectChanges();
    }
  }

  protected async onStudentChange(): Promise<void> {
    if (this.selectedStudentId != null) {
      try {
        localStorage.setItem(Student.LS_STUDENT, String(this.selectedStudentId));
      } catch {
        /* ignore */
      }
      await this.loadStudentData(this.selectedStudentId);
      if (this.activeTab === 'enrollments') await this.refreshEnrollments();
      if (this.activeTab === 'badges') await this.refreshBadgesTab();
    }
  }

  private toast(msg: string): void {
    this.toastText = msg;
    window.setTimeout(() => {
      this.toastText = '';
      this.cdr.detectChanges();
    }, 3200);
  }

  private async initializeDashboard(): Promise<void> {
    this.initialBusy = true;
    this.errorMessage = '';
    const guard = window.setTimeout(() => {
      if (this.initialBusy) {
        this.initialBusy = false;
        if (!this.errorMessage) {
          this.errorMessage = 'Chargement trop long. Verifiez le backend (port 8083) et npm start avec proxy.';
        }
        this.cdr.detectChanges();
      }
    }, Student.LOAD_GUARD_MS);

    try {
      const [studentsResult, levelsResult] = await Promise.allSettled([
        this.studentApi.getStudents(),
        this.studentApi.getPedagogyTree()
      ]);

      this.students =
        studentsResult.status === 'fulfilled' && Array.isArray(studentsResult.value)
          ? studentsResult.value
          : [];
      this.allLevels =
        levelsResult.status === 'fulfilled' && Array.isArray(levelsResult.value)
          ? levelsResult.value
          : [];
      this.totalLevels = this.allLevels.length;

      if (!this.students.length) {
        this.errorMessage = 'Impossible de charger les etudiants depuis l API.';
        return;
      }

      let saved: string | null = null;
      try {
        saved = localStorage.getItem(Student.LS_STUDENT);
      } catch {
        saved = null;
      }
      const savedId = saved ? Number(saved) : NaN;
      const bySaved = Number.isFinite(savedId)
        ? this.students.find((s) => s.id === savedId)
        : undefined;
      this.selectedStudentId =
        bySaved?.id ?? this.pickDefaultStudent(this.students) ?? this.students[0]!.id;

      if (this.selectedStudentId != null) {
        await this.loadStudentData(this.selectedStudentId);
      }
    } catch (error) {
      this.errorMessage =
        (error as { message?: string })?.message ??
        'Erreur pendant le chargement du dashboard etudiant.';
    } finally {
      clearTimeout(guard);
      this.initialBusy = false;
      this.cdr.detectChanges();
    }
  }

  private async loadStudentData(studentId: number): Promise<void> {
    try {
      const [historyResult, pointsResult, badgesResult] = await Promise.allSettled([
        this.studentApi.getHistory(studentId),
        this.studentApi.getPoints(studentId),
        this.studentApi.getBadges(studentId)
      ]);

      const history: HistoryModel =
        historyResult.status === 'fulfilled'
          ? (historyResult.value ?? {})
          : { summary: {}, timeline: [], enrollments: [], quizAttempts: [] };
      const points = pointsResult.status === 'fulfilled' ? pointsResult.value : { totalPoints: 0 };
      const badges = badgesResult.status === 'fulfilled' ? badgesResult.value : [];

      if (
        historyResult.status === 'rejected' &&
        pointsResult.status === 'rejected' &&
        badgesResult.status === 'rejected'
      ) {
        this.errorMessage = 'API indisponible. Verifiez le backend (localhost:8083).';
      }

      this.history = history;
      this.timeline = history.timeline ?? [];
      this.points = Number(points.totalPoints ?? 0);
      this.currentBadge = this.resolveBadgeLabel(Array.isArray(badges) ? badges : []);

      const enrollments = history.enrollments ?? [];
      const enrollmentsCount = history.summary?.totalEnrollments ?? enrollments.length;
      this.coursesStarted = Number(enrollmentsCount ?? 0);
      this.coursesCompleted = Number(history.summary?.coursesCompleted ?? 0);
      this.quizzesTaken = Number(
        (history.summary?.totalQuizAttempts ?? 0) + (history.summary?.totalCatalogResponses ?? 0)
      );
      this.averageQuizScore = Number(history.summary?.averageQuizScorePercent ?? 0);
      this.pendingLevels = Math.max(0, this.totalLevels - this.coursesCompleted);
      this.progressPercent = this.computeProgressPercent(enrollments);
    } catch (error) {
      this.errorMessage =
        (error as { message?: string })?.message ?? 'Impossible de charger les donnees etudiant.';
    }
    this.cdr.detectChanges();
  }

  private pickDefaultStudent(students: StudentModel[]): number | null {
    const firstNonTest = students.find((student) => {
      const value = `${student.firstName ?? ''} ${student.lastName ?? ''}`.toLowerCase();
      return !value.includes('test');
    });
    return firstNonTest?.id ?? students[0]?.id ?? null;
  }

  private resolveBadgeLabel(badges: BadgeModel[]): string {
    if (!badges?.length) {
      return this.points >= 150 ? 'Gold Master' : this.points >= 100 ? 'Silver Achiever' : 'Beginner';
    }
    const rank: Record<string, number> = { BRONZE: 1, SILVER: 2, GOLD: 3, PLATINUM: 4 };
    const sorted = badges
      .slice()
      .sort((a, b) => (rank[b.badgeLevel ?? ''] ?? 0) - (rank[a.badgeLevel ?? ''] ?? 0));
    return sorted[0]?.badgeName ?? sorted[0]?.badgeLevel ?? 'Badge';
  }

  private computeProgressPercent(enrollments: Array<{ completionPercentage?: number }>): number {
    if (!enrollments.length) return 0;
    const total = enrollments.reduce(
      (sum, e) => sum + Math.max(0, Math.min(100, Number(e.completionPercentage ?? 0))),
      0
    );
    return Math.round(total / enrollments.length);
  }
}
