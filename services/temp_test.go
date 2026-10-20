package services

import (
	"math"
	"math/bits"
	"math/rand/v2"
	"testing"
)

func distancesFromBits(errs []uint64) []int {
	var out []int
	var lastPos int64 = -1
	for i, w := range errs {
		for w != 0 {
			b := bits.TrailingZeros64(w)
			pos := int64(i*64 + b)
			if lastPos >= 0 {
				out = append(out, int(pos-lastPos))
			}
			lastPos = pos
			w &^= 1 << b
		}
	}
	return out
}

func expectedFraction(k int, p float64) float64 {
	return math.Pow(1-p, float64(k-1)) * p
}

func TestDistanceDistribution(t *testing.T) {
	const decisionBits = 16
	const decisionsPerWord = 64 / decisionBits // = 4
	const decisionMask = uint64(1)<<decisionBits - 1

	cases := []struct {
		name string
		p    float64
	}{
		{"p=0.01", 0.01},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {

			threshold := uint64(float64(tc.p)*float64(1<<decisionBits) + 0.5)
			const elements = 1_000_000
			errors := make([]uint64, elements)
			errors_2 := make([]uint64, elements)

			rng := rand.New(rand.NewPCG(1, 1))
			for i := range errors {
				var err uint64
				for j := 0; j < 64; j++ {
					if rng.Float64() < tc.p {
						err |= 1 << j
					}
				}
				errors[i] = err
				errors_2[i] = calcError(decisionsPerWord, rng, decisionMask, threshold, decisionBits)
			}

			distances := distancesFromBits(errors)
			distances_2 := distancesFromBits(errors_2)
			total := len(distances)
			total_2 := len(distances_2)

			var sum int
			var sum_2 int
			buckets := map[int]int{}
			buckets_2 := map[int]int{}
			for _, d := range distances {
				sum += d
				buckets[d]++
			}
			for _, d := range distances_2 {
				sum_2 += d
				buckets_2[d]++
			}
			meanGap := float64(sum) / float64(total)
			meanGap_2 := float64(sum_2) / float64(total_2)

			t.Logf("p=%.2f totalGaps=%d meanGap=%.4f (expected %.4f)",
				tc.p, total, meanGap, 1/float64(tc.p))
			t.Logf("p=%.2f totalGaps_2=%d meanGap_2=%.4f (expected %.4f)",
				tc.p, total_2, meanGap_2, 1/float64(tc.p))

			for k := range 101 {
				obs := buckets[k]
				obs_2 := buckets_2[k]
				expP := expectedFraction(k, float64(tc.p))
				expN := expP * float64(total)
				expN_2 := expP * float64(total_2)
				t.Logf("  gap=%d observed=%d (%.4f) expected=%.0f (%.4f)",
					k, obs, float64(obs)/float64(total), expN, expP)
				t.Logf("  gap=%d observed_2=%d (%.4f) expected_2=%.0f (%.4f)",
					k, obs_2, float64(obs_2)/float64(total_2), expN_2, expP)
				t.Logf("  gap=%d diff=%d",
					k, obs-obs_2)
			}
		})
	}
}
