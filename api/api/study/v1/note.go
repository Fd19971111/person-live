package v1

import "github.com/gogf/gf/v2/frame/g"

// StudyNotesReq 笔记列表。
type StudyNotesReq struct {
	g.Meta `path:"/study/notes" method:"get" tags:"学习" summary:"学习笔记列表"`
}

type StudyNotesRes struct {
	Items []StudyNoteItem `json:"items"`
}

// StudyNoteSaveReq 新增或编辑笔记，Id 为 0 时表示新增。
type StudyNoteSaveReq struct {
	g.Meta  `path:"/study/note/save" method:"post" tags:"学习" summary:"保存学习笔记"`
	Id      int64  `json:"id"`
	Title   string `json:"title"`
	Tag     string `json:"tag"`
	Content string `json:"content"`
}

type StudyNoteSaveRes struct {
	Id int64 `json:"id"`
}

// StudyNoteDeleteReq 删除笔记（软删除）。
type StudyNoteDeleteReq struct {
	g.Meta `path:"/study/note/delete" method:"post" tags:"学习" summary:"删除学习笔记"`
	Id     int64 `json:"id"`
}

type StudyNoteDeleteRes struct{}
