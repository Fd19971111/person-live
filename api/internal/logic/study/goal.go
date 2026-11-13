package study

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
)

// GoalMinutes 读取每周学习目标，未设置时返回默认值。
func GoalMinutes(ctx context.Context, userID int64) (int, error) {
	value, err := g.DB().GetValue(ctx,
		"SELECT weekly_goal_minutes FROM study_setting WHERE user_id = ?", userID)
	if err != nil {
		return 0, err
	}
	if minutes := value.Int(); minutes > 0 {
		return minutes, nil
	}
	return DefaultWeeklyGoalMinutes, nil
}

// SaveGoal 保存每周学习目标（分钟）。
func SaveGoal(ctx context.Context, userID int64, minutes int) (int, error) {
	if minutes < 30 || minutes > 10080 {
		return 0, invalid("每周目标需在 30-10080 分钟之间")
	}
	_, err := g.DB().Exec(ctx, `
		INSERT INTO study_setting (user_id, weekly_goal_minutes) VALUES (?, ?)
		ON DUPLICATE KEY UPDATE weekly_goal_minutes = ?`, userID, minutes, minutes)
	if err != nil {
		return 0, err
	}
	return minutes, nil
}
