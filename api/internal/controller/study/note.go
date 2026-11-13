package study

import (
	"context"

	v1 "study/api/api/study/v1"
	studylogic "study/api/internal/logic/study"
)

// Notes 笔记列表。
func (c *ControllerV1) Notes(ctx context.Context, req *v1.StudyNotesReq) (res *v1.StudyNotesRes, err error) {
	notes, err := studylogic.ListNotes(ctx, currentUserID(ctx))
	if err != nil {
		return nil, err
	}
	return &v1.StudyNotesRes{Items: toNoteItems(notes)}, nil
}

// SaveNote 新增或编辑笔记。
func (c *ControllerV1) SaveNote(ctx context.Context, req *v1.StudyNoteSaveReq) (res *v1.StudyNoteSaveRes, err error) {
	id, err := studylogic.SaveNote(ctx, currentUserID(ctx), req.Id, req.Title, req.Tag, req.Content)
	if err != nil {
		return nil, err
	}
	return &v1.StudyNoteSaveRes{Id: id}, nil
}

// DeleteNote 删除笔记（软删除）。
func (c *ControllerV1) DeleteNote(ctx context.Context, req *v1.StudyNoteDeleteReq) (res *v1.StudyNoteDeleteRes, err error) {
	if err = studylogic.DeleteNote(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.StudyNoteDeleteRes{}, nil
}
