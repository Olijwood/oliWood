<?php
ob_clean();

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;

require '../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
$dotenv->load();

$mail = new PHPMailer(true);

$hostinger_email = $_ENV['RECEIVING_EMAIL_ADDRESS'];
$smtp_password = $_ENV['SMTP_PASSWORD'];
$name = $_POST['name'];
$email = $_POST['email'];
$subject = $_POST['subject'];
$message = $_POST['message'];

$response = ['status' => '', 'message' => ''];

try {
    $mail->isSMTP();
    $mail->Host = 'smtp.hostinger.com';
    $mail->SMTPAuth = true;
    $mail->Username = $hostinger_email;
    $mail->Password = $smtp_password;
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // First email: Send to yourself (the site owner)
    $mail->setFrom($hostinger_email, $name);
    $mail->addAddress($hostinger_email);

    $mail->isHTML(true);
    $mail->Subject = "Contact Form Submission: $subject";
    $mail->Body = "You have received a message from $name.<br><br>Email: $email<br>Message:<br>$message";
    $mail->AltBody = "You have received a message from $name.\n\nEmail: $email\nMessage:\n$message";

    if ($mail->send()) {
        $response['status'] = 'success';
        $response['message'] = 'Message successfully sent.';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Unable to send the email.';
    }

    // Now send a confirmation email to the user who submitted the form
    $mail->clearAddresses();
    $mail->addAddress($email);
    $mail->addReplyTo($hostinger_email, 'Oli Wood');

    $mail->Subject = 'Thank you for contacting us!';
    $mail->Body = "Dear $name,<br><br>Thank you for your message. I will get back to you as soon as possible.<br><br>Your message was:<br>$message";
    $mail->AltBody = "Dear $name,\n\nThank you for your message. I will get back to you as soon as possible.\n\nYour message was:\n$message";

    if ($mail->send()) {
        $response['status'] = 'success';
        $response['message'] = 'Message successfully sent.';
    } else {
        $response['status'] = 'error';
        $response['message'] = 'Unable to send the email.';
    }
} catch (Exception $e) {
    $response['status'] = 'error';
    $response[
        'message'
    ] = "Error: Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}

header('Content-Type: application/json');
echo json_encode($response);
exit();
?>
