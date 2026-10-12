package main

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type SimulationService struct{}

func NewSimulationService() *SimulationService {
	return &SimulationService{}
}

type PolinomialMode string
type NetworkLineMode string

const (
	Array  PolinomialMode = "array"
	Binary PolinomialMode = "binary"
)

const (
	Independed NetworkLineMode = "independed"
	Guilbert   NetworkLineMode = "guilbert"
)

type CoderStartState struct {
	DataLength     int8           `json:"dataLength"`
	Polinomial     *string        `json:"polinomial"`
	PolinomialMode PolinomialMode `json:"polinomialMode"`
}

type NetworkLineStartState struct {
	Mode                  NetworkLineMode `json:"mode"`
	IndependedPropability float32         `json:"independedPropability"`

	PropabilityInGoodCondition float32 `json:"propabilityInGoodCondition"`
	PropabilityInBadCondition  float32 `json:"propabilityInBadCondition"`
	PropabilityToGoBad         float32 `json:"propabilityToGoBad"`
	PropabilityToGoGood        float32 `json:"propabilityToGoGood"`
}

type ErrorProcessingControlsStartSate struct {
	TotalPacketsToStop          int64 `json:"totalPacketsToStop"`
	TotalUndetectedErrorsToStop int64 `json:"totalUndetectedErrorsToStop"`
}

type SimulationServiceStart struct {
	Coder           CoderStartState                  `json:"coder"`
	NetworkLine     NetworkLineStartState            `json:"networkLine"`
	ErrorProcessing ErrorProcessingControlsStartSate `json:"errorProcessing"`
}

func (g *SimulationService) StartSimulation(data SimulationServiceStart) string {
	jsonData, _ := json.MarshalIndent(data, "", "\t")
	fmt.Println(string(jsonData))

	app := application.Get()
	simulationId := "id"
	app.Event.Emit("simulation:started", simulationId)

	go func() {
		for i := range 100 {
			fmt.Println(strconv.Itoa(i))
			app.Event.Emit("simulation:progress", i+1)
			time.Sleep(time.Millisecond * 100)
		}
		app.Event.Emit("simulation:finished", simulationId)
	}()

	return simulationId
}
