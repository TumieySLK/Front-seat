

// The taxi routes and their prices
const routes = [
    { id: 1, name: "Bree to Bara", fare: 30 },
    { id: 2, name: "Noord to Alexandra", fare: 35 },
    { id: 3, name: "Turffontein to Johannesburg CBD", fare: 15 }
];

// How many seats the taxi has
const TAXI_SEATS = 15;

// Everything about the current trip
const currentTrip = {
    capacity: TAXI_SEATS,
    payments: []
};



// Elements from HTML

const routeSelect = document.querySelector(".Route select");
const paymentForm = document.querySelector("form");

const rowInput = document.getElementById("row");
const peopleInput = document.getElementById("people");
const amountInput = document.getElementById("amount");

const alertMessage = document.getElementById("alertmessage");

const seatsPaid = document.getElementById("seatsPaid");
const seatsLeft = document.getElementById("seatsLeft");
const totalFares = document.getElementById("totalFares");
const totalChange = document.getElementById("totalChange");

const paymentsList = document.getElementById("paymentslist");
const changeList = document.getElementById("changelist");



// Route dropdown

for (const route of routes) {
    const option = document.createElement("option");
    option.value = route.id;
    option.textContent = route.name + " - R" + route.fare;
    routeSelect.appendChild(option);
}



// Functions

// Find the route the user picked
function getSelectedRoute() {
    for (const route of routes) {
        if (route.id == routeSelect.value) {
            return route;
        }
    }
    return undefined; // nothing was picked
}

// Count how many seats have been paid for
function getSeatsPaid() {
    let total = 0;

    for (const payment of currentTrip.payments) {
        total = total + payment.people;
    }

    return total;
}

// Show a message to the user
function showAlert(message) {
    alertMessage.textContent = message;
    alertMessage.classList.remove("d-none");
}

// Hide the message
function hideAlert() {
    alertMessage.classList.add("d-none");
}



// Payment Form Submission
paymentForm.addEventListener("submit", function (event) {
    // Stop the page from refreshing
    event.preventDefault();

    // Read what the user typed
    const row = rowInput.value;
    const people = Number(peopleInput.value);
    const amount = Number(amountInput.value);
    const selectedRoute = getSelectedRoute();

    // ----- Check the input -----
    if (!selectedRoute) {
        showAlert("Please select a route.");
        return;
    }

    if (!row || row === "Select a row") {
        showAlert("Please select a row.");
        return;
    }

    if (people <= 0) {
        showAlert("Number of people must be greater than 0.");
        return;
    }

    if (people + getSeatsPaid() > currentTrip.capacity) {
        showAlert("The taxi cannot have more than " + TAXI_SEATS + " seats.");
        return;
    }

    if (amount <= 0) {
        showAlert("Amount handed over must be greater than 0.");
        return;
    }

    // Work out the money
    const amountDue = selectedRoute.fare * people;
    const change = amount - amountDue;

    if (change < 0) {
        showAlert("Amount handed over is less than the amount due.");
        return;
    }

    // Save the payment 
    const payment = {
        row: row,
        people: people,
        amountGiven: amount,
        amountDue: amountDue,
        change: change,
        changeGiven: false
    };

    currentTrip.payments.push(payment);

    // Update the screen
    hideAlert();
    renderPayments();
    renderChangeList();
    updateSummary();

    paymentForm.reset();
});



// Payments List


function renderPayments() {
    // Clear the old list first
    paymentsList.innerHTML = "";

    // If there are no payments, say so and stop
    if (currentTrip.payments.length === 0) {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.textContent = "No payments recorded yet";
        paymentsList.appendChild(item);
        return;
    }

  
    for (const payment of currentTrip.payments) {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.textContent =
            payment.row + " - " +
            payment.people + " people - R" +
            payment.amountGiven;
        paymentsList.appendChild(item);
    }
}



// Change owed List


function renderChangeList() {
    // Clear the old list first
    changeList.innerHTML = "";

    let changeOwed = false;

    for (const payment of currentTrip.payments) {
        // Only show payments that have change and where it hasn't been given yet
        // (exact payments don't appear here)
        if (payment.change > 0 && payment.changeGiven === false) {
            changeOwed = true;

            const item = document.createElement("li");
            item.className = "list-group-item d-flex justify-content-between align-items-center";

            const text = document.createElement("span");
            text.textContent = payment.row + " - R" + payment.change;

            // The "Change Given" button
            const button = document.createElement("button");
            button.type = "button";
            button.className = "btn btn-outline-success";
            button.textContent = "Change Given";

            // Mark the change as given and refresh the screen
            button.addEventListener("click", function () {
                payment.changeGiven = true;
                renderChangeList();
                updateSummary();
            });

            item.appendChild(text);
            item.appendChild(button);
            changeList.appendChild(item);
        }
    }

    // No change owed
    if (!changeOwed) {
        const item = document.createElement("li");
        item.className = "list-group-item";
        item.textContent = "No change owed";
        changeList.appendChild(item);
    }
}



//Update Summary


function updateSummary() {
    const paid = getSeatsPaid();

    let fares = 0;
    let change = 0;

    for (const payment of currentTrip.payments) {
        // Add up all the fares
        fares = fares + payment.amountDue;

        // Change that still needs to be given
        if (payment.changeGiven === false) {
            change = change + payment.change;
        }
    }

    seatsPaid.textContent = paid + "/" + TAXI_SEATS;
    seatsLeft.textContent = TAXI_SEATS - paid;
    totalFares.textContent = "R" + fares;
    totalChange.textContent = "R" + change;

    // Tell the driver when the taxi is full
    if (paid === TAXI_SEATS) {
        showAlert("Taxi full, let's go!");
    }
}


//Start the app
renderPayments();
renderChangeList();
updateSummary();
