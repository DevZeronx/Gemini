

<?php
header("Content-Type: application/json");

// Function to generate the SHA256 signature
function generate_signature($time, $text, $secret = "") {
    $message = $time . ":" . $text . ":" . $secret;
    return hash("sha256", $message);
}

// Check if "text" parameter is set
if (!isset($_GET["text"]) || empty(trim($_GET["text"]))) {
    echo json_encode(["error" => "Missing 'text' parameter"]);
    exit;
}

$text = trim($_GET["text"]);

// API URL
$url = "https://chat2.free2gpt.com/api/generate";

// Generate timestamp
$timestamp = round(microtime(true) * 1000);

// Generate the signature (adjust the logic if actual secret is known)
$sign = generate_signature($timestamp, $text);

// Define messages
$messages = [["role" => "user", "content" => $text]];

// Prepare payload
$data = json_encode([
    "messages" => $messages,
    "time" => $timestamp,
    "pass" => null,
    "sign" => $sign
]);

// Headers
$headers = [
    "Content-Type: application/json",
    "Accept: application/json",
    "Origin: https://chat2.free2gpt.com",
    "Referer: https://chat2.free2gpt.com"
];

// Initialize cURL request
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, $data);

// Execute request
$response = curl_exec($ch);
$error = curl_error($ch);
curl_close($ch);

// Output response
if ($error) {
    echo json_encode(["error" => $error]);
} else {
    echo $response;
}
