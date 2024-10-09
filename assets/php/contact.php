<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use Dotenv\Dotenv;  // Load dotenv

require '../vendor/autoload.php';

$dotenv = Dotenv::createImmutable(__DIR__ . '/../../'); // Adjust this path to match your folder structure
$dotenv->load();

$receiving_email_address = $_ENV['RECEIVING_EMAIL_ADDRESS'];
$smtp_password = $_ENV['SMTP_PASSWORD'];

$response = []; // Prepare an array to store the response.

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    // Instantiate PHPMailer
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host = 'smtp.gmail.com'; 
        $mail->SMTPAuth = true;
        $mail->Username = $receiving_email_address; // Use environment variable
        $mail->Password = $smtp_password; // Use environment variable
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port = 587;

        // First email: Send to yourself (the site owner)
        $mail->setFrom($email, $name); 
        $mail->addAddress($receiving_email_address);

        $mail->isHTML(true);
        $mail->Subject = "Contact Form Submission: $subject";
        $mail->Body = "You have received a message from $name.<br><br>Email: $email<br>Message:<br>$message";
        $mail->AltBody = "You have received a message from $name.\n\nEmail: $email\nMessage:\n$message";

        $mail->send(); 

        // Now send a confirmation email to the user who submitted the form
        $mail->clearAddresses();
        $mail->addAddress($email); 
        $mail->addReplyTo($receiving_email_address, 'Oli Wood');

        $mail->Subject = "Thank you for contacting us!";
        $mail->Body = "Dear $name,<br><br>Thank you for your message. I will get back to you as soon as possible.<br><br>Your message was:<br>$message";
        $mail->AltBody = "Dear $name,\n\nThank you for your message. I will get back to you as soon as possible.\n\nYour message was:\n$message";

        $mail->send(); 

        $response['status'] = 'success';
        $response['message'] = 'Message successfully sent.';

    } catch (Exception $e) {
        $response['status'] = 'error';
        $response['message'] = "Error: Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
    }
} else {
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

?>