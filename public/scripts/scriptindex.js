const postButton = document.getElementById("postbutton");
const postText = document.getElementById("postText");
const liftType = document.getElementById("liftType");
const postsSection = document.getElementById("posts");



// Load from the server all the things
async function loadPosts(){
    const res = await fetch ("/api/posts?types=index");
    const data = await res.json();

    // Keep only the create-post box
    const createPost = postsSection.querySelector(".create-post");
    postsSection.innerHTML = "";
    postsSection.appendChild(createPost);

    data.forEach(post => {
        createPostElement(post)
        
    });
}

//Creating a post
function createPostElement(post){
    const postCard = document.createElement("div")
    postCard.classList.add("post-card")

    postCard.innerHTML = `
        <div class = "post-header">
            <img src="images/barbell.jpg" alt="profile">
            <strong>@${post.username}</strong>
        </div>

        <p>${post.text} (${post.lift})</p>
        <div class = "post-actions">
            <button class = like-button>❤️ ${post.likes} Likes </button>
        </div>
    `;

    const likebutton = postCard.querySelector(".like-button")

    likebutton.addEventListener("click", async () => {
        await fetch(`/api/posts/${post.id}/like`, {
            method: "POST"
        });
        loadBadges();
        loadPosts();
    });

    postsSection.appendChild(postCard)
}


// Handle new posts
postButton.addEventListener("click", async () => {
    const text = postText.value.trim()
    const lift = liftType.value.trim()

    if (!text || !lift) {
        alert("Fill Everything out!!")
        return;
    };

    await fetch("/api/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, lift, type: "index"})
    });

    postText.value ="";
    liftType.value ="";

    loadBadges();
    loadPosts();
});

loadPosts();

// Handle workout
async function loadworkout() {
    const res = await fetch("/api/workout");
    const data = await res.json();

    document.getElementById("type-display").textContent =
        "Type: " + (data.types?.join(", ") || "None");

    document.getElementById("workout-display").textContent =
        "Workout: " + (data.text || "No workout logged");
}

// loading in all the badges
async function loadBadges() {
    const res = await fetch("/api/badges");
    const badges = await res.json();

    const container = document.getElementById("badge-list");
    container.innerHTML = "";

    // show only latest 4 badges
    const recent = badges.slice(-4);

    recent.forEach(badge => {
        const div = document.createElement("div");
        div.classList.add("badge");

        div.innerHTML = `
            🏅 <strong>${badge.name}</strong>
        `;

        container.appendChild(div);
    });
}

loadBadges();
loadworkout();