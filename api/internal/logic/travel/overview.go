package travel

import (
	"context"
	"time"
)

// GetOverview 汇总目的地数量、累计天数与评分。
func GetOverview(ctx context.Context, userID int64) (*Overview, error) {
	items, err := List(ctx, userID)
	if err != nil {
		return nil, err
	}
	overview := &Overview{
		Year:  time.Now().In(cst).Year(),
		Items: items,
		Total: len(items),
	}

	places := make(map[string]bool, len(items))
	ratingSum := 0.0
	rated := 0
	for _, item := range items {
		places[item.Title] = true
		overview.TotalDays += item.Days
		if item.Year == overview.Year {
			overview.YearCount++
		}
		if item.Rating > 0 {
			ratingSum += float64(item.Rating)
			rated++
		}
	}
	overview.PlaceCount = len(places)
	if rated > 0 {
		overview.AvgRating = round1(ratingSum / float64(rated))
	}
	return overview, nil
}
