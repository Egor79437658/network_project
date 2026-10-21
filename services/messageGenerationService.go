package services

import (
	"context"
	"math/rand/v2"
	"runtime"
	"time"

	"sync"

	"github.com/google/uuid"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:internal
type MessageGenerationService struct {
	ctx context.Context
}

func NewDataGenerationService() *MessageGenerationService {
	return &MessageGenerationService{}
}

func (s *MessageGenerationService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

func (s *MessageGenerationService) emitProgress(app *application.App, progress float32) {
	app.Event.Emit("data-generation:progress", progress)
}

func (s *MessageGenerationService) generateMessages(messages []uint64, taskId uuid.UUID) error {
	app := application.Get()
	messagesCount := len(messages)

	app.Event.Emit("data-generation:started", taskId)

	// через сколько выполненых заданий отправлять прогресс
	// const batch = 10000
	batch := int64(min(messagesCount/100, 100000))

	progress := make(chan int64, 64)
	consumerDone := make(chan struct{})

	// процесс для отправки прогресса
	go func() {
		defer close(consumerDone)
		var total int64
		for inc := range progress {
			total += inc
			s.emitProgress(app, float32(total)/float32(messagesCount)*100)
		}
		// s.emitProgress(app, 100)
	}()

	workers := runtime.GOMAXPROCS(0)
	jobs := make(chan int, workers)

	// заполнение сообщений
	var wg sync.WaitGroup
	baseSeed := uint64(time.Now().UnixNano())
	for w := range workers {
		workerSeed := uint64(w)
		wg.Go(func() {
			rng := rand.New(rand.NewPCG(
				baseSeed,
				workerSeed,
			))
			var local int64
			for i := range jobs {
				// выход если окно закрылось
				select {
				case <-s.ctx.Done():
					return
				default:
				}
				messages[i] = rng.Uint64()

				// если понадобится messageSize бит и остальные нули
				// var mask uint64 = ^uint64(0)
				// if messageSize < 64 {
				// 	mask = (uint64(1) << messageSize) - 1
				// }
				// messages[i] = rng.Uint64() & mask

				// прогресс
				local++
				if local >= batch {
					select {
					case progress <- local:
					default:
					}
					local = 0
				}
			}
			// прогресс когда закончили
			if local > 0 {
				select {
				case progress <- local:
				default:
				}
			}
		})
	}

	shutdown := func() {
		close(jobs)
		wg.Wait()
		close(progress)
		<-consumerDone
	}
	// назначение задач процессам
	for i := range messages {
		select {
		case jobs <- i:
		// если закрыли окно
		case <-s.ctx.Done():
			shutdown()
			return s.ctx.Err()
		}
	}
	shutdown()

	app.Event.Emit("data-generation:finished", taskId)

	return nil
}
