package services

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"

	_ "github.com/mattn/go-sqlite3"

	"github.com/wailsapp/wails/v3/pkg/application"
)

type DatabaseService struct {
	db              *sql.DB
	createStatement *sql.Stmt
	readStatement   *sql.Stmt
	dbFilePath      string
}

func NewDatabaseService() *DatabaseService {
	return &DatabaseService{}
}

type simulationResultCreate struct {
	DecoderStatistics
	DataLength    uint8                 `json:"dataLength"`
	MessageLength uint8                 `json:"messageLength"`
	Polynomial    uint64                `json:"polynomial"`
	NetworkParams NetworkLineStartState `json:"networkParams"`
}

type SimulationResult struct {
	simulationResultCreate
	Id int `json:"id"`
}

type GetSimulationResultsParams struct {
	Offset uint `json:"offset"`
	Limit  uint `json:"limit"`
}

func (s *DatabaseService) runMigrations() error {
	sqlStmt := `
	CREATE TABLE IF NOT EXISTS data (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		data_length INTEGER NOT NULL,
		message_length INTEGER NOT NULL,
		polynomial TEXT NOT NULL,
		network_params TEXT NOT NULL, -- json объект
		packets_transmited INTEGER NOT NULL,
		detected_errors INTEGER NOT NULL,
		undetected_errors INTEGER NOT NULL
		);
		`
	_, err := s.db.Exec(sqlStmt)
	return err
}

func (s *DatabaseService) ServiceStartup(ctx context.Context, options application.ServiceOptions) error {
	var err error

	baseDir, err := os.UserConfigDir()
	if err != nil {
		baseDir = ""
	}

	targetDir := filepath.Join(baseDir, "network_lab")

	err = os.MkdirAll(targetDir, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	dbFile := filepath.Join(targetDir, "app.db")
	s.dbFilePath = dbFile

	s.db, err = sql.Open("sqlite3", dbFile)
	if err != nil {
		return err
	}

	if err := s.runMigrations(); err != nil {
		return err
	}

	createStatement, err := s.db.PrepareContext(ctx,
		`insert into data (
			data_length,
			message_length,
			polynomial,
			network_params,
			packets_transmited,
			detected_errors,
			undetected_errors
		)
		 values ($1, $2, $3, $4, $5, $6, $7);`)
	if err != nil {
		return err
	}
	s.createStatement = createStatement

	readStatement, err := s.db.PrepareContext(ctx,
		`select * from data order by id DESC limit $1 offset $2;`)
	if err != nil {
		return err
	}
	s.readStatement = readStatement

	return nil
}

// ServiceShutdown is called when the application shuts down
func (s *DatabaseService) ServiceShutdown() error {
	var dbCloseErr, cSErr, rSErr error
	if s.db != nil {
		dbCloseErr = s.db.Close()
	}
	if s.createStatement != nil {
		cSErr = s.createStatement.Close()
	}
	if s.readStatement != nil {
		rSErr = s.readStatement.Close()
	}
	if dbCloseErr != nil {
		return dbCloseErr
	}
	if cSErr != nil {
		return cSErr
	}
	if rSErr != nil {
		return rSErr
	}
	return nil
}

func (s *DatabaseService) writeSimulationResults(data simulationResultCreate) (int64, error) {

	networkParamsString, err := json.Marshal(data.NetworkParams)
	if err != nil {
		return -1, fmt.Errorf("error converting network params to string: %w", err)
	}

	result, err := s.createStatement.Exec(
		data.DataLength,
		data.MessageLength,
		data.Polynomial,
		networkParamsString,
		data.TotalTransmited,
		data.DetectedErrors,
		data.UndetectedErrors,
	)
	if err != nil {
		return -1, fmt.Errorf("error writing data: %w", err)
	}
	return result.LastInsertId()
}

func (s *DatabaseService) GetSimulationResults(params GetSimulationResultsParams) ([]SimulationResult, error) {

	rows, err := s.readStatement.Query(params.Limit, params.Offset)
	if err != nil {
		return nil, fmt.Errorf("failed to run query: %w", err)
	}
	defer rows.Close()
	results := []SimulationResult{}

	for rows.Next() {
		result := SimulationResult{}
		var networkParamsString []byte
		err := rows.Scan(
			&result.Id,
			&result.DataLength,
			&result.MessageLength,
			&result.Polynomial,
			&networkParamsString,
			&result.TotalTransmited,
			&result.DetectedErrors,
			&result.UndetectedErrors,
		)
		if err != nil {
			return results, fmt.Errorf("error when retrieving data: %w", err)
		}
		err = json.Unmarshal(networkParamsString, &result.NetworkParams)
		if err != nil {
			return results, fmt.Errorf("error when parsing network params: %w", err)
		}
		results = append(results, result)
	}

	if err = rows.Err(); err != nil {
		return results, err
	}
	// fmt.Printf("params: %+v\nrows: %+v\n", params, rows)

	return results, err
}

func (s *DatabaseService) GetDbFilePath() string {
	return s.dbFilePath
}
