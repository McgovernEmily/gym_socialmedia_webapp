const workoutText = document.getElementById("workout-details")
const savebutton = document.getElementById("save-workout")

const typedisplay = document.getElementById("type-display")
const workoutdisplay = document.getElementById("workout-display")

const benchInput = document.getElementById("bench-pr");
const squatInput = document.getElementById("squat-pr");
const deadliftInput = document.getElementById("deadlift-pr");

const benchDisplay = document.getElementById("bench-display");
const squatDisplay = document.getElementById("squat-display");
const deadliftDisplay = document.getElementById("deadlift-display");

const savePRsBtn = document.getElementById("save-prs");

const badgeList = document.getElementById("badge-list");


// Loading in the workout
async function loadworkout() {
    const res = await fetch("/api/workout");
    const data = await res.json();

    typedisplay.textContent = "Type: " + data.types.join(", ");
    workoutdisplay.textContent = "Workout: " + data.text;

}

// Saving the workout
savebutton.addEventListener("click", async () =>{
    const selectedtypes = [];
    const checkbox = document.querySelectorAll(".muscle")

    checkbox.forEach(box => {
        if (box.checked) {
            selectedtypes.push(box.value);
        }
    });

    const text = workoutText.value;

    if (selectedtypes.length === 0 || text.trim() === ""){
        alert("Please Fill out everything");
        return;
    };

    await fetch("/api/workout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"  
        },
        body: JSON.stringify({
            types: selectedtypes,
            text: text
        })
    });

    // putting everything to reset
    workoutText.value = "";
    checkbox.forEach(box =>
        box.checked = false
    );
    loadBadges();
    loadworkout();
});

loadworkout();

// Load PRs
async function loadPRs() {
    const res = await fetch("/api/prs");
    const data = await res.json();

    benchDisplay.textContent = "Bench: " + data.bench + " lbs";
    squatDisplay.textContent = "Squat: " + data.squat + " lbs";
    deadliftDisplay.textContent = "Deadlift: " + data.deadlift + " lbs";
}

// Save PRs
savePRsBtn.addEventListener("click", async () => {
    const bench = benchInput.value;
    const squat = squatInput.value;
    const deadlift = deadliftInput.value;

    await fetch("/api/prs", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            bench,
            squat,
            deadlift
        })
    });

    loadBadges();
    loadPRs();
});

// Load on start
loadPRs();


let previousBadges = [];

async function loadBadges() {
    const res = await fetch("/api/badges");
    const badges = await res.json();

    previousBadges = badges;

    badgeList.innerHTML = "";

    badges.forEach(badge => {
        const div = document.createElement("div");
        div.classList.add("badge");

        div.innerHTML = `
            <strong>${badge.name}</strong>
            <p>${badge.description}</p>
        `;

        badgeList.appendChild(div);
    });
}

// Load badges
loadBadges();