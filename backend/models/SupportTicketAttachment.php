<?php

class SupportTicketAttachment {
    private $db;
    private $uploadPath;
    private $thumbnailPath;
    private $allowedTypes;
    private $maxFileSize;

    public function __construct($database) {
        $this->db = $database;
        $this->uploadPath = dirname(__DIR__) . '/uploads/support/tickets/';
        $this->thumbnailPath = dirname(__DIR__) . '/uploads/support/thumbnails/';
        $this->allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'txt', 'zip'];
        $this->maxFileSize = 10 * 1024 * 1024; // 10MB
        
        // Create directories if they don't exist
        $this->createDirectories();
    }

    /**
     * Handle file upload for ticket or response
     */
    public function upload($file, $ticketId, $uploaderId, $uploaderType, $responseId = null) {
        // Validate file
        $validation = $this->validateFile($file);
        if (!$validation['valid']) {
            return ['success' => false, 'error' => $validation['error']];
        }

        // Generate unique filename
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $storedFilename = $this->generateUniqueFilename($fileExtension);
        
        // Create year/month directory structure
        $yearMonth = date('Y/m');
        $fullUploadPath = $this->uploadPath . $yearMonth . '/';
        $fullThumbnailPath = $this->thumbnailPath . $yearMonth . '/';
        
        if (!is_dir($fullUploadPath)) {
            mkdir($fullUploadPath, 0755, true);
        }
        if (!is_dir($fullThumbnailPath)) {
            mkdir($fullThumbnailPath, 0755, true);
        }

        $filePath = $fullUploadPath . $storedFilename;
        $relativePath = 'uploads/support/tickets/' . $yearMonth . '/' . $storedFilename;

        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            return ['success' => false, 'error' => 'Failed to move uploaded file'];
        }

        // Prepare metadata
        $metadata = [
            'upload_ip' => $_SERVER['REMOTE_ADDR'] ?? null,
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? null
        ];

        // Check if it's an image and create thumbnail
        $isImage = $this->isImageFile($fileExtension);
        $thumbnailPath = null;
        
        if ($isImage) {
            $thumbnailResult = $this->createThumbnail($filePath, $fullThumbnailPath . $storedFilename);
            if ($thumbnailResult['success']) {
                $thumbnailPath = 'uploads/support/thumbnails/' . $yearMonth . '/' . $storedFilename;
                $metadata['thumbnail_created'] = true;
                $metadata['image_dimensions'] = $this->getImageDimensions($filePath);
            }
        }

        // Save to database
        $query = "INSERT INTO support_ticket_attachments (
            ticket_id, response_id, uploader_id, uploader_type,
            original_filename, stored_filename, file_path, file_size,
            file_type, file_extension, is_image, thumbnail_path,
            upload_status, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed', ?, NOW())";

        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([
            $ticketId,
            $responseId,
            $uploaderId,
            $uploaderType,
            $file['name'],
            $storedFilename,
            $relativePath,
            $file['size'],
            $file['type'],
            $fileExtension,
            $isImage ? 1 : 0,
            $thumbnailPath,
            json_encode($metadata)
        ]);

        if ($success) {
            $attachmentId = $this->db->lastInsertId();
            
            // Log activity
            $this->logTicketActivity($ticketId, $uploaderId, $uploaderType, 'attachment_added', 
                "File uploaded: {$file['name']}", ['attachment_id' => $attachmentId]);

            return [
                'success' => true,
                'attachment_id' => $attachmentId,
                'filename' => $storedFilename,
                'original_name' => $file['name'],
                'file_size' => $file['size'],
                'is_image' => $isImage,
                'thumbnail_path' => $thumbnailPath
            ];
        }

        // If database save failed, clean up file
        unlink($filePath);
        if ($thumbnailPath && file_exists($fullThumbnailPath . $storedFilename)) {
            unlink($fullThumbnailPath . $storedFilename);
        }

        return ['success' => false, 'error' => 'Failed to save attachment record'];
    }

    /**
     * Get attachments for a ticket or response
     */
    public function getByTicket($ticketId, $responseId = null) {
        $query = "SELECT a.*, u.email as uploader_email 
                  FROM support_ticket_attachments a
                  LEFT JOIN users u ON a.uploader_id = u.id
                  WHERE a.ticket_id = ? AND a.upload_status = 'completed'";
        
        $params = [$ticketId];
        
        if ($responseId !== null) {
            $query .= " AND a.response_id = ?";
            $params[] = $responseId;
        }
        
        $query .= " ORDER BY a.created_at ASC";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    /**
     * Get attachment by ID
     */
    public function getById($attachmentId) {
        $query = "SELECT a.*, t.ticket_number, u.email as uploader_email 
                  FROM support_ticket_attachments a
                  LEFT JOIN support_tickets t ON a.ticket_id = t.id
                  LEFT JOIN users u ON a.uploader_id = u.id
                  WHERE a.id = ?";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$attachmentId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    /**
     * Download attachment (with access control)
     */
    public function download($attachmentId, $userId, $userRole) {
        $attachment = $this->getById($attachmentId);
        if (!$attachment) {
            return ['success' => false, 'error' => 'Attachment not found'];
        }

        // Check access permissions
        if (!$this->canAccessAttachment($attachment['ticket_id'], $userId, $userRole)) {
            return ['success' => false, 'error' => 'Access denied'];
        }

        $filePath = dirname(__DIR__) . '/' . $attachment['file_path'];
        if (!file_exists($filePath)) {
            return ['success' => false, 'error' => 'File not found on disk'];
        }

        // Increment download count
        $this->incrementDownloadCount($attachmentId);

        return [
            'success' => true,
            'file_path' => $filePath,
            'original_filename' => $attachment['original_filename'],
            'file_type' => $attachment['file_type'],
            'file_size' => $attachment['file_size']
        ];
    }

    /**
     * Delete attachment
     */
    public function delete($attachmentId, $deletedBy, $deletedByType) {
        $attachment = $this->getById($attachmentId);
        if (!$attachment) {
            return ['success' => false, 'error' => 'Attachment not found'];
        }

        // Delete files from disk
        $filePath = dirname(__DIR__) . '/' . $attachment['file_path'];
        if (file_exists($filePath)) {
            unlink($filePath);
        }

        if ($attachment['thumbnail_path']) {
            $thumbnailPath = dirname(__DIR__) . '/' . $attachment['thumbnail_path'];
            if (file_exists($thumbnailPath)) {
                unlink($thumbnailPath);
            }
        }

        // Update database record
        $query = "UPDATE support_ticket_attachments SET upload_status = 'deleted', updated_at = NOW() WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $success = $stmt->execute([$attachmentId]);

        if ($success) {
            // Log activity
            $this->logTicketActivity($attachment['ticket_id'], $deletedBy, $deletedByType, 
                'attachment_removed', "File deleted: {$attachment['original_filename']}");

            return ['success' => true];
        }

        return ['success' => false, 'error' => 'Failed to delete attachment record'];
    }

    /**
     * Validate uploaded file
     */
    private function validateFile($file) {
        if (!isset($file['error']) || is_array($file['error'])) {
            return ['valid' => false, 'error' => 'Invalid file upload'];
        }

        switch ($file['error']) {
            case UPLOAD_ERR_OK:
                break;
            case UPLOAD_ERR_NO_FILE:
                return ['valid' => false, 'error' => 'No file was uploaded'];
            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                return ['valid' => false, 'error' => 'File exceeds maximum size limit'];
            default:
                return ['valid' => false, 'error' => 'Unknown upload error'];
        }

        // Check file size
        if ($file['size'] > $this->maxFileSize) {
            return ['valid' => false, 'error' => 'File size exceeds 10MB limit'];
        }

        // Check file extension
        $fileExtension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $this->allowedTypes)) {
            return ['valid' => false, 'error' => 'File type not allowed'];
        }

        // Basic security check - verify MIME type matches extension
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        if (false === $ext = array_search(
            $finfo->file($file['tmp_name']),
            [
                'jpg' => 'image/jpeg',
                'jpeg' => 'image/jpeg',
                'png' => 'image/png',
                'gif' => 'image/gif',
                'pdf' => 'application/pdf',
                'doc' => 'application/msword',
                'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'txt' => 'text/plain',
                'zip' => 'application/zip'
            ],
            true
        )) {
            // Allow if extension matches but MIME type detection fails (common for some files)
            if (!in_array($fileExtension, ['doc', 'docx', 'zip'])) {
                return ['valid' => false, 'error' => 'File type mismatch'];
            }
        }

        return ['valid' => true];
    }

    /**
     * Generate unique filename
     */
    private function generateUniqueFilename($extension) {
        return uniqid('ticket_', true) . '.' . $extension;
    }

    /**
     * Check if file is an image
     */
    private function isImageFile($extension) {
        return in_array($extension, ['jpg', 'jpeg', 'png', 'gif']);
    }

    /**
     * Create thumbnail for image files
     */
    private function createThumbnail($sourcePath, $thumbnailPath, $maxWidth = 300, $maxHeight = 300) {
        try {
            $imageInfo = getimagesize($sourcePath);
            if (!$imageInfo) {
                return ['success' => false, 'error' => 'Invalid image file'];
            }

            list($width, $height, $type) = $imageInfo;

            // Calculate thumbnail dimensions
            $ratio = min($maxWidth / $width, $maxHeight / $height);
            $thumbWidth = intval($width * $ratio);
            $thumbHeight = intval($height * $ratio);

            // Create source image
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $source = imagecreatefromjpeg($sourcePath);
                    break;
                case IMAGETYPE_PNG:
                    $source = imagecreatefrompng($sourcePath);
                    break;
                case IMAGETYPE_GIF:
                    $source = imagecreatefromgif($sourcePath);
                    break;
                default:
                    return ['success' => false, 'error' => 'Unsupported image type'];
            }

            if (!$source) {
                return ['success' => false, 'error' => 'Failed to create source image'];
            }

            // Create thumbnail
            $thumbnail = imagecreatetruecolor($thumbWidth, $thumbHeight);
            
            // Preserve transparency for PNG and GIF
            if ($type === IMAGETYPE_PNG || $type === IMAGETYPE_GIF) {
                imagealphablending($thumbnail, false);
                imagesavealpha($thumbnail, true);
            }

            imagecopyresampled($thumbnail, $source, 0, 0, 0, 0, 
                $thumbWidth, $thumbHeight, $width, $height);

            // Save thumbnail
            $success = false;
            switch ($type) {
                case IMAGETYPE_JPEG:
                    $success = imagejpeg($thumbnail, $thumbnailPath, 85);
                    break;
                case IMAGETYPE_PNG:
                    $success = imagepng($thumbnail, $thumbnailPath);
                    break;
                case IMAGETYPE_GIF:
                    $success = imagegif($thumbnail, $thumbnailPath);
                    break;
            }

            imagedestroy($source);
            imagedestroy($thumbnail);

            return ['success' => $success];

        } catch (Exception $e) {
            return ['success' => false, 'error' => 'Thumbnail creation failed: ' . $e->getMessage()];
        }
    }

    /**
     * Get image dimensions
     */
    private function getImageDimensions($imagePath) {
        $imageInfo = getimagesize($imagePath);
        if ($imageInfo) {
            return [
                'width' => $imageInfo[0],
                'height' => $imageInfo[1]
            ];
        }
        return null;
    }

    /**
     * Check if user can access attachment
     */
    private function canAccessAttachment($ticketId, $userId, $userRole) {
        if ($userRole === 'admin') {
            return true;
        }

        // Check if user has access to the ticket
        $query = "SELECT id FROM support_tickets WHERE id = ? AND (
            user_id = ? OR 
            (provider_id IS NOT NULL AND provider_id = (SELECT id FROM providers WHERE user_id = ?))
        )";
        
        $stmt = $this->db->prepare($query);
        $stmt->execute([$ticketId, $userId, $userId]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC) !== false;
    }

    /**
     * Increment download count
     */
    private function incrementDownloadCount($attachmentId) {
        $query = "UPDATE support_ticket_attachments SET download_count = download_count + 1 WHERE id = ?";
        $stmt = $this->db->prepare($query);
        $stmt->execute([$attachmentId]);
    }

    /**
     * Create necessary directories
     */
    private function createDirectories() {
        if (!is_dir($this->uploadPath)) {
            mkdir($this->uploadPath, 0755, true);
        }
        if (!is_dir($this->thumbnailPath)) {
            mkdir($this->thumbnailPath, 0755, true);
        }
    }

    /**
     * Log ticket activity
     */
    private function logTicketActivity($ticketId, $userId, $userType, $activityType, $description, $metadata = null) {
        $query = "INSERT INTO support_ticket_activity (
            ticket_id, user_id, user_type, activity_type, description, 
            metadata, ip_address, user_agent, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())";

        $stmt = $this->db->prepare($query);
        $stmt->execute([
            $ticketId,
            $userId,
            $userType,
            $activityType,
            $description,
            $metadata ? json_encode($metadata) : null,
            $_SERVER['REMOTE_ADDR'] ?? null,
            $_SERVER['HTTP_USER_AGENT'] ?? null
        ]);
    }

    /**
     * Get attachment statistics
     */
    public function getStatistics($userId = null, $userType = null) {
        $conditions = ['upload_status = "completed"'];
        $params = [];

        if ($userId && $userType) {
            $conditions[] = "uploader_id = ? AND uploader_type = ?";
            $params[] = $userId;
            $params[] = $userType;
        }

        $whereClause = implode(' AND ', $conditions);

        $query = "SELECT 
                    COUNT(*) as total_attachments,
                    SUM(file_size) as total_size_bytes,
                    AVG(file_size) as avg_file_size,
                    SUM(CASE WHEN is_image = 1 THEN 1 ELSE 0 END) as image_count,
                    SUM(download_count) as total_downloads,
                    COUNT(DISTINCT ticket_id) as tickets_with_attachments
                  FROM support_ticket_attachments 
                  WHERE {$whereClause}";

        $stmt = $this->db->prepare($query);
        $stmt->execute($params);
        
        $stats = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Add readable file size
        if ($stats['total_size_bytes']) {
            $stats['total_size_mb'] = round($stats['total_size_bytes'] / (1024 * 1024), 2);
        }
        if ($stats['avg_file_size']) {
            $stats['avg_file_size_kb'] = round($stats['avg_file_size'] / 1024, 2);
        }

        return $stats;
    }
}