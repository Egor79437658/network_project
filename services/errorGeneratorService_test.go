package services

import (
	"context"
	"math/bits"
	"math/rand/v2"
	"testing"

	"github.com/google/uuid"
)

func TestErrorGeneratorService_generateErrors(t *testing.T) {
	tests := []struct {
		name string // description of this test case
		// Named input parameters for target function.
		errors  []uint64
		np      NetworkLineStartState
		taskId  uuid.UUID
		wantErr bool
	}{
		// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := NewErrorGeneratorService()
			gotErr := s.generateErrors(tt.errors, tt.np, tt.taskId)
			if gotErr != nil {
				if !tt.wantErr {
					t.Errorf("generateErrors() failed: %v", gotErr)
				}
				return
			}
			if tt.wantErr {
				t.Fatal("generateErrors() succeeded unexpectedly")
			}
		})
	}
}

func TestDirection(t *testing.T) {
	for _, p := range []float64{0.1, 0.3, 0.5, 0.7, 0.9} {
		np := NetworkLineStartState{Mode: Independed, IndependedPropability: p}
		errs := make([]uint64, 4096)
		s := NewErrorGeneratorService()
		s.ctx = context.Background()
		// call the inner logic without Wails:
		threshold := uint64(np.IndependedPropability*float64(1<<16) + 0.5)
		rng := rand.New(rand.NewPCG(1, 1))
		var count int
		for i := range errs {
			errs[i] = calcError(4, rng, 0xFFFF, threshold, 16)
			count += bits.OnesCount64(errs[i])
		}
		t.Logf("p=%.2f  set bits=%d  (expect ≈ %d)", p, count, int(p*64*float64(len(errs))))
	}
}
