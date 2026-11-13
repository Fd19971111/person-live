package study

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"

	v1 "study/api/api/study/v1"
	"study/api/internal/consts"
	studylogic "study/api/internal/logic/study"
)

type ControllerV1 struct{}

func NewV1() *ControllerV1 {
	return &ControllerV1{}
}

func currentUserID(ctx context.Context) int64 {
	return g.RequestFromCtx(ctx).GetCtxVar(consts.CtxKeyUserId).Int64()
}

func toCourseItem(course studylogic.Course) v1.StudyCourseItem {
	return v1.StudyCourseItem{
		Id:         course.ID,
		Title:      course.Title,
		UnitLabel:  course.UnitLabel,
		TotalUnits: course.TotalUnits,
		DoneUnits:  course.DoneUnits,
		Progress:   course.Progress,
		Color:      course.Color,
		SortOrder:  course.SortOrder,
	}
}

func toCourseItems(courses []studylogic.Course) []v1.StudyCourseItem {
	items := make([]v1.StudyCourseItem, 0, len(courses))
	for _, course := range courses {
		items = append(items, toCourseItem(course))
	}
	return items
}

func toNoteItems(notes []studylogic.Note) []v1.StudyNoteItem {
	items := make([]v1.StudyNoteItem, 0, len(notes))
	for _, note := range notes {
		items = append(items, v1.StudyNoteItem{
			Id:      note.ID,
			Title:   note.Title,
			Tag:     note.Tag,
			Content: note.Content,
			Date:    note.Date,
		})
	}
	return items
}

func toSessionItems(sessions []studylogic.Session) []v1.StudySessionItem {
	items := make([]v1.StudySessionItem, 0, len(sessions))
	for _, session := range sessions {
		items = append(items, v1.StudySessionItem{
			Id:       session.ID,
			Date:     session.Date,
			Minutes:  session.Minutes,
			CourseId: session.CourseID,
			Course:   session.Course,
			Note:     session.Note,
		})
	}
	return items
}

func toDayStats(days []studylogic.DayStat) []v1.StudyDayStat {
	items := make([]v1.StudyDayStat, 0, len(days))
	for _, day := range days {
		items = append(items, v1.StudyDayStat{
			Date:    day.Date,
			Weekday: day.Weekday,
			Minutes: day.Minutes,
			Level:   day.Level,
		})
	}
	return items
}
