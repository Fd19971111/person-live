package study

import (
	"context"

	v1 "study/api/api/study/v1"
	studylogic "study/api/internal/logic/study"
)

// Courses 课程列表。
func (c *ControllerV1) Courses(ctx context.Context, req *v1.StudyCoursesReq) (res *v1.StudyCoursesRes, err error) {
	courses, err := studylogic.ListCourses(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.StudyCoursesRes{Items: toCourseItems(courses)}, nil
}

// SaveCourse 新增或编辑课程。
func (c *ControllerV1) SaveCourse(ctx context.Context, req *v1.StudyCourseSaveReq) (res *v1.StudyCourseSaveRes, err error) {
	id, err := studylogic.SaveCourse(ctx, currentUserID(ctx), req.Id, req.Title, req.UnitLabel,
		req.TotalUnits, req.DoneUnits, req.Color, req.SortOrder)
	if err != nil {
		return nil, err
	}
	return &v1.StudyCourseSaveRes{Id: id}, nil
}

// DeleteCourse 删除课程（软删除）。
func (c *ControllerV1) DeleteCourse(ctx context.Context, req *v1.StudyCourseDeleteReq) (res *v1.StudyCourseDeleteRes, err error) {
	if err = studylogic.DeleteCourse(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.StudyCourseDeleteRes{}, nil
}
