package main

import (
	"backend/services"
	"embed"
	"log"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v3/pkg/application"
)

// Wails uses Go's `embed` package to embed the frontend files into the binary.
// Any files in the frontend/dist folder will be embedded into the binary and
// made available to the frontend.
// See https://pkg.go.dev/embed for more information.

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.

	application.RegisterEvent[float32]("simulation:progress")
	application.RegisterEvent[uuid.UUID]("simulation:started")
	application.RegisterEvent[services.DecoderStatistics]("simulation:finished")
	application.RegisterEvent[string]("simulation:error")

	application.RegisterEvent[float32]("error-generation:progress")
	application.RegisterEvent[uuid.UUID]("error-generation:started")
	application.RegisterEvent[uuid.UUID]("error-generation:finished")
	application.RegisterEvent[string]("error-generation:error")

	application.RegisterEvent[float32]("data-generation:progress")
	application.RegisterEvent[uuid.UUID]("data-generation:started")
	application.RegisterEvent[uuid.UUID]("data-generation:finished")
	application.RegisterEvent[string]("data-generation:error")

	application.RegisterEvent[float32]("coder:progress")
	application.RegisterEvent[uuid.UUID]("coder:started")
	application.RegisterEvent[uuid.UUID]("coder:finished")
	application.RegisterEvent[string]("coder:error")

	application.RegisterEvent[float32]("decoder:progress")
	application.RegisterEvent[uuid.UUID]("decoder:started")
	application.RegisterEvent[uuid.UUID]("decoder:finished")
	application.RegisterEvent[string]("decoder:error")
}

// main function serves as the application's entry point. It initializes the application, creates a window,
// and starts a goroutine that emits a time-based event every second. It subsequently runs the application and
// logs any error that might occur.
func main() {

	errorGenerator := services.NewErrorGeneratorService()
	messageGenerator := services.NewDataGenerationService()
	coderService := services.NewCoderService()
	decoderService := services.NewDecoderService()
	databaseService := services.NewDatabaseService()
	simulationSevice := services.NewSimulationService(errorGenerator, messageGenerator, coderService, decoderService, databaseService)

	// Create a new Wails application by providing the necessary options.
	// Variables 'Name' and 'Description' are for application metadata.
	// 'Assets' configures the asset server with the 'FS' variable pointing to the frontend files.
	// 'Bind' is a list of Go struct instances. The frontend has access to the methods of these instances.
	// 'Mac' options tailor the application when running an macOS.
	app := application.New(application.Options{
		Name:        "Модель передачи данных",
		Description: "Симулятор линии передачи данных с учетом ошибок по модели независимых ошибок или модели Гильберта",
		Services: []application.Service{
			application.NewService(errorGenerator),
			application.NewService(messageGenerator),
			application.NewService(coderService),
			application.NewService(decoderService),
			application.NewService(databaseService),
			application.NewService(simulationSevice),
		},
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
	})

	// Create a new window with the necessary options.
	// 'Title' is the title of the window.
	// 'Mac' options tailor the window when running on macOS.
	// 'BackgroundColour' is the background colour of the window.
	// 'URL' is the URL that will be loaded into the webview.
	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title: "Модель передачи данных",
		// Window sized to the golden ratio (1000 / 618 ≈ 1.618).
		Width:  1920,
		Height: 1080,
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		// BackgroundColour: application.NewRGB(6, 7, 15),
		URL: "/",
	})

	// // Create a goroutine that emits an event containing the current time every second.
	// // The frontend can listen to this event and update the UI accordingly.
	// go func() {
	// 	for {
	// 		now := time.Now().Format(time.RFC1123)
	// 		app.Event.Emit("time", now)
	// 		time.Sleep(time.Second)
	// 	}
	// }()

	// Run the application. This blocks until the application has been exited.
	err := app.Run()

	// If an error occurred while running the application, log it and exit.
	if err != nil {
		log.Fatal(err)
	}
}
