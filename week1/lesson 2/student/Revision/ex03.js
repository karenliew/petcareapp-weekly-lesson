const payment = [
    { petName: "Chester", amount: 50, status: "APPROVED" },
    { petName: "Mochi", amount: 80, status: "PENDING" },
    { petName: "Mira", amount: 40, status: "DECLINED" },
];

console.log("Mochi's payment status is: " + payment[1].status);

payment.forEach((petPayment) => {
    if (petPayment.status === "APPROVED") {
        console.log(petPayment.petName + "'s payment has been approved. Thank you for your purchase!");
    } else if (petPayment.status === "PENDING") {
        console.log(petPayment.petName + "'s payment is still pending. Please wait for confirmation.");
    } else if (petPayment.status === "DECLINED") {
        console.log(petPayment.petName + "'s payment has been declined. Please check your payment details and try again.");
    }
});