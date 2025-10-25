// Device uchun unik ID yaratish va saqlash
if (!localStorage.getItem('deviceId')) {
  localStorage.setItem('deviceId', 'device-' + Math.random().toString(36).substring(2, 10));
}
const deviceId = localStorage.getItem('deviceId');

// Postsni olish
const postContent = document.querySelector("#postContent");
let api_url = "https://68faeedd94ec96066023f9af.mockapi.io/api/postappv1/posts";

async function getPosts() {
  try {
    const res = await fetch(api_url);
    const data = await res.json();

    postContent.innerHTML = ``;
    data.forEach((item) => {
      const newPost = document.createElement("div");
      newPost.className = "backdrop-blur-lg bg-white/30 rounded-2xl p-6 shadow-lg h-[32vh]";
      newPost.innerHTML = `<h3 class="text-xl font-semibold mb-2">
            ${item.title}
          </h3>
          <p class="text-sm">
            ${item.body}
          </p>`;
      postContent.prepend(newPost);
    });
  } catch (err) {
    console.log("Error" + err);
  }
}

getPosts();

// Admin pagega o'tish
async function getAdminPage() {
  try {
    window.location = "./add_post.html";
  } catch (err) {
    console.error("Error", err);
    window.location = "./index.html";
  }
}

// My posts panel
const myPosts = document.querySelector('#myPosts');
const inputTitle = document.querySelector('#title');
const textarea = document.querySelector('#body');
const btn = document.querySelector('.btn');

let allPosts = [];
let editingPostId = null;

async function getMyPosts() {
  try {
    const res = await fetch(api_url);
    const data = await res.json();
    allPosts = data;
    myPosts.innerHTML = ``;

    // Faqat shu deviceId ga tegishli postlar
    const sortData = data.filter((item) => item.device === deviceId);

    if (sortData.length === 0) {
      myPosts.innerHTML = `
        <p class="text-center text-[16px]">
          No posts yet...
        </p>
      `;
      return; 
    }

    sortData.forEach((item) => {
      const newMyPost = document.createElement('div');
      newMyPost.className =
        'flex items-center justify-between backdrop-blur-lg bg-white/30 rounded-2xl p-4 md:p-6 shadow-lg';
      newMyPost.setAttribute('data-id', item.id);
      newMyPost.innerHTML = `
        <p class="text-[14px] lg:text-[16px]">${item.title}</p>
        <p class="hidden xl:block">${item.body}</p>
        <div class="flex items-center gap-[10px]">
          <i class="fa-solid fa-pen-to-square text-yellow-500 text-[18px] cursor-pointer edit-btn" title="Update"></i>
          <i class="fa-solid fa-trash text-red-500 text-[18px] cursor-pointer delete-btn" title="Delete"></i>
        </div>
      `;
      myPosts.prepend(newMyPost);
    });
  } catch (err) {
    console.log('Xatolik: ' + err);
  }
}
getMyPosts();

// Edit post
myPosts.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const postId = e.target.closest('[data-id]').dataset.id;
    const postData = allPosts.find((item) => item.id == postId);

    if (postData) {
      inputTitle.value = postData.title;
      textarea.value = postData.body;
      btn.value = 'Change Post';
      editingPostId = postId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
});

// Add/Change post
btn.addEventListener('click', async (e) => {
  e.preventDefault();

  const newPost = {
    title: inputTitle.value.trim(),
    body: textarea.value.trim(),
    device: deviceId, // shu yerda deviceId ishlatiladi
    date: new Date().toISOString(),
  };

  if (!newPost.title || !newPost.body) {
    alert("Please fill in the fields!");
    return;
  }

  try {
    if (editingPostId) {
      const res = await fetch(`${api_url}/${editingPostId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        console.log('Post updated!');
        editingPostId = null;
        btn.value = 'Add Post';
      }
    } else {
      newPost.id = Math.round(Math.random() * 1000);
      const res = await fetch(api_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        console.log('Post added!');
      }
    }

    inputTitle.value = '';
    textarea.value = '';
    getMyPosts();

  } catch (err) {
    console.log('Error:', err);
  }
});

// Delete post
myPosts.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const postId = e.target.closest('[data-id]').dataset.id;

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${api_url}/${postId}`, { method: 'DELETE' });

      if (res.ok) {
        console.log(`Post (ID: ${postId}) deleted!`);
        e.target.closest('[data-id]').remove();
      }
    } catch (err) {
      console.log("Error:", err);
    }
  }
});
