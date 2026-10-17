package services

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/pasztorpisti/go-crc"
	"github.com/wailsapp/wails/v3/pkg/application"
)

type SimulationService struct {
	errorGenerator   *ErrorGeneratorService
	messageGenerator *MessageGenerationService
	coderService     *CoderService
	decoderService   *DecoderService
	dataBaseService  *DatabaseService
	ctx              context.Context
}

func NewSimulationService(
	errorGenerator *ErrorGeneratorService,
	messageGenerator *MessageGenerationService,
	coderService *CoderService,
	decoderService *DecoderService,
	dataBaseService *DatabaseService,
) *SimulationService {
	return &SimulationService{
		errorGenerator:   errorGenerator,
		messageGenerator: messageGenerator,
		coderService:     coderService,
		decoderService:   decoderService,
		dataBaseService:  dataBaseService,
	}
}

func (s *SimulationService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	s.ctx = ctx
	return nil
}

type PolynomialMode string
type NetworkLineMode string

const (
	Array  PolynomialMode = "array"
	Binary PolynomialMode = "binary"
)

const (
	Independed NetworkLineMode = "independed"
	Gilbert    NetworkLineMode = "gilbert"
)

type CoderStartState struct {
	DataLength uint8 `json:"dataLength"`
	//! должен быть в формате msb
	Polynomial       uint64 `json:"polynomial"`
	PolynomialDegree uint8  `json:"polynomialDegree"`
	MessageLength    uint8  `json:"messageLength"`
}

type NetworkLineStartState struct {
	Mode                  NetworkLineMode `json:"mode"`
	IndependedPropability float64         `json:"independedPropability"`

	PropabilityInGoodCondition float64 `json:"propabilityInGoodCondition"`
	PropabilityInBadCondition  float64 `json:"propabilityInBadCondition"`
	PropabilityToGoBad         float64 `json:"propabilityToGoBad"`
	PropabilityToGoGood        float64 `json:"propabilityToGoGood"`
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

func (s *SimulationService) emitProgress(app *application.App, progress float32) {
	app.Event.Emit("simulation:progress", progress)
}

func (s *SimulationService) applyErrors(data []uint64, errors []uint64, dataLength uint8) error {
	app := application.Get()

	size := len(data)
	if size != len(errors) {
		return fmt.Errorf("lengths of data and errors must be equal, got %d and %d", size, len(errors))
	}

	MessageLengthMask := uint64(1)<<uint64(dataLength) - 1
	const batch = 10000

	for start := 0; start < size; start += batch {
		end := min(start+batch, size)

		s.emitProgress(app, float32(start)/float32(size)*20+60.0)

		chunk := data[start:end]
		errChunk := errors[start:end]
		for i := range chunk {
			chunk[i] ^= errChunk[i] & MessageLengthMask
		}
	}

	return nil
}

func (s *SimulationService) StartSimulation(data SimulationServiceStart) uuid.UUID {

	if data.Coder.MessageLength == 0 || data.Coder.MessageLength > 64 {
		panic(fmt.Errorf("MessageLength must be 1..64, got %d", data.Coder.MessageLength))
	}
	if data.Coder.DataLength == 0 || data.Coder.DataLength > 64 {
		panic(fmt.Errorf("DataLength must be 1..64, got %d", data.Coder.DataLength))
	}

	app := application.Get()
	simulationId := uuid.New()
	app.Event.Emit("simulation:started", simulationId)

	// генерация потока ошибок
	s.emitProgress(app, 1.0)
	errors := make([]uint64, data.ErrorProcessing.TotalPacketsToStop)

	if err := s.errorGenerator.generateErrors(errors, data.NetworkLine, simulationId); err != nil {
		app.Event.Emit("error-generation:error", err.Error())
		app.Event.Emit("simulation:error", "Ошибка при генерации ошибок")
		panic(err.Error())
	}
	s.emitProgress(app, 20.0)

	// генерация сообщений
	messages := make([]uint64, data.ErrorProcessing.TotalPacketsToStop)

	if err := s.messageGenerator.generateMessages(messages, simulationId); err != nil {
		app.Event.Emit("data-generation:error", err.Error())
		app.Event.Emit("simulation:error", "Ошибка при генерации сообщений")
		panic(err.Error())
	}
	s.emitProgress(app, 40.0)

	// кодирование сообщений
	codedMessages := make([]uint64, data.ErrorProcessing.TotalPacketsToStop)
	// строим алгоритм
	// fmt.Printf("data.Coder: %+v\n", data.Coder)
	algo, err := crc.NewAlgo(
		int(data.Coder.PolynomialDegree),
		data.Coder.Polynomial,
		0x00,
		0x00,
		false,
		false,
	)
	if err != nil {
		app.Event.Emit("coder:error", err.Error())
		app.Event.Emit("simulation:error", "Ошибка при создании алгоритма кодирования")
		panic(err.Error())
	}
	if err := s.coderService.codeMessages(data.Coder.MessageLength, data.Coder.PolynomialDegree, messages, codedMessages, algo, simulationId); err != nil {
		app.Event.Emit("coder:error", err.Error())
		app.Event.Emit("simulation:error", "Ошибка при кодировании сообщений")
		panic(err.Error())
	}
	s.emitProgress(app, 60.0)

	// применение ошибок
	if err := s.applyErrors(codedMessages, errors, data.Coder.DataLength); err != nil {
		app.Event.Emit("simulation:error", "Ошибка при применении ошибок")
		panic(err.Error())
	}
	s.emitProgress(app, 80.0)

	simulationStats, err := s.decoderService.decodeMessages(data.Coder.MessageLength, data.Coder.PolynomialDegree, messages, codedMessages, algo, uint64(data.ErrorProcessing.TotalUndetectedErrorsToStop), simulationId)
	if err != nil {
		app.Event.Emit("decoder:error", err.Error())
		app.Event.Emit("simulation:error", "Ошибка при дeкодировании сообщений")
		panic(err.Error())
	}
	s.emitProgress(app, 99.0)

	simaulationResults := simulationResultCreate{
		DataLength:        data.Coder.DataLength,
		MessageLength:     data.Coder.MessageLength,
		Polynomial:        data.Coder.Polynomial,
		NetworkParams:     data.NetworkLine,
		DecoderStatistics: simulationStats,
	}

	if _, err := s.dataBaseService.writeSimulationResults(simaulationResults); err != nil {
		app.Event.Emit("simulation:error", "Ошибка при сохранении результатов")
		panic(err.Error())
	}

	app.Event.Emit("simulation:finished", simulationStats)

	return simulationId
}

func (s *SimulationService) OpenSourceCode() error {
	app := application.Get()

	err := app.Browser.OpenURL("https://github.com/Egor79437658/network_project")
	if err != nil {
		app.Logger.Error("Failed to open GitHub", "error", err)
		return err
	}
	return nil
}
