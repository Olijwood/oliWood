<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require '../vendor/autoload.php';

$receiving_email_address = 'olijwoodcoding@gmail.com';

$response = []; // Prepare an array to store the response.

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $subject = $_POST['subject'];
    $message = $_POST['message'];

    try {
        // First email: Send to yourself (the site owner)
        $mailToOwner = new PHPMailer(true);
        $mailToOwner->isSMTP();
        $mailToOwner->Host = 'smtp.gmail.com';
        $mailToOwner->SMTPAuth = true;
        $mailToOwner->Username = 'olijwoodcoding@gmail.com';
        $mailToOwner->Password = 'poxcymdlnqaqvpau';
        $mailToOwner->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailToOwner->Port = 587;

        $mailToOwner->setFrom($receiving_email_address, 'Oli Wood'); 
        $mailToOwner->addAddress($receiving_email_address); // Send to yourself

        $mailToOwner->isHTML(true); 
        $mailToOwner->Subject = "Contact Form Submission: $subject";
        $mailToOwner->Body    = "You have received a message from $name.<br><br>Email: $email<br>Message:<br>$message";
        $mailToOwner->AltBody = "You have received a message from $name.\n\nEmail: $email\nMessage:\n$message";

        $mailToOwner->send();

        // Now send a confirmation email to the user who submitted the form
        $mailToUser = new PHPMailer(true);
        $mailToUser->isSMTP();
        $mailToUser->Host = 'smtp.gmail.com';
        $mailToUser->SMTPAuth = true;
        $mailToUser->Username = 'olijwoodcoding@gmail.com';
        $mailToUser->Password = 'poxcymdlnqaqvpau';
        $mailToUser->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mailToUser->Port = 587;

        $mailToUser->setFrom($receiving_email_address, 'Oli Wood');
        $mailToUser->addAddress($email); // Send confirmation to the user's email
        $mailToUser->addReplyTo($receiving_email_address, 'Oli Wood');

        $mailToUser->isHTML(true);
        $mailToUser->Subject = "Confirmation of message delivery!";
        $mailToUser->Body    = "Dear $name,<br><br>Thank you for your message. I will get back to you as soon as possible.<br><br>Your message was:<br><br>$message";
        $mailToUser->AltBody = "Dear $name,\n\nThank you for your message. I will get back to you as soon as possible.\n\nYour message was:\n$message";

        $mailToUser->send();

        // Prepare a successful response
        $response['status'] = 'success';
        $response['message'] = 'Message successfully sent.';

    } catch (Exception $e) {
        // Handle errors and prepare a failure response
        $response['status'] = 'error';
        $response['message'] = "Error: Message could not be sent. Mailer Error: {$e->getMessage()}";
    }
} else {
    // Invalid request method
    $response['status'] = 'error';
    $response['message'] = 'Invalid request method.';
}

// Return JSON response
header('Content-Type: application/json');
echo json_encode($response);

?>
