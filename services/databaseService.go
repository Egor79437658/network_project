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
	db *sql.DB
}

func NewDatabaseService() *DatabaseService {
	return &DatabaseService{}
}

type simulationResultCreate struct {
	*DecoderStatistics
	DataLength    uint8                 `json:"dataLength"`
	MessageLength uint8                 `json:"messageLength"`
	Polynomial    uint64                `json:"polynomial"`
	NetworkParams NetworkLineStartState `json:"networkParams"`
}

type SimulationResult struct {
	*simulationResultCreate
	Id int
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

	targetPath := filepath.Join(baseDir, "network_lab")

	err = os.MkdirAll(targetPath, os.ModePerm)
	if err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	s.db, err = sql.Open("sqlite3", filepath.Join(targetPath, "app.db"))
	if err != nil {
		return err
	}

	if err := s.runMigrations(); err != nil {
		return err
	}

	return nil
}

// ServiceShutdown is called when the application shuts down
func (s *DatabaseService) ServiceShutdown() error {
	if s.db != nil {
		return s.db.Close()
	}
	return nil
}

func (s *DatabaseService) writeSimulationResults(data simulationResultCreate) (int64, error) {

	networkParamsString, err := json.Marshal(data.NetworkParams)
	if err != nil {
		return -1, fmt.Errorf("error converting network params to string: %w", err)
	}

	result, err := s.db.Exec(`insert into data (
								data_length,
								message_length,
								polynomial,
								network_params,
								packets_transmited,
    							detected_errors,
    							undetected_errors
							  ) values ($1, $2, $3, $4, $5, $6, $7)`,
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

	rows, err := s.db.Query("select * from data offset $1 limit $2", params.Offset, params.Limit)
	if err != nil {
		panic(err)
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

	return results, err
}
