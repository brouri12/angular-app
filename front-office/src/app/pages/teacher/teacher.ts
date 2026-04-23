import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TeacherApiService,
  TeacherCourseModel,
  TeacherEnrollmentModel,
  TeacherLevelModel,
  TeacherLessonModel,
  TeacherMaterialModel,
  TeacherChapterModel,
  TeacherQuizModel,
  TeacherQuestionModel
} from './teacher-api.service';

type TeacherTab = 'dashboard' | 'pedagogy' | 'courses' | 'questions' | 'materials' | 'enrollments';

@Component({
  selector: 'app-teacher',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './teacher.html',
  styleUrl: './teacher.css'
})
export class Teacher implements OnInit {
  protected activeTab: TeacherTab = 'dashboard';
  protected darkTheme = false;
  protected toastText = '';
  protected busy = false;

  protected courses: TeacherCourseModel[] = [];
  protected enrollments: TeacherEnrollmentModel[] = [];
  protected responsesCount = 0;
  protected levels: TeacherLevelModel[] = [];
  protected levelSearch = '';
  protected levelPage = 1;
  protected readonly levelPageSize = 6;
  protected selectedLevelId: number | null = null;
  protected chapters: TeacherChapterModel[] = [];
  protected selectedChapterId: number | null = null;
  protected lessons: TeacherLessonModel[] = [];
  protected chapterQuizzes: TeacherQuizModel[] = [];
  protected selectedChapterQuizId: number | null = null;
  protected chapterQuiz: TeacherQuizModel | null = null;
  protected chapterQuizQuestions: TeacherQuestionModel[] = [];

  protected selectedQuestionCourseId: number | null = null;
  protected questions: TeacherQuestionModel[] = [];

  protected selectedMaterialCourseId: number | null = null;
  protected materials: TeacherMaterialModel[] = [];

  protected editCourseId: number | null = null;
  protected courseForm = {
    courseCode: '',
    title: '',
    teacherName: '',
    price: 0,
    level: 'BEGINNER',
    durationHours: 40,
    status: 'ACTIVE',
    description: ''
  };

  protected editQuestionId: number | null = null;
  protected questionForm = {
    questionText: '',
    questionType: 'OPEN_TEXT',
    correctAnswer: '',
    points: 10
  };

  protected editMaterialId: number | null = null;
  protected materialForm = {
    title: '',
    type: 'PDF',
    url: ''
  };

  protected editLevelId: number | null = null;
  protected levelForm = { code: '', name: '', imageUrl: '' };
  protected editChapterId: number | null = null;
  protected chapterForm = { title: '' };
  protected editLessonId: number | null = null;
  protected lessonForm = { title: '', type: 'VIDEO', url: '', durationMinutes: 10 };
  protected lessonUploadBusy = false;
  protected quizForm = { title: '', passingScorePercent: 50, timeLimitMinutes: 15, maxAttempts: 3 };
  protected quizQuestionEditId: number | null = null;
  protected quizQuestionForm = {
    questionText: '',
    questionType: 'MULTIPLE_CHOICE',
    correctAnswer: '',
    optionsText: '',
    explanation: '',
    points: 10,
    orderNumber: 0
  };

  constructor(private readonly api: TeacherApiService) {}

  async ngOnInit(): Promise<void> {
    try {
      this.darkTheme = localStorage.getItem('teacherDarkTheme') === '1';
    } catch {
      this.darkTheme = false;
    }
    await this.loadDashboard();
  }

  protected async setTab(tab: TeacherTab): Promise<void> {
    this.activeTab = tab;
    if (tab === 'dashboard') await this.loadDashboard();
    if (tab === 'pedagogy') await this.loadPedagogy();
    if (tab === 'courses' && !this.courses.length) await this.loadCourses();
    if (tab === 'questions') {
      if (!this.courses.length) await this.loadCourses();
      await this.loadQuestions();
    }
    if (tab === 'materials') {
      if (!this.courses.length) await this.loadCourses();
      await this.loadMaterials();
    }
    if (tab === 'enrollments') await this.loadEnrollments();
  }

