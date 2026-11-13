package music

import (
	"context"

	v1 "study/api/api/music/v1"
	musiclogic "study/api/internal/logic/music"
)

// SaveTrack 新增或编辑音乐记录。
func (c *ControllerV1) SaveTrack(ctx context.Context, req *v1.MusicTrackSaveReq) (res *v1.MusicTrackSaveRes, err error) {
	id, err := musiclogic.Save(ctx, currentUserID(ctx), req.Id, req.Title, req.Artist,
		req.Album, req.Playlist, req.Rating, req.Note, req.Color)
	if err != nil {
		return nil, err
	}
	return &v1.MusicTrackSaveRes{Id: id}, nil
}

// DeleteTrack 删除音乐记录（软删除）。
func (c *ControllerV1) DeleteTrack(ctx context.Context, req *v1.MusicTrackDeleteReq) (res *v1.MusicTrackDeleteRes, err error) {
	if err = musiclogic.Delete(ctx, currentUserID(ctx), req.Id); err != nil {
		return nil, err
	}
	return &v1.MusicTrackDeleteRes{}, nil
}
