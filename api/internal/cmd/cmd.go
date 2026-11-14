package cmd

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gcmd"
	"github.com/gogf/gf/v2/os/gfile"

	albumctl "study/api/internal/controller/album"
	authctl "study/api/internal/controller/auth"
	financectl "study/api/internal/controller/finance"
	fitnessctl "study/api/internal/controller/fitness"
	healthctl "study/api/internal/controller/health"
	inspirationctl "study/api/internal/controller/inspiration"
	modulectl "study/api/internal/controller/module"
	moviesctl "study/api/internal/controller/movies"
	musicctl "study/api/internal/controller/music"
	planctl "study/api/internal/controller/plan"
	studyctl "study/api/internal/controller/study"
	travelctl "study/api/internal/controller/travel"
	userctl "study/api/internal/controller/user"
	albumlogic "study/api/internal/logic/album"
	"study/api/internal/middleware"
)

var Main = gcmd.Command{
	Name:  "main",
	Usage: "main",
	Brief: "start http server",
	Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
		s := g.Server()
		s.Use(ghttp.MiddlewareCORS)
		// 相册图片直接由本地目录提供，文件名随机，便于 <img> 直接引用。
		if err = gfile.Mkdir(albumlogic.StorageDir()); err != nil {
			return err
		}
		s.AddStaticPath(albumlogic.URLPrefix, albumlogic.StorageDir())
		// 公开只读接口：凭签名令牌访问，不经过 Auth 中间件。
		s.Group("/api/public", func(group *ghttp.RouterGroup) {
			group.Middleware(ghttp.MiddlewareHandlerResponse)
			group.Bind(albumctl.NewPublicV1())
		})
		s.Group("/api", func(group *ghttp.RouterGroup) {
			group.Middleware(ghttp.MiddlewareHandlerResponse)
			group.Bind(
				healthctl.NewV1(),
				authctl.NewV1(),
			)
			group.Group("/", func(protected *ghttp.RouterGroup) {
				protected.Middleware(middleware.Auth)
				protected.Bind(
					userctl.NewV1(),
					financectl.NewV1(),
					planctl.NewV1(),
					modulectl.NewV1(),
					studyctl.NewV1(),
					inspirationctl.NewV1(),
					moviesctl.NewV1(),
					travelctl.NewV1(),
					fitnessctl.NewV1(),
					musicctl.NewV1(),
					albumctl.NewV1(),
				)
			})
		})
		s.Run()
		return nil
	},
}