  protected toggleDark(): void {
    this.darkTheme = !this.darkTheme;
    try {
      localStorage.setItem('teacherDarkTheme', this.darkTheme ? '1' : '0');
    } catch {
      // ignore
    }
  }

  protected async loadDashboard(): Promise<void> {
    this.busy = true;
    try {
      const [courses, responses, enrollments] = await Promise.all([
        this.api.getCourses().catch(() => []),
        this.api.getResponses().catch(() => []),
        this.api.getEnrollments().catch(() => [])
      ]);
      this.courses = this.sortByIdDesc(Array.isArray(courses) ? courses : []);
      this.responsesCount = Array.isArray(responses) ? responses.length : 0;
      this.enrollments = this.sortByIdDesc(Array.isArray(enrollments) ? enrollments : []);
    } finally {
      this.busy = false;
    }
  }

  protected get filteredLevels(): TeacherLevelModel[] {
    const q = this.levelSearch.trim().toLowerCase();
    const base = !q
      ? this.levels
      : this.levels.filter((l) => `${l.code ?? ''} ${l.name ?? ''}`.toLowerCase().includes(q));
    return this.sortByIdDesc(base);
  }

  protected get pagedLevels(): TeacherLevelModel[] {
    const start = (this.levelPage - 1) * this.levelPageSize;
    return this.filteredLevels.slice(start, start + this.levelPageSize);
  }

  protected get levelsPagesCount(): number {
    return Math.max(1, Math.ceil(this.filteredLevels.length / this.levelPageSize));
  }

  protected async loadPedagogy(): Promise<void> {
    this.levels = this.sortByIdDesc(await this.api.getLevels().catch(() => []));
    if (this.levelPage > this.levelsPagesCount) this.levelPage = this.levelsPagesCount;
    // Toujours garder un niveau sélectionné quand il existe,
    // sinon "Nouveau chapitre" ne peut pas fonctionner.
    if (this.levels.length) {
      const selectedExists = this.selectedLevelId != null && this.levels.some((l) => l.id === this.selectedLevelId);
      if (!selectedExists) {
        this.selectedLevelId = this.levels[0]!.id;
        this.selectedChapterId = null;
      }
      await this.loadChapters();
    } else {
      this.selectedLevelId = null;
      this.selectedChapterId = null;
      this.chapters = [];
      this.lessons = [];
      this.chapterQuiz = null;
      this.chapterQuizQuestions = [];
    }

    if (this.selectedChapterId != null && this.chapters.some((c) => c.id === this.selectedChapterId)) {
      await this.loadLessonsAndQuiz();
    } else {
      this.selectedChapterId = null;
      this.lessons = [];
      this.chapterQuiz = null;
      this.chapterQuizQuestions = [];
    }
  }

