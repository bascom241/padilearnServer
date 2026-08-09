import enrollmentModel from "../enrollments/enrollment.model.js";
import lessonProgressModel from "../courses/lesson/lessonProgress.model.js";
import lessonModel from "../courses/lesson/lesson.model.js";
import moduleModel from "../courses/module/module.model.js";
import videoModel from "../courses/video/video.model.js";
import { EnrollmentStatus } from "../enrollments/types/enrollment.types.js";

export interface ProfileStats {
  coursesEnrolled: number;
  coursesCompleted: number;
  learningHoursLogged: number;
}

export const getProfileStats = async (studentId: string): Promise<ProfileStats> => {
  const enrollments = await enrollmentModel.find({
    student: studentId,
    status: EnrollmentStatus.ACTIVE,
  });
  const courseIds = enrollments.map((e) => e.course.toString());

  if (courseIds.length === 0) {
    return { coursesEnrolled: 0, coursesCompleted: 0, learningHoursLogged: 0 };
  }

  const modules = await moduleModel.find({ course: { $in: courseIds } });
  const moduleToCourse = new Map(modules.map((m) => [m._id.toString(), m.course.toString()]));

  const lessons = await lessonModel.find({ module: { $in: modules.map((m) => m._id) } });
  const lessonCountByCourse = new Map<string, number>();
  for (const lesson of lessons) {
    const courseId = moduleToCourse.get(lesson.module.toString());
    if (!courseId) continue;
    lessonCountByCourse.set(courseId, (lessonCountByCourse.get(courseId) ?? 0) + 1);
  }

  const progress = await lessonProgressModel.find({
    student: studentId,
    course: { $in: courseIds },
  });

  const completedCountByCourse = new Map<string, number>();
  for (const entry of progress) {
    const courseId = entry.course.toString();
    completedCountByCourse.set(courseId, (completedCountByCourse.get(courseId) ?? 0) + 1);
  }

  const coursesCompleted = courseIds.filter((courseId) => {
    const total = lessonCountByCourse.get(courseId) ?? 0;
    const completed = completedCountByCourse.get(courseId) ?? 0;
    return total > 0 && completed >= total;
  }).length;

  const completedLessonIds = progress.map((p) => p.lesson);
  const videos = await videoModel.find({ lesson: { $in: completedLessonIds } });
  const totalSeconds = videos.reduce((sum, v) => sum + (v.duration ?? 0), 0);

  return {
    coursesEnrolled: courseIds.length,
    coursesCompleted,
    learningHoursLogged: Math.round((totalSeconds / 3600) * 10) / 10,
  };
};
