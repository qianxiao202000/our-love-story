/* =========================================
   FIREBASE
========================================= */

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from
  "https://www.gstatic.com/firebasejs/12.1.0/firebase-storage.js";


/* =========================================
   FIREBASE CONFIG
========================================= */

const firebaseConfig = {

  apiKey:
    "AIzaSyD37asjfCMNRCSyOlYRGcu6kNrCxswxoi0",

  authDomain:
    "our-love-story-4-27-11-21.firebaseapp.com",

  projectId:
    "our-love-story-4-27-11-21",

  storageBucket:
    "our-love-story-4-27-11-21.firebasestorage.app",

  messagingSenderId:
    "420377568573",

  appId:
    "1:420377568573:web:2fda5037cf5e2dbba79154"

};


/* =========================================
   INITIALIZE
========================================= */

const app =
  initializeApp(firebaseConfig);

const db =
  getFirestore(app);

const storage =
  getStorage(app);



/* =========================================
   RELATIONSHIP START
========================================= */

const relationshipStart =
  new Date("2026-04-10T00:00:00");



/* =========================================
   LIVE COUNTER
========================================= */

function updateCounter() {

  const now = new Date();

  let years =
    now.getFullYear()
    - relationshipStart.getFullYear();

  let months =
    now.getMonth()
    - relationshipStart.getMonth();

  let days =
    now.getDate()
    - relationshipStart.getDate();


  if (days < 0) {

    months--;

    const previousMonth =
      new Date(
        now.getFullYear(),
        now.getMonth(),
        0
      );

    days +=
      previousMonth.getDate();
  }


  if (months < 0) {

    years--;

    months += 12;
  }


  const lastAnniversary =
    new Date(
      relationshipStart.getFullYear() + years,
      relationshipStart.getMonth() + months,
      relationshipStart.getDate()
    );


  const difference =
    now - lastAnniversary;


  const hours =
    Math.floor(
      difference /
      (1000 * 60 * 60)
    ) % 24;


  const minutes =
    Math.floor(
      difference /
      (1000 * 60)
    ) % 60;


  const seconds =
    Math.floor(
      difference /
      1000
    ) % 60;


  document.getElementById("years")
    .textContent = years;

  document.getElementById("months")
    .textContent = months;

  document.getElementById("days")
    .textContent = days;

  document.getElementById("hours")
    .textContent = hours;

  document.getElementById("minutes")
    .textContent = minutes;

  document.getElementById("seconds")
    .textContent = seconds;

}


updateCounter();

setInterval(
  updateCounter,
  1000
);



/* =========================================
   PAGE NAVIGATION
========================================= */

window.showPage =
function(pageId, button) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });


  const page =
    document.getElementById(pageId);

  if (page) {

    page.classList.add("active");

  }


  document
    .querySelectorAll(".nav-btn")
    .forEach(btn => {

      btn.classList.remove("active");

    });


  if (button) {

    button.classList.add("active");

  }


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

};



/* =========================================
   MEMORY VARIABLES
========================================= */

let temporaryImage = null;



/* =========================================
   OPEN MEMORY MODAL
========================================= */

window.openMemoryModal =
function() {

  const modal =
    document.getElementById(
      "memoryModal"
    );

  modal.classList.add("show");

  document.body.style.overflow =
    "hidden";


  const dateInput =
    document.getElementById(
      "memoryDate"
    );


  if (!dateInput.value) {

    dateInput.value =
      new Date()
        .toISOString()
        .split("T")[0];

  }

};



/* =========================================
   CLOSE MEMORY MODAL
========================================= */

window.closeMemoryModal =
function(event) {

  if (
    event &&
    event.target !== event.currentTarget
  ) {

    return;

  }


  document
    .getElementById("memoryModal")
    .classList.remove("show");


  document.body.style.overflow =
    "";


  clearMemoryForm();

};



/* =========================================
   IMAGE PICKER
========================================= */

document
  .getElementById("memoryImage")
  .addEventListener(
    "change",
    function(event) {

      const file =
        event.target.files[0];

      if (!file) {

        return;

      }


      if (!file.type.startsWith("image/")) {

        alert(
          "Please choose an image."
        );

        return;

      }


      const reader =
        new FileReader();


      reader.onload =
        function(e) {

          temporaryImage =
            e.target.result;


          document
            .getElementById(
              "uploadPreview"
            )
            .innerHTML = `

              <img
                src="${temporaryImage}"
                style="
                  width:100%;
                  height:180px;
                  object-fit:cover;
                  display:block;
                "
              >

            `;

        };


      reader.readAsDataURL(file);

    }
  );



/* =========================================
   SAVE MEMORY → FIREBASE
========================================= */

