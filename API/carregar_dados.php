<?php
header('Content-Type: application/json');

$host = "sql105.infinityfree.com";
$user = "if0_38619095";
$password = "8QRKmysmmmqs";
$dbname = "if0_38619095_db_teste";

$conn = new mysqli($host, $user, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Erro de conexão com o banco de dados."]));
}

$sql = "SELECT id, nome, quantidade, janeiro, fevereiro, marco, abril, maio, junho, julho, agosto, setembro, outubro, novembro, dezembro, saldo FROM tabela";
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