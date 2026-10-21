package services

import (
	"context"
	"encoding/binary"
	"runtime"
	"sync"
	"sync/atomic"

	"github.com/google/uuid"
	"github.com/pasztorpisti/go-crc"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//wails:internal
type DecoderService struct {
	ctx context.Context
}

type DecoderStatistics struct {
	DetectedErrors   uint64 `json:"detectedErrors"`
	UndetectedErrors uint64 `json:"undetectedErrors"`
	TotalTransmited  uint64 `json:"totalTransmited"`
}

func NewDecoderService() *DecoderService {
	return &DecoderService{}
}

func (s *DecoderService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

func (s *DecoderService) emitProgress(app *application.App, progress float32) {
	app.Event.Emit("decoder:progress", progress)
}
func (s *DecoderService) decodeMessages(messageWidth uint8, polynomialDegree uint8, messages []uint64, codedMessages []uint64, algo crc.Algo[uint64], undetectedErrorsToStop uint64, taskId uuid.UUID) (DecoderStatistics, error) {
	app := application.Get()
	total := len(messages)

	app.Event.Emit("decoder:started", taskId)

	// маски для сообщений
	msgMask := uint64(1)<<messageWidth - 1
	crcMask := uint64(1)<<polynomialDegree - 1
	byteLen := (messageWidth + 7) / 8

	// для выхода по ошибкам
	ctx, cancel := context.WithCancel(s.ctx)
	defer cancel()

	// const batch = 10000
	batch := int64(min(total/100, 10000))

	progress := make(chan int64, 64)
	consumerDone := make(chan struct{})

	go func() {
		defer close(consumerDone)
		var done int64
		for inc := range progress {
			done += inc
			s.emitProgress(app, float32(done)/float32(total)*100)
		}
	}()

	workers := runtime.GOMAXPROCS(0)
	jobs := make(chan int, workers)

	var wg sync.WaitGroup
	var detectedErrors, undetectedErrors, totalTransmited uint64

	for range workers {
		wg.Go(func() {
			var buf [8]byte
			var local int64

			var localTransmited, localDetected uint64

			defer func() {
				atomic.AddUint64(&totalTransmited, localTransmited)
				atomic.AddUint64(&detectedErrors, localDetected)
				if local > 0 {
					select {
					case progress <- local:
					default:
					}
				}
			}()

			for i := range jobs {
				select {
				case <-ctx.Done():
					return
				default:
				}

				// достаем сообщения
				received := codedMessages[i]
				decodedMsg := (received >> polynomialDegree) & msgMask
				receivedCRC := received & crcMask

				binary.BigEndian.PutUint64(buf[:], decodedMsg)
				expectedCRC := algo.Calc(buf[8-byteLen:]) & crcMask

				originalMsg := messages[i] & msgMask

				localTransmited++
				// сравниваем с тем, что должно быть
				if receivedCRC != expectedCRC {
					localDetected++
				} else if decodedMsg != originalMsg {
					n := atomic.AddUint64(&undetectedErrors, 1)

					if undetectedErrorsToStop > 0 && n >= undetectedErrorsToStop {
						cancel()
						return
					}
				}

				// подсчет прогресса
				local++
				if local >= batch {
					select {
					case progress <- local:
					default:
					}
					local = 0
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

	for shuildLoop, i := true, 0; shuildLoop && i < len(codedMessages); i++ {
		select {
		case jobs <- i:
		case <-ctx.Done():
			shuildLoop = false
		}
	}

	shutdown()

	stats := DecoderStatistics{
		DetectedErrors:   atomic.LoadUint64(&detectedErrors),
		UndetectedErrors: atomic.LoadUint64(&undetectedErrors),
		TotalTransmited:  atomic.LoadUint64(&totalTransmited),
	}

	app.Event.Emit("decoder:finished", taskId)
	return stats, s.ctx.Err()
}
