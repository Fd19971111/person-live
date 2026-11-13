package cmd

import (
	"context"

	"github.com/gogf/gf/v2/frame/g"
	"github.com/gogf/gf/v2/net/ghttp"
	"github.com/gogf/gf/v2/os/gcmd"

	authctl "study/api/internal/controller/auth"
	financectl "study/api/internal/controller/finance"
	healthctl "study/api/internal/controller/health"
	userctl "study/api/internal/controller/user"
	"study/api/internal/middleware"
)

var Main = gcmd.Command{
	Name:  "main",
	Usage: "main",
	Brief: "start http server",
	Func: func(ctx context.Context, parser *gcmd.Parser) (err error) {
		s := g.Server()
		s.Use(ghttp.MiddlewareCORS)
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
				)
			})
		})
		s.Run()
		return nil
	},
}
