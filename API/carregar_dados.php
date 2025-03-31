<?php
header('Content-Type: application/json');

$host = "XXXXXXXXXXXXXX";
$user = "XXXXXXXXXXXXXX";
$password = "XXXXXXXXXXXXXX";
$dbname = "XXXXXXXXXXXXXX_db_teste";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Erro de conexão com o banco de dados."]));
}
$sql = "SELECT id, nome, quantidade FROM teste";
$result = $conn->query($sql);

$data = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $data[] = $row;
    }
}
echo json_encode($data);
$conn->close();
?>