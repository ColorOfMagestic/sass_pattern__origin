<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__."/PHPMailer-master/src/Exception.php";
require __DIR__."/PHPMailer-master/src/PHPMailer.php";

$mail = new PHPMailer(true);

$mail->CharSet = "UTF-8";

$name = $_POST["name"]; 
$email = $_POST["email"]; 
$phone = $_POST["phone"]; 
$message = $_POST["message"];

$body = "
Сообщение:
$message

Имя:
$name

Tелефон:
$phone

Почта:
$email
";
$theme = "Возможно заказ :)";

$mail->addAddress("stem.09@mail.ru");

$mail->Subject = $theme;
$mail->Body = $body;

$mail->send();


