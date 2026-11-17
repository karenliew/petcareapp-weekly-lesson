const paymentStatus = "APPROVED";

// Check the payment status and display the appropriate message
if (paymentStatus === "APPROVED") {
    console.log("Payment has been approved. Thank you for your purchase!");
} else if (paymentStatus === "PENDING") {
    console.log("Payment is still pending. Please wait for confirmation.");
} else if (paymentStatus === "DECLINED") {
    console.log("Payment has been declined. Please check your payment details and try again.");
} else {
    console.log("Unknown payment status. Please contact support for assistance.");
}