package services

import (
	"context"
	"fmt"
	"math"
	"math/rand/v2"
	"runtime"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type gilbertState string

const (
	Good gilbertState = "good"
	Bad  gilbertState = "bad"
)

//wails:internal
type ErrorGeneratorService struct {
	ctx context.Context
}

type run struct {
	bad   bool
	start int
	end   int
}

func NewErrorGeneratorService() *ErrorGeneratorService {
	return &ErrorGeneratorService{}
}

func (s *ErrorGeneratorService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

func (s *ErrorGeneratorService) emitProgress(app *application.App, progress float32) {
	app.Event.Emit("error-generation:progress", progress)
}

//go:fix inline
func calcError(decisionsPerWord uint8, rng *rand.Rand, decisionMask uint64, threshold uint64, decisionBits uint64) uint64 {
	var err uint64
	// махинации чтобы уменьшить кол-во вызовов rng
	for j := uint8(0); j < 64; j += decisionsPerWord {
		word := rng.Uint64() // берем случайное число
		for d := range decisionsPerWord {
			if word&decisionMask < threshold { //вырезаем из него первые decisionMask бит и смотрим сработала ли вероятность
				err |= uint64(1) << (j + d) // если да, переключаем бит
			}
			word >>= decisionBits // смторим следующую часть слова
		}
	}
	return err
}

//go:fix inline
func geometric(p float64) int { //выдает кол-во испытаний до того как событие с вероятностью p произойдет
	u := rand.Float64()
	return int(math.Floor(math.Log(1-u) / math.Log(1-p)))
}

func (s *ErrorGeneratorService) generateErrors(errors []uint64, np NetworkLineStartState, taskId uuid.UUID) error {
	app := application.Get()
	errorsCount := len(errors)

	// через сколько выполненых заданий отправлять прогресс
	// const batch = 10000
	batch := int64(max(errorsCount/100, 10000))

	app.Event.Emit("error-generation:started", taskId)

	// для махинаций с вероятностями
	const decisionBits = 16
	const decisionsPerWord = 64 / decisionBits // = 4
	const decisionMask = uint64(1)<<decisionBits - 1

	progress := make(chan int64, 64)
	consumerDone := make(chan struct{})

	go func() {
		defer close(consumerDone)
		var total int64
		for inc := range progress {
			total += inc
			s.emitProgress(app, float32(total)/float32(errorsCount)*100)
		}
		// s.emitProgress(app, 100)
	}()
	workers := runtime.GOMAXPROCS(0)
	jobs := make(chan int, workers)

	// виды ошибок:
	switch np.Mode {
	// если независимые ошибки, то многопоточность
	case Independed:

		// округляем p до threshold / 2^16.
		threshold := uint64(np.IndependedPropability*float64(uint64(1)<<decisionBits) + 0.5)

		baseSeed := uint64(time.Now().UnixNano())

		var wg sync.WaitGroup
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
					// генерация ошибки
					errors[i] = calcError(decisionsPerWord, rng, decisionMask, threshold, decisionBits)
					// var err uint64
					// for j := 0; j < 64; j++ {
					// 	if rng.Float64() < np.IndependedPropability {
					// 		err |= 1 << j
					// 	}
					// }
					// errors[i] = err

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
		for i := range errors {
			select {
			case jobs <- i:
			// если закрыли окно
			case <-s.ctx.Done():
				shutdown()
				return s.ctx.Err()
			}
		}
		shutdown()

	case Gilbert:

		// считаем когда какие состяния
		var runs []run
		pos := 0
		isBad := false
		for pos < errorsCount {
			p := np.PropabilityToGoBad
			if isBad {
				p = np.PropabilityToGoGood
			}
			var length int
			if math.Abs(p) < 10e-10 {
				length = errorsCount
			} else {
				length = geometric(p)

			}
			if length > errorsCount-pos {
				length = errorsCount - pos
			}
			runs = append(runs, run{bad: isBad, start: pos, end: pos + length})
			pos += length
			isBad = !isBad
		}

		thresholdGood := uint64(np.PropabilityInGoodCondition*float64(uint64(1)<<decisionBits) + 0.5)
		thresholdBad := uint64(np.PropabilityInBadCondition*float64(uint64(1)<<decisionBits) + 0.5)

		baseSeed := uint64(time.Now().UnixNano())

		var wg sync.WaitGroup
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
					// генерация ошибки
					run := runs[i]
					threshold := thresholdGood
					if run.bad {
						threshold = thresholdBad
					}
					for j := run.start; j < run.end; j++ {
						errors[j] = calcError(decisionsPerWord, rng, decisionMask, threshold, decisionBits)
					}
					// var err uint64
					// p := np.PropabilityToGoGood
					// if isBad {
					// 	p = np.PropabilityToGoBad
					// }
					// for j := 0; j < 64; j++ {
					// 	if rng.Float64() < p {
					// 		err |= 1 << j
					// 	}
					// }
					// errors[i] = err

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
		for i := range runs {
			select {
			case jobs <- i:
			// если закрыли окно
			case <-s.ctx.Done():
				shutdown()
				return s.ctx.Err()
			}
		}
		shutdown()

	default:
		return fmt.Errorf("unhandled network error type: %s", np.Mode)
	}

	app.Event.Emit("error-generation:finished", taskId)

	return nil
}