  protected async saveLevel(): Promise<void> {
    if (!this.levelForm.code.trim() || !this.levelForm.name.trim()) {
      this.toast('Code et nom du niveau requis.');
      return;
    }
    try {
      const wasEdit = this.editLevelId != null;
      let createdId: number | null = null;
      if (this.editLevelId) {
        await this.api.updateLevel(this.editLevelId, this.levelForm);
        this.toast('Niveau modifie.');
      } else {
        const created = await this.api.createLevel(this.levelForm);
        createdId = Number(created?.id ?? 0) || null;
        this.levelSearch = '';
        this.toast('Niveau ajoute.');
      }
      this.resetLevelForm();
      await this.loadPedagogy();
      if (!wasEdit) {
        this.levelPage = 1;
        if (createdId) {
          await this.openLevel(createdId);
        }
      }
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditLevel(level: TeacherLevelModel): void {
    this.editLevelId = level.id;
    this.levelForm = {
      code: level.code ?? '',
      name: level.name ?? '',
      imageUrl: level.imageUrl ?? ''
    };
  }


  protected async deleteLevel(level: TeacherLevelModel): Promise<void> {
    if (!window.confirm('Supprimer ce niveau ?')) return;
    try {
      await this.api.deleteLevel(level.id);
      if (this.selectedLevelId === level.id) {
        this.selectedLevelId = null;
        this.selectedChapterId = null;
        this.chapters = [];
        this.lessons = [];
      }
      this.toast('Niveau supprime.');
      await this.loadPedagogy();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetLevelForm(): void {
    this.editLevelId = null;
    this.levelForm = { code: '', name: '', imageUrl: '' };
  }

  protected async openLevel(levelId: number): Promise<void> {
    this.selectedLevelId = levelId;
    this.selectedChapterId = null;
    this.editChapterId = null;
    this.editLessonId = null;
    this.chapterForm = { title: '' };
    this.lessonForm = { title: '', type: 'VIDEO', url: '', durationMinutes: 10 };
    await this.loadChapters();
  }

  protected async loadChapters(): Promise<void> {
    if (!this.selectedLevelId) {
      this.chapters = [];
      return;
    }
    this.chapters = this.sortByIdDesc(await this.api.getChapters(this.selectedLevelId).catch(() => []));
  }

  protected async saveChapter(): Promise<void> {
    if (!this.selectedLevelId) {
      this.toast('Choisir un niveau.');
      return;
    }
    const title = this.chapterForm.title.trim();
    if (!title) {
      this.toast('Titre chapitre requis.');
      return;
    }
    try {
      let createdId: number | null = null;
      if (this.editChapterId) {
        await this.api.updateChapter(this.editChapterId, { title, sortOrder: 0 });
        this.toast('Chapitre modifie.');
      } else {
        const created = await this.api.createChapter(this.selectedLevelId, { title, sortOrder: 0 });
        createdId = Number(created?.id ?? 0) || null;
        this.toast('Chapitre ajoute.');
      }
      this.resetChapterForm();
      await this.loadChapters();
      if (createdId) {
        await this.openChapter(createdId);
      }
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditChapter(ch: TeacherChapterModel): void {
    this.editChapterId = ch.id;
    this.chapterForm = { title: ch.title ?? '' };
  }

  protected async deleteChapter(ch: TeacherChapterModel): Promise<void> {
    if (!window.confirm('Supprimer ce chapitre ?')) return;
    try {
      await this.api.deleteChapter(ch.id);
      if (this.selectedChapterId === ch.id) {
        this.selectedChapterId = null;
        this.lessons = [];
        this.chapterQuizzes = [];
        this.selectedChapterQuizId = null;
        this.chapterQuiz = null;
        this.chapterQuizQuestions = [];
      }
      this.toast('Chapitre supprime.');
      await this.loadChapters();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetChapterForm(): void {
    this.editChapterId = null;
    this.chapterForm = { title: '' };
  }

  protected async openChapter(chapterId: number): Promise<void> {
    this.selectedChapterId = chapterId;
    this.editLessonId = null;
    this.lessonForm = { title: '', type: 'VIDEO', url: '', durationMinutes: 10 };
    await this.loadLessonsAndQuiz();
  }

  protected async loadLessonsAndQuiz(): Promise<void> {
    if (!this.selectedChapterId) {
      this.lessons = [];
      this.chapterQuizzes = [];
      this.selectedChapterQuizId = null;
      this.chapterQuiz = null;
      this.chapterQuizQuestions = [];
      return;
    }
    const [lessons, quizzes, quizFallback] = await Promise.all([
      this.api.getLessons(this.selectedChapterId).catch(() => []),
      this.api.getChapterQuizzes(this.selectedChapterId).catch(() => []),
      this.api.getChapterQuiz(this.selectedChapterId).catch(() => null)
    ]);
    this.lessons = this.sortByIdDesc(lessons);
    const list = (Array.isArray(quizzes) ? quizzes : []).filter((q) => Number(q?.id) > 0);
    if (quizFallback?.id && !list.some((q) => q.id === quizFallback.id)) {
      list.unshift(quizFallback);
    }
    this.chapterQuizzes = this.sortByIdDesc(list);
    if (!this.chapterQuizzes.length) {
      this.selectedChapterQuizId = null;
      this.chapterQuiz = null;
      this.chapterQuizQuestions = [];
      this.quizForm = { title: '', passingScorePercent: 50, timeLimitMinutes: 15, maxAttempts: 3 };
      this.resetQuizQuestionForm();
      return;
    }
    if (!this.selectedChapterQuizId || !this.chapterQuizzes.some((q) => q.id === this.selectedChapterQuizId)) {
      this.selectedChapterQuizId = this.chapterQuizzes[0].id;
    }
    this.chapterQuiz = this.chapterQuizzes.find((q) => q.id === this.selectedChapterQuizId) ?? this.chapterQuizzes[0];
    if (this.chapterQuiz?.id) {
      this.chapterQuizQuestions = await this.api.getQuizQuestions(this.chapterQuiz.id).catch(() => []);
      this.quizForm = {
        title: this.chapterQuiz.title ?? 'Quiz',
        passingScorePercent: Number(this.chapterQuiz.passingScorePercent ?? 50),
        timeLimitMinutes: Number((this.chapterQuiz as { timeLimitMinutes?: number }).timeLimitMinutes ?? 15),
        maxAttempts: Number((this.chapterQuiz as { maxAttempts?: number }).maxAttempts ?? 3)
      };
    } else {
      this.chapterQuizQuestions = [];
      this.quizForm = { title: '', passingScorePercent: 50, timeLimitMinutes: 15, maxAttempts: 3 };
    }
  }

  protected async onChapterQuizChange(): Promise<void> {
    const selected =
      this.selectedChapterQuizId == null
        ? null
        : this.chapterQuizzes.find((q) => q.id === this.selectedChapterQuizId) ?? null;
    this.chapterQuiz = selected;
    this.quizQuestionEditId = null;
    this.resetQuizQuestionForm();
    if (!selected?.id) {
      this.chapterQuizQuestions = [];
      this.quizForm = { title: '', passingScorePercent: 50, timeLimitMinutes: 15, maxAttempts: 3 };
      return;
    }
    this.quizForm = {
      title: selected.title ?? 'Quiz',
      passingScorePercent: Number(selected.passingScorePercent ?? 50),
      timeLimitMinutes: Number((selected as { timeLimitMinutes?: number }).timeLimitMinutes ?? 15),
      maxAttempts: Number((selected as { maxAttempts?: number }).maxAttempts ?? 3)
    };
    this.chapterQuizQuestions = await this.api.getQuizQuestions(selected.id).catch(() => []);
  }

  protected createAnotherQuiz(): void {
    this.selectedChapterQuizId = null;
    this.chapterQuiz = null;
    this.chapterQuizQuestions = [];
    this.quizQuestionEditId = null;
    this.quizForm = { title: '', passingScorePercent: 50, timeLimitMinutes: 15, maxAttempts: 3 };
    this.resetQuizQuestionForm();
  }

  protected async saveLesson(): Promise<void> {
    if (!this.selectedChapterId) {
      this.toast('Choisir un chapitre.');
      return;
    }
    if (!this.lessonForm.title.trim()) {
      this.toast('Titre lecon requis.');
      return;
    }
    try {
      if (this.editLessonId) {
        await this.api.updateLesson(this.editLessonId, this.lessonForm);
        this.toast('Lecon modifiee.');
      } else {
        await this.api.createLesson(this.selectedChapterId, this.lessonForm);
        this.toast('Lecon ajoutee.');
      }
      this.resetLessonForm();
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditLesson(lesson: TeacherLessonModel): void {
    this.editLessonId = lesson.id;
    this.lessonForm = {
      title: lesson.title ?? '',
      type: lesson.type ?? 'VIDEO',
      url: lesson.url ?? '',
      durationMinutes: Number(lesson.durationMinutes ?? 10)
    };
  }

  protected async deleteLesson(lesson: TeacherLessonModel): Promise<void> {
    if (!window.confirm('Supprimer cette lecon ?')) return;
    try {
      await this.api.deleteLesson(lesson.id);
      this.toast('Lecon supprimee.');
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetLessonForm(): void {
    this.editLessonId = null;
    this.lessonForm = { title: '', type: 'VIDEO', url: '', durationMinutes: 10 };
  }

  protected async uploadLessonFile(event: Event): Promise<void> {
    if (!this.selectedChapterId) {
      this.toast('Choisir un chapitre.');
      return;
    }
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    this.lessonUploadBusy = true;
    try {
      await this.api.uploadLessonFile(this.selectedChapterId, file);
      this.toast('Fichier uploadé.');
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    } finally {
      this.lessonUploadBusy = false;
      input.value = '';
    }
  }

  protected async saveQuizMeta(): Promise<void> {
    if (!this.selectedChapterId) {
      this.toast('Choisir un chapitre.');
      return;
    }
    if (!this.quizForm.title.trim()) {
      this.toast('Titre quiz requis.');
      return;
    }
    try {
      if (this.chapterQuiz?.id) {
        await this.api.updateQuiz(this.chapterQuiz.id, this.quizForm);
        this.toast('Quiz modifie.');
      } else {
        const created = await this.api.createQuiz(this.selectedChapterId, this.quizForm);
        this.selectedChapterQuizId = created?.id ?? null;
        this.toast('Quiz cree.');
      }
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected async deleteQuiz(): Promise<void> {
    if (!this.chapterQuiz?.id) return;
    if (!window.confirm('Supprimer ce quiz ?')) return;
    try {
      await this.api.deleteQuiz(this.chapterQuiz.id);
      this.toast('Quiz supprime.');
      const deletedId = this.chapterQuiz.id;
      const remaining = this.chapterQuizzes.filter((q) => q.id !== deletedId);
      this.selectedChapterQuizId = remaining[0]?.id ?? null;
      this.quizQuestionEditId = null;
      this.quizQuestionForm = {
        questionText: '',
        questionType: 'MULTIPLE_CHOICE',
        correctAnswer: '',
        optionsText: '',
        explanation: '',
        points: 10,
        orderNumber: 0
      };
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected async saveQuizQuestion(): Promise<void> {
    if (!this.chapterQuiz?.id) {
      this.toast('Creer le quiz d abord.');
      return;
    }
    if (!this.quizQuestionForm.questionText.trim()) {
      this.toast('Question requise.');
      return;
    }
    if (!this.quizQuestionForm.correctAnswer.trim()) {
      this.toast('Reponse correcte requise.');
      return;
    }
    const questionType = this.quizQuestionForm.questionType;
    const options = this.parseOptionsText(this.quizQuestionForm.optionsText);
    if (questionType === 'MULTIPLE_CHOICE' && options.length < 2) {
      this.toast('QCM: ajoutez au moins 2 options.');
      return;
    }
    if (
      questionType === 'MULTIPLE_CHOICE' &&
      !options.some((o) => o.toLowerCase() === this.quizQuestionForm.correctAnswer.trim().toLowerCase())
    ) {
      this.toast('La reponse correcte doit exister dans les options QCM.');
      return;
    }
    if (questionType === 'TRUE_FALSE') {
      const ans = this.quizQuestionForm.correctAnswer.trim().toLowerCase();
      if (ans !== 'true' && ans !== 'false' && ans !== 'vrai' && ans !== 'faux') {
        this.toast('Vrai/Faux: choisissez une valeur valide.');
        return;
      }
    }
    const body = {
      questionText: this.quizQuestionForm.questionText,
      questionType,
      correctAnswer: this.quizQuestionForm.correctAnswer.trim(),
      points: Number(this.quizQuestionForm.points ?? 0),
      orderNumber: Number(this.quizQuestionForm.orderNumber ?? 0),
      explanation: this.quizQuestionForm.explanation?.trim() || '',
      options: questionType === 'MULTIPLE_CHOICE' ? options : []
    };
    try {
      if (this.quizQuestionEditId) {
        await this.api.updateQuizQuestion(this.quizQuestionEditId, body);
        this.toast('Question quiz modifiee.');
      } else {
        await this.api.createQuizQuestion(this.chapterQuiz.id, body);
        this.toast('Question quiz ajoutee.');
      }
      this.resetQuizQuestionForm();
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditQuizQuestion(q: TeacherQuestionModel): void {
    this.quizQuestionEditId = q.id;
    const rawOptions = (q as unknown as { options?: unknown }).options;
    const options = Array.isArray(rawOptions) ? rawOptions.map((v) => String(v ?? '').trim()).filter(Boolean) : [];
    this.quizQuestionForm = {
      questionText: q.questionText ?? '',
      questionType: q.questionType ?? 'MULTIPLE_CHOICE',
      correctAnswer: q.correctAnswer ?? '',
      optionsText: options.join('\n'),
      explanation: String((q as unknown as { explanation?: unknown }).explanation ?? ''),
      points: Number(q.points ?? 10),
      orderNumber: Number(q.orderNumber ?? 0)
    };
  }

  protected async deleteQuizQuestion(q: TeacherQuestionModel): Promise<void> {
    if (!window.confirm('Supprimer cette question quiz ?')) return;
    try {
      await this.api.deleteQuizQuestion(q.id);
      this.toast('Question quiz supprimee.');
      await this.loadLessonsAndQuiz();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetQuizQuestionForm(): void {
    this.quizQuestionEditId = null;
    this.quizQuestionForm = {
      questionText: '',
      questionType: 'MULTIPLE_CHOICE',
      correctAnswer: '',
      optionsText: '',
      explanation: '',
      points: 10,
      orderNumber: 0
    };
  }

  protected setQuizQuestionType(type: 'TRUE_FALSE' | 'MULTIPLE_CHOICE' | 'SHORT_ANSWER'): void {
    this.quizQuestionForm.questionType = type;
    if (type === 'TRUE_FALSE') {
      this.quizQuestionForm.correctAnswer = 'true';
      this.quizQuestionForm.optionsText = '';
    } else if (type === 'SHORT_ANSWER') {
      this.quizQuestionForm.optionsText = '';
    }
  }

  protected quizQuestionTypeLabel(type: string | null | undefined): string {
    const t = String(type ?? '').toUpperCase();
    if (t === 'TRUE_FALSE') return 'True / False';
    if (t === 'SHORT_ANSWER') return 'Short answer';
    return 'QCM';
  }

  private parseOptionsText(raw: string): string[] {
    return String(raw ?? '')
      .split(/\r?\n/g)
      .map((v) => v.trim())
      .filter(Boolean);
  }

  protected async loadCourses(): Promise<void> {
    this.courses = this.sortByIdDesc((await this.api.getCourses().catch(() => [])) ?? []);
  }

  protected async saveCourse(): Promise<void> {
    if (!this.courseForm.title.trim()) {
      this.toast('Titre du cours requis.');
      return;
    }
    const body = {
      ...this.courseForm,
      teacherId: 1,
      teacherLocation: '',
      maxStudents: 30,
      city: 'Paris',
      country: 'France',
      latitude: null,
      longitude: null
    };
    try {
      if (this.editCourseId) {
        await this.api.updateCourse(this.editCourseId, body);
        this.toast('Cours modifie.');
      } else {
        await this.api.createCourse(body);
        this.toast('Cours cree.');
      }
      this.resetCourseForm();
      await this.loadCourses();
      await this.loadDashboard();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditCourse(c: TeacherCourseModel): void {
    this.editCourseId = c.id;
    this.courseForm = {
      courseCode: c.courseCode ?? '',
      title: c.title ?? '',
      teacherName: c.teacherName ?? '',
      price: Number(c.price ?? 0),
      level: c.level ?? 'BEGINNER',
      durationHours: Number(c.durationHours ?? 40),
      status: c.status ?? 'ACTIVE',
      description: c.description ?? ''
    };
  }

  protected async deleteCourse(c: TeacherCourseModel): Promise<void> {
    if (!window.confirm('Supprimer ce cours ?')) return;
    try {
      await this.api.deleteCourse(c.id);
      this.toast('Cours supprime.');
      await this.loadCourses();
      await this.loadDashboard();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetCourseForm(): void {
    this.editCourseId = null;
    this.courseForm = {
      courseCode: '',
      title: '',
      teacherName: '',
      price: 0,
      level: 'BEGINNER',
      durationHours: 40,
      status: 'ACTIVE',
      description: ''
    };
  }

  protected async loadQuestions(): Promise<void> {
    if (!this.selectedQuestionCourseId) {
      this.questions = [];
      return;
    }
    this.questions = this.sortByIdDesc(await this.api.getQuestions(this.selectedQuestionCourseId).catch(() => []));
  }

  protected async saveQuestion(): Promise<void> {
    if (!this.selectedQuestionCourseId) {
      this.toast('Choisir un cours.');
      return;
    }
    if (!this.questionForm.questionText.trim()) {
      this.toast('Question requise.');
      return;
    }
    const body = { ...this.questionForm, courseId: this.selectedQuestionCourseId };
    try {
      if (this.editQuestionId) {
        await this.api.updateQuestion(this.editQuestionId, body);
        this.toast('Question modifiee.');
      } else {
        await this.api.createQuestion(body);
        this.toast('Question ajoutee.');
      }
      this.resetQuestionForm();
      await this.loadQuestions();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditQuestion(q: TeacherQuestionModel): void {
    this.editQuestionId = q.id;
    this.questionForm = {
      questionText: q.questionText ?? '',
      questionType: q.questionType ?? 'OPEN_TEXT',
      correctAnswer: q.correctAnswer ?? '',
      points: Number(q.points ?? 10)
    };
  }

  protected async deleteQuestion(q: TeacherQuestionModel): Promise<void> {
    if (!window.confirm('Supprimer cette question ?')) return;
    try {
      await this.api.deleteQuestion(q.id);
      this.toast('Question supprimee.');
      await this.loadQuestions();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetQuestionForm(): void {
    this.editQuestionId = null;
    this.questionForm = {
      questionText: '',
      questionType: 'OPEN_TEXT',
      correctAnswer: '',
      points: 10
    };
  }

  protected async loadMaterials(): Promise<void> {
    if (!this.selectedMaterialCourseId) {
      this.materials = [];
      return;
    }
    this.materials = this.sortByIdDesc(await this.api.getMaterials(this.selectedMaterialCourseId).catch(() => []));
  }

  protected async saveMaterial(): Promise<void> {
    if (!this.selectedMaterialCourseId) {
      this.toast('Choisir un cours.');
      return;
    }
    if (!this.materialForm.title.trim() || !this.materialForm.url.trim()) {
      this.toast('Titre et URL requis.');
      return;
    }
    const body = { ...this.materialForm };
    try {
      if (this.editMaterialId) {
        await this.api.updateMaterial(this.editMaterialId, body);
        this.toast('Ressource modifiee.');
      } else {
        await this.api.createMaterial(this.selectedMaterialCourseId, body);
        this.toast('Ressource ajoutee.');
      }
      this.resetMaterialForm();
      await this.loadMaterials();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected startEditMaterial(m: TeacherMaterialModel): void {
    this.editMaterialId = m.id;
    this.materialForm = {
      title: m.title ?? '',
      type: m.type ?? 'PDF',
      url: m.url ?? ''
    };
  }

  protected async deleteMaterial(m: TeacherMaterialModel): Promise<void> {
    if (!window.confirm('Supprimer cette ressource ?')) return;
    try {
      await this.api.deleteMaterial(m.id);
      this.toast('Ressource supprimee.');
      await this.loadMaterials();
    } catch (e) {
      this.toast((e as Error).message);
    }
  }

  protected resetMaterialForm(): void {
    this.editMaterialId = null;
    this.materialForm = { title: '', type: 'PDF', url: '' };
  }

  protected async loadEnrollments(): Promise<void> {
    this.enrollments = this.sortByIdDesc(await this.api.getEnrollments().catch(() => []));
  }

  private sortByIdDesc<T extends { id: number }>(list: T[]): T[] {
    return [...(Array.isArray(list) ? list : [])].sort((a, b) => Number(b.id ?? 0) - Number(a.id ?? 0));
  }

  private toast(msg: string): void {
    this.toastText = msg;
    window.setTimeout(() => (this.toastText = ''), 2800);
  }
}
