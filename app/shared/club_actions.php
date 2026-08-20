<?php
// ============================================================
//  CLUB_ACTIONS.PHP (shared/)
//  Handles AJAX requests for accredited clubs management.
// ============================================================
header('Content-Type: application/json');
if (session_status() === PHP_SESSION_NONE) { session_start(); }

require_once __DIR__ . '/db.php';
require_once __DIR__ . '/notification_actions.php';

if (empty($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Not authenticated.']);
    exit;
}

$user_id   = (int)$_SESSION['user_id'];
$user_role = $_SESSION['role'] ?? 'student';
$action    = $_POST['action'] ?? $_GET['action'] ?? '';

function cRespond(bool $ok, string $msg, array $extra = []): void {
    echo json_encode(array_merge(['success' => $ok, 'message' => $msg], $extra));
    exit;
}

// Only Admin and SSC roles are authorized to manage clubs
if (!in_array($user_role, ['ssc', 'admin'])) {
    cRespond(false, 'Unauthorized. Only SSC and Admin can manage clubs.');
}

switch ($action) {
    case 'add': {
        if ($user_role !== 'ssc') {
            cRespond(false, 'Unauthorized. Only SSC (OSA) can request to add new clubs.');
        }
        $code         = trim($_POST['code'] ?? '');
        $name         = trim($_POST['name'] ?? '');
        $category     = trim($_POST['category'] ?? 'Academic');
        $adviser_name = trim($_POST['adviser_name'] ?? 'TBA');
        $description  = trim($_POST['description'] ?? '');
        $status       = 'Pending Charter';

        if (empty($code) || empty($name)) {
            cRespond(false, 'Club Code and Club Name are required.');
        }

        // Check if code already exists
        $dup = $conn->prepare("SELECT id FROM clubs WHERE code = ?");
        $dup->bind_param('s', $code);
        $dup->execute();
        if ($dup->get_result()->num_rows > 0) {
            cRespond(false, 'Club Code already exists.');
        }
        $dup->close();

        $stmt = $conn->prepare(
            "INSERT INTO clubs (code, name, category, adviser_name, description, status) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->bind_param('ssssss', $code, $name, $category, $adviser_name, $description, $status);
        if ($stmt->execute()) {
            $new_id = $stmt->insert_id;
            log_audit($conn, $user_id, 'club_create', 'clubs', $new_id, "Created club $code");
            cRespond(true, 'Club added successfully!');
        } else {
            cRespond(false, 'Failed to add club: ' . $stmt->error);
        }
        $stmt->close();
        break;
    }

    case 'edit': {
        $id           = (int)($_POST['id'] ?? 0);
        $code         = trim($_POST['code'] ?? '');
        $name         = trim($_POST['name'] ?? '');
        $category     = trim($_POST['category'] ?? 'Academic');
        $adviser_name = trim($_POST['adviser_name'] ?? 'TBA');
        $description  = trim($_POST['description'] ?? '');
        $status       = trim($_POST['status'] ?? 'Active');
        if ($user_role === 'ssc') {
            $check = $conn->prepare("SELECT status FROM clubs WHERE id = ?");
            $check->bind_param('i', $id);
            $check->execute();
            $res = $check->get_result()->fetch_assoc();
            $check->close();
            $status = $res ? $res['status'] : 'Pending Charter';
        }

        if ($id <= 0 || empty($code) || empty($name)) {
            cRespond(false, 'ID, Club Code, and Club Name are required.');
        }

        // Check duplicate code excluding current
        $dup = $conn->prepare("SELECT id FROM clubs WHERE code = ? AND id != ?");
        $dup->bind_param('si', $code, $id);
        $dup->execute();
        if ($dup->get_result()->num_rows > 0) {
            cRespond(false, 'Club Code already exists.');
        }
        $dup->close();

        $stmt = $conn->prepare(
            "UPDATE clubs SET code = ?, name = ?, category = ?, adviser_name = ?, description = ?, status = ? WHERE id = ?"
        );
        $stmt->bind_param('ssssssi', $code, $name, $category, $adviser_name, $description, $status, $id);
        if ($stmt->execute()) {
            log_audit($conn, $user_id, 'club_update', 'clubs', $id, "Updated club $code");
            cRespond(true, 'Club updated successfully!');
        } else {
            cRespond(false, 'Failed to update club: ' . $stmt->error);
        }
        $stmt->close();
        break;
    }

    case 'approve': {
        if ($user_role !== 'admin') {
            cRespond(false, 'Unauthorized. Only Admin can approve clubs.');
        }
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) {
            cRespond(false, 'Invalid club ID.');
        }
        $stmt = $conn->prepare("UPDATE clubs SET status = 'Active' WHERE id = ?");
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            log_audit($conn, $user_id, 'club_approve', 'clubs', $id, "Approved club ID $id");
            cRespond(true, 'Club approved successfully!');
        } else {
            cRespond(false, 'Failed to approve club: ' . $stmt->error);
        }
        $stmt->close();
        break;
    }

    case 'reject': {
        if ($user_role !== 'admin') {
            cRespond(false, 'Unauthorized. Only Admin can reject clubs.');
        }
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) {
            cRespond(false, 'Invalid club ID.');
        }
        $stmt = $conn->prepare("UPDATE clubs SET status = 'Rejected' WHERE id = ?");
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            log_audit($conn, $user_id, 'club_reject', 'clubs', $id, "Rejected club ID $id");
            cRespond(true, 'Club request rejected.');
        } else {
            cRespond(false, 'Failed to reject club: ' . $stmt->error);
        }
        $stmt->close();
        break;
    }

    case 'delete': {
        $id = (int)($_POST['id'] ?? 0);
        if ($id <= 0) {
            cRespond(false, 'Invalid club ID.');
        }

        // Fetch club code for logs
        $res = $conn->query("SELECT code FROM clubs WHERE id = $id");
        $code = ($res && $row = $res->fetch_assoc()) ? $row['code'] : "ID #$id";

        $stmt = $conn->prepare("DELETE FROM clubs WHERE id = ?");
        $stmt->bind_param('i', $id);
        if ($stmt->execute()) {
            log_audit($conn, $user_id, 'club_delete', 'clubs', $id, "Deleted club $code");
            cRespond(true, 'Club deleted successfully!');
        } else {
            cRespond(false, 'Failed to delete club.');
        }
        $stmt->close();
        break;
    }

    default:
        cRespond(false, 'Unknown action.');
}
$conn->close();
?>