window.saveMemory =
async function() {

  const title =
    document
      .getElementById("memoryTitle")
      .value
      .trim();


  const date =
    document
      .getElementById("memoryDate")
      .value;


  const note =
    document
      .getElementById("memoryNote")
      .value
      .trim();


  const file =
    document
      .getElementById("memoryImage")
      .files[0];


  if (!file) {

    alert(
      "Please choose a photo first ♡"
    );

    return;

  }


  if (!title) {

    alert(
      "Please enter a title."
    );

    return;

  }


  const saveButton =
    document.querySelector(
      ".save-memory-button"
    );


  saveButton.disabled =
    true;

  saveButton.textContent =
    "Saving... ♡";


  try {

    /* ===============================
       1. UPLOAD PHOTO
    ================================ */

    const fileName =
      Date.now()
      + "_"
      + file.name;


    const storageRef =
      ref(
        storage,
        "memories/" + fileName
      );


    await uploadBytes(
      storageRef,
      file
    );


    /* ===============================
       2. GET PHOTO URL
    ================================ */

    const imageURL =
      await getDownloadURL(
        storageRef
      );


    /* ===============================
       3. SAVE DATA
       TO FIRESTORE
    ================================ */

    await addDoc(
      collection(
        db,
        "memories"
      ),
      {

        title: title,

        date: date,

        note: note,

        imageURL: imageURL,

        createdAt:
          new Date().toISOString()

      }
    );


    alert(
      "Memory saved successfully ♡"
    );


    closeMemoryModal();


    /* ===============================
       4. RELOAD MEMORIES
    ================================ */

    await loadMemories();


  }

  catch(error) {

    console.error(error);

    alert(
      "Something went wrong.\n\n"
      + error.message
    );

  }

  finally {

    saveButton.disabled =
      false;

    saveButton.textContent =
      "Save Memory ♡";

  }

};



/* =========================================
   LOAD MEMORIES
========================================= */

async function loadMemories() {

  try {

    const gallery =
      document.getElementById(
        "memoryGallery"
      );


    const memoryQuery =
      query(
        collection(
          db,
          "memories"
        ),
        orderBy(
          "createdAt",
          "desc"
        )
      );


    const snapshot =
      await getDocs(
        memoryQuery
      );


    gallery.innerHTML = "";


    if (snapshot.empty) {

      gallery.innerHTML = `

        <div
          id="emptyMemory"
          class="empty-memory"
        >

          <div class="empty-icon">
            ♡
          </div>

          <h3>
            Our memories
          </h3>

          <p>
            Add your first memory<br>
            and keep it forever.
          </p>

          <button
            type="button"
            onclick="openMemoryModal()"
            class="primary-button"
          >
            ＋ Add Memory
          </button>

        </div>

      `;

    }


    snapshot.forEach(
      docSnapshot => {

        const data =
          docSnapshot.data();


        addMemoryCard(
          data.imageURL,
          data.title,
          data.date,
          data.note,
          false
        );

      }
    );


    updateMemoryCount();

  }

  catch(error) {

    console.error(
      "Load memories error:",
      error
    );

  }

}



/* =========================================
   ADD MEMORY CARD
========================================= */

function addMemoryCard(
  image,
  title,
  date,
  note,
  updateCount = true
) {

  const gallery =
    document.getElementById(
      "memoryGallery"
    );


  const empty =
    document.getElementById(
      "emptyMemory"
    );


  if (empty) {

    empty.remove();

  }


  const card =
    document.createElement(
      "article"
    );


  card.className =
    "memory-card";


  const imageElement =
    document.createElement(
      "img"
    );


  imageElement.className =
    "memory-image";


  imageElement.src =
    image;


  imageElement.alt =
    title;


  imageElement.onclick =
    function() {

      openPhotoViewer(
        image,
        title
      );

    };


  const content =
    document.createElement(
      "div"
    );


  content.className =
    "memory-content";


  content.innerHTML = `

    <div class="memory-title">
      ${escapeHTML(title)}
    </div>

    <div class="memory-date">
      ${formatDate(date)}
    </div>

    ${
      note
      ?
      `
      <div class="memory-note">
        ${escapeHTML(note)}
      </div>
      `
      :
      ""
    }

  `;


  card.appendChild(
    imageElement
  );


  card.appendChild(
    content
  );


  gallery.appendChild(
    card
  );


  if (updateCount) {

    updateMemoryCount();

  }

}



/* =========================================
   MEMORY COUNT
========================================= */

function updateMemoryCount() {

  const cards =
    document.querySelectorAll(
      ".memory-card"
    );


  const count =
    cards.length;


  document.getElementById(
    "memoryCount"
  ).textContent =
    count === 1
      ? "1 Memory"
      : `${count} Memories`;

}



/* =========================================
   FORMAT DATE
========================================= */

function formatDate(dateString) {

  if (!dateString) {

    return "";

  }


  const date =
    new Date(
      dateString + "T00:00:00"
    );


  return date.toLocaleDateString(
    "en-GB",
    {

      day: "2-digit",

      month: "short",

      year: "numeric"

    }
  );

}



/* =========================================
   PHOTO VIEWER
========================================= */

window.openPhotoViewer =
function(
  image,
  title
) {

  document.getElementById(
    "viewerImage"
  ).src = image;


  document.getElementById(
    "viewerCaption"
  ).textContent = title;


  document.getElementById(
    "photoViewer"
  ).classList.add("show");


  document.body.style.overflow =
    "hidden";

};



/* =========================================
   CLOSE PHOTO VIEWER
========================================= */

window.closePhotoViewer =
function(event) {

  if (
    event &&
    event.target !== event.currentTarget
  ) {

    return;

  }


  document.getElementById(
    "photoViewer"
  ).classList.remove("show");


  document.body.style.overflow =
    "";

};



/* =========================================
   CLEAR FORM
========================================= */

function clearMemoryForm() {

  document.getElementById(
    "memoryTitle"
  ).value = "";


  document.getElementById(
    "memoryNote"
  ).value = "";


  document.getElementById(
    "memoryImage"
  ).value = "";


  temporaryImage = null;


  document.getElementById(
    "uploadPreview"
  ).innerHTML = `

    <span class="upload-icon">
      ＋
    </span>

    <strong>
      Add Photo
    </strong>

    <small>
      Choose from your device
    </small>

  `;

}



/* =========================================
   HTML SAFETY
========================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent =
    text;

  return div.innerHTML;

}



/* =========================================
   START
========================================= */

loadMemories();