package main

import (
	"context"
	"fmt"
	"math/rand/v2"
	"sync"

	"github.com/google/uuid"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type GuilbertState string

const (
	Good PolinomialMode = "good"
	Bad  PolinomialMode = "bad"
)

type ErrorGeneratorService struct {
	ctx context.Context
}

func NewErrorGeneratorService() *ErrorGeneratorService {
	return &ErrorGeneratorService{}
}

func (s *ErrorGeneratorService) emitProgress(app *application.App, progress float64) {
	app.Event.Emit("error-generation:progress", progress)
}

func (s *ErrorGeneratorService) generateErrors(size int64, np NetworkLineStartState, taskId uuid.UUID) ([]int8, error) {
	errors := make([]int8, size)
	app := application.Get()

	const batch = int64(1000)

	app.Event.Emit("error-generation:started", taskId)
	defer app.Event.Emit("error-generation:finished", taskId)

	switch np.Mode {
	case Independed:
		progress := make(chan struct{}, 64)
		consumerDone := make(chan struct{})

		go func() {
			defer close(consumerDone)
			var n int64
			for range progress {
				n++
				if n%batch == 0 {
					s.emitProgress(app, float64(n)/float64(size)*100)
				}
			}
			s.emitProgress(app, 100)
		}()

		var wg sync.WaitGroup
		for i := range size {
			wg.Go(func() {
				select {
				case <-s.ctx.Done():
					return
				default:
				}

				select {
				case progress <- struct{}{}:
				default:
				}

				var e int8
				for j := 0; j < 8; j++ {
					if rand.Float32() < np.IndependedPropability {
						e |= 1 << j
					}
				}
				errors[i] = e
			})
		}
		wg.Wait()

		close(progress)
		<-consumerDone

	case Guilbert:
		condition := Good
		for i := range size {
			select {
			case <-s.ctx.Done():
				return errors, nil
			default:
			}

			if (i+1)%batch == 0 {
				s.emitProgress(app, float64(i+1)/float64(size)*100)
			}

			var e int8
			switch condition {
			case Good:
				for j := 0; j < 8; j++ {
					if rand.Float32() < np.PropabilityInGoodCondition {
						e |= 1 << j
					}
				}
				if rand.Float32() < np.PropabilityToGoBad {
					condition = Bad
				}
			case Bad:
				for j := 0; j < 8; j++ {
					if rand.Float32() < np.PropabilityInBadCondition {
						e |= 1 << j
					}
				}
				if rand.Float32() < np.PropabilityToGoGood {
					condition = Good
				}
			}
			errors[i] = e
		}
		s.emitProgress(app, 100)

	default:
		return nil, fmt.Errorf("unhandled network error type: %s", np.Mode)
	}

	return errors, nil
}
