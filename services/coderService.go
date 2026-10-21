package services

import (
	"context"
	"encoding/binary"
	"runtime"
	"sync"

	"github.com/google/uuid"
	"github.com/pasztorpisti/go-crc"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:internal
type CoderService struct {
	ctx context.Context
}

func NewCoderService() *CoderService {
	return &CoderService{}
}

func (s *CoderService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

func (s *CoderService) emitProgress(app *application.App, progress float32) {
	app.Event.Emit("coder:progress", progress)
}

func (s *CoderService) codeMessages(messageWidth uint8, polynomialDegree uint8, messages []uint64, codedMessages []uint64, algo crc.Algo[uint64], taskId uuid.UUID) error {
	app := application.Get()
	messagesCount := len(messages)

	app.Event.Emit("coder:started", taskId)

	// сколько байт занимает сообщение
	byteLen := (messageWidth + 7) / 8
	msgMask := uint64(1)<<messageWidth - 1

	// через сколько выполненных заданий отправлять прогресс
	// const batch = 10000
	batch := int64(min(messagesCount/100, 10000))

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
	}()

	workers := runtime.GOMAXPROCS(0)
	jobs := make(chan int, workers)

	// кодирование сообщений
	var wg sync.WaitGroup
	for range workers {
		wg.Go(func() {
			var buf [8]byte
			var local int64
			for i := range jobs {
				// выход если окно закрылось
				select {
				case <-s.ctx.Done():
					return
				default:
				}

				msg := messages[i] & msgMask
				binary.BigEndian.PutUint64(buf[:], msg)
				crc := algo.Calc(buf[8-byteLen:])
				codedMessages[i] = (msg << uint64(polynomialDegree)) | crc

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

	app.Event.Emit("coder:finished", taskId)

	return nil
}
