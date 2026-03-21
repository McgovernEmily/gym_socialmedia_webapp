const postBtn = document.getElementById("groupPostBtn");
const postText = document.getElementById("groupPostText");
const liftType = document.getElementById("groupLiftType");
const postsSection = document.getElementById("group-posts");

async function loadPosts() {

    // Load the post from the group type
    const res = await fetch("/api/posts?type=group");
    const data = await res.json();

    const createBox = postsSection.querySelector(".create-post");
    postsSection.innerHTML = "";
    postsSection.appendChild(createBox);

    data.forEach(post => createPost(post));
}

function createPost(post) {
    const div = document.createElement("div");
    div.classList.add("post-card");

    div.innerHTML = `
        <div class="post-header">
            <img src="images/barbell.jpg">
            <strong>@${post.username}</strong>
        </div>

        <p>${post.text} (${post.lift})</p>

        <div class="post-actions">
            <button class="like-btn">❤️ ${post.likes}</button>
        </div>
    `;

    const likeBtn = div.querySelector(".like-btn");

    likeBtn.addEventListener("click", async () => {
        await fetch(`/api/posts/${post.id}/like`, {
            method: "POST"
        });

        loadPosts();
    });

    postsSection.appendChild(div);
}


postBtn.addEventListener("click", async () => {
    const text = postText.value.trim();
    const lift = liftType.value.trim();

    if (!text || !lift) {
        alert("Fill everything out!");
        return;
    }

    await fetch("/api/posts", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ text, lift, type: "group" })
    });

    postText.value = "";
    liftType.value = "";

    loadPosts();
});

loadPosts();