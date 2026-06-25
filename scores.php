<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type');

$host = 'localhost';
$db   = 'quizadaptif';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['erreur' => 'Connexion à la base échouée']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $pdo->query("
        SELECT pseudo, score, correct, difficulte, categorie, created_at
        FROM scores
        ORDER BY score DESC
        LIMIT 20
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true);

    $pseudo     = trim($body['pseudo']      ?? '');
    $score      = intval($body['score']     ?? 0);
    $correct    = intval($body['correct']   ?? 0);
    $difficulte = $body['difficulte']       ?? 'easy';
    $categorie  = intval($body['categorie'] ?? 0);

    $erreur = false;
    if (empty($pseudo) || strlen($pseudo) > 30)           $erreur = true;
    if ($score < 0 || $score > 2500)                      $erreur = true;
    if ($correct < 0 || $correct > 10)                    $erreur = true;
    if (!in_array($difficulte, ['easy','medium','hard']))  $erreur = true;

    if ($erreur) {
        http_response_code(400);
        echo json_encode(['erreur' => 'Données invalides']);
        exit;
    }

    $stmt = $pdo->prepare("
        INSERT INTO scores (pseudo, score, correct, difficulte, categorie)
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$pseudo, $score, $correct, $difficulte, $categorie]);
    echo json_encode(['succes' => true]);
    exit;
}