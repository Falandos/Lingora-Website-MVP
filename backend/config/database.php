<?php
// Database configuration for Lingora
// This file should be secured and not accessible via web

class Database {
    private $host;
    private $database;
    private $username;
    private $password;
    private $charset;
    private $pdo;

    public function __construct() {
        // Load configuration from environment or set defaults
        $this->host = $_ENV['DB_HOST'] ?? 'localhost';
        $this->database = $_ENV['DB_NAME'] ?? 'lingora';
        $this->username = $_ENV['DB_USER'] ?? 'root';
        $this->password = $_ENV['DB_PASS'] ?? '';
        $this->charset = 'utf8mb4';
    }

    public function connect() {
        if ($this->pdo === null) {
            $dsn = "mysql:host={$this->host};dbname={$this->database};charset={$this->charset}";
            
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
                PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
            ];

            try {
                $this->pdo = new PDO($dsn, $this->username, $this->password, $options);
            } catch (PDOException $e) {
                error_log("Database connection failed: " . $e->getMessage());
                throw new PDOException("Database connection failed");
            }
        }

        return $this->pdo;
    }

    public function disconnect() {
        $this->pdo = null;
    }

    public function beginTransaction() {
        return $this->connect()->beginTransaction();
    }

    public function commit() {
        return $this->connect()->commit();
    }

    public function rollback() {
        return $this->connect()->rollback();
    }

    public function lastInsertId() {
        return $this->connect()->lastInsertId();
    }

    // Execute a query with optional parameters
    public function query($sql, $params = []) {
        try {
            $stmt = $this->connect()->prepare($sql);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $e) {
            error_log("Query failed: " . $e->getMessage() . " SQL: " . $sql);
            throw $e;
        }
    }

    // Fetch all rows
    public function fetchAll($sql, $params = []) {
        return $this->query($sql, $params)->fetchAll();
    }

    // Fetch single row
    public function fetchOne($sql, $params = []) {
        return $this->query($sql, $params)->fetch();
    }

    // Get row count
    public function rowCount($sql, $params = []) {
        return $this->query($sql, $params)->rowCount();
    }
}
?>