import { db, auth } from "./firebase.js";

import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  Timestamp,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const bookingsTable =
  document.querySelector("#bookingsTable tbody");

const confirmedTable =
  document.querySelector("#confirmedTable tbody");

const pastConfirmedTable =
  document.querySelector("#pastConfirmedTable tbody");

const mensLessonsTable =
  document.querySelector("#mensLessonsTable tbody");

const womensLessonsTable =
  document.querySelector("#womensLessonsTable tbody");

const kidsLessonsTable =
  document.querySelector("#kidsLessonsTable tbody");

const summerCampTable =
  document.querySelector("#summerCampTable tbody");

const blockForm =
  document.getElementById("blockForm");

const blockDate =
  document.getElementById("blockDate");

const blockTime =
  document.getElementById("blockTime");

const blockDuration =
  document.getElementById("blockDuration");

const blockStatus =
  document.getElementById("blockStatus");

const logoutBtn =
  document.getElementById("logoutBtn");

const cleanupBtn =
  document.getElementById("cleanupOldSlots");

const bookingMode =
  document.getElementById("bookingMode");

const rangeFields =
  document.getElementById("rangeFields");

const weeklyFields =
  document.getElementById("weeklyFields");

const endDateInput =
  document.getElementById("endDate");

const weeklyUntilInput =
  document.getElementById("weeklyUntil");

function formatDateTime(date) {

  const options = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  };

  return date.toLocaleString(undefined, options);

}

onAuthStateChanged(auth, (user) => {

  if (!user) {

    alert("Access denied. Please login.");

    window.location.href = "login.html";

  } else {

    loadAllBookings();

  }

});

logoutBtn.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "login.html";

});

function generateTimeOptions() {

  if (!blockTime) return;

  blockTime.innerHTML = "";

  const startHour = 6;
  const startMinute = 30;

  const endHour = 21;
  const endMinute = 0;

  let current = new Date();

  current.setHours(
    startHour,
    startMinute,
    0,
    0
  );

  const endTime = new Date();

  endTime.setHours(
    endHour,
    endMinute,
    0,
    0
  );

  while (current <= endTime) {

    const h = current
      .getHours()
      .toString()
      .padStart(2, "0");

    const m = current
      .getMinutes()
      .toString()
      .padStart(2, "0");

    const option =
      document.createElement("option");

    option.value = `${h}:${m}`;
    option.textContent = `${h}:${m}`;

    blockTime.appendChild(option);

    current.setMinutes(
      current.getMinutes() + 30
    );

  }

}

generateTimeOptions();

if (bookingMode) {

  bookingMode.addEventListener("change", () => {

    if (rangeFields) {
      rangeFields.style.display = "none";
    }

    if (weeklyFields) {
      weeklyFields.style.display = "none";
    }

    if (
      bookingMode.value === "range" &&
      rangeFields
    ) {
      rangeFields.style.display = "block";
    }

    if (
      bookingMode.value === "weekly" &&
      weeklyFields
    ) {
      weeklyFields.style.display = "block";
    }

  });

}

async function loadAllBookings() {

  try {

    const snapshot =
      await getDocs(collection(db, "slots"));

    bookingsTable.innerHTML = "";
    confirmedTable.innerHTML = "";
    pastConfirmedTable.innerHTML = "";

    if (mensLessonsTable) {
      mensLessonsTable.innerHTML = "";
    }

    if (womensLessonsTable) {
      womensLessonsTable.innerHTML = "";
    }

    if (kidsLessonsTable) {
      kidsLessonsTable.innerHTML = "";
    }

    if (summerCampTable) {
      summerCampTable.innerHTML = "";
    }

    const now = new Date();

    const futureConfirmed = [];
    const pastConfirmed = [];

    snapshot.forEach((docSnap) => {

      const slot = docSnap.data();

      const id = docSnap.id;

      if (!slot.time) return;

      const slotDate = slot.time.toDate();

      if (slot.status === "pending") {

        const row =
          document.createElement("tr");

        row.innerHTML = `
          <td>${slot.bookedBy || ""}</td>
          <td>${slot.contact || ""}</td>
          <td>${formatDateTime(slotDate)}</td>
          <td>${slot.duration || 30} min</td>
          <td>${slot.status}</td>
          <td>
            <button class="confirm" data-id="${id}">
              Confirm
            </button>

            <button class="reject" data-id="${id}">
              Reject
            </button>

            <button class="delete-any" data-id="${id}">
              Delete
            </button>
          </td>
        `;

        bookingsTable.appendChild(row);

        return;

      }

      if (
        slot.status === "confirmed" ||
        slot.status === "blocked"
      ) {

        const row =
          document.createElement("tr");

        row.innerHTML = `
          <td>${slot.bookedBy || ""}</td>
          <td>${slot.contact || ""}</td>
          <td>${formatDateTime(slotDate)}</td>
          <td>${slot.duration || 30} min</td>
          <td>${slot.status}</td>
          <td>
            <button class="delete-any" data-id="${id}">
              Delete
            </button>
          </td>
        `;

        if (slotDate < now) {

          pastConfirmed.push({
            date: slotDate,
            row
          });

        } else {

          futureConfirmed.push({
            date: slotDate,
            row
          });

        }

        return;

      }

      if (
        slot.status === "mens" &&
        mensLessonsTable
      ) {

        renderGroupRow(
          mensLessonsTable,
          slot,
          id
        );

        return;

      }

      if (
        slot.status === "womens" &&
        womensLessonsTable
      ) {

        renderGroupRow(
          womensLessonsTable,
          slot,
          id
        );

        return;

      }

      if (
        slot.status === "kids" &&
        kidsLessonsTable
      ) {

        renderGroupRow(
          kidsLessonsTable,
          slot,
          id
        );

        return;

      }

      if (
        slot.status === "summercamp" &&
        summerCampTable
      ) {

        renderGroupRow(
          summerCampTable,
          slot,
          id
        );

      }

    });

    futureConfirmed.sort(
      (a, b) => a.date - b.date
    );

    pastConfirmed.sort(
      (a, b) => a.date - b.date
    );

    futureConfirmed.forEach((entry) => {

      confirmedTable.appendChild(entry.row);

    });

    pastConfirmed.forEach((entry) => {

      pastConfirmedTable.appendChild(entry.row);

    });

  } catch (err) {

    console.error(err);

    alert("Failed to load bookings.");

  }

}

function renderGroupRow(table, slot, id) {

  const row =
    document.createElement("tr");

  row.innerHTML = `
    <td>${formatDateTime(slot.time.toDate())}</td>
    <td>${slot.duration || 30} min</td>
    <td>${slot.status}</td>
    <td>
      <button class="delete-any" data-id="${id}">
        Delete
      </button>
    </td>
  `;

  table.appendChild(row);

}

async function deleteBooking(id) {

  const confirmed =
    confirm("Delete this slot?");

  if (!confirmed) return;

  try {

    await deleteDoc(
      doc(db, "slots", id)
    );

    await loadAllBookings();

  } catch (err) {

    console.error(err);

    alert("Failed to delete slot.");

  }

}

document.body.addEventListener(
  "click",
  async (e) => {

    const id = e.target.dataset.id;

    if (!id) return;

    const docRef =
      doc(db, "slots", id);

    try {

      if (
        e.target.classList.contains(
          "confirm"
        )
      ) {

        await updateDoc(docRef, {
          status: "confirmed"
        });

        await loadAllBookings();

        return;

      }

      if (
        e.target.classList.contains(
          "reject"
        )
      ) {

        await updateDoc(docRef, {
          status: "rejected"
        });

        await loadAllBookings();

        return;

      }

      if (
        e.target.classList.contains(
          "delete-any"
        )
      ) {

        await deleteBooking(id);

      }

    } catch (err) {

      console.error(err);

      alert("Action failed.");

    }

  }
);

function buildDate(dateStr, timeStr) {

  const [year, month, day] =
    dateStr.split("-").map(Number);

  const [hour, minute] =
    timeStr.split(":").map(Number);

  return new Date(
    year,
    month - 1,
    day,
    hour,
    minute
  );

}

async function createSlot(
  startTime,
  duration,
  status,
  recurringId = null
) {

  await addDoc(
    collection(db, "slots"),
    {
      time: Timestamp.fromDate(startTime),
      duration,
      status,
      recurringId,
      createdAt: Timestamp.now()
    }
  );

}

blockForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    const dateStr = blockDate.value;

    const timeStr = blockTime.value;

    const duration =
      parseInt(blockDuration.value);

    const status =
      blockStatus.value;

    const mode =
      bookingMode
        ? bookingMode.value
        : "single";

    if (
      !dateStr ||
      !timeStr ||
      !duration ||
      !status
    ) {

      alert(
        "Please fill all required fields."
      );

      return;

    }

    try {

      if (mode === "single") {

        const startTime =
          buildDate(dateStr, timeStr);

        await createSlot(
          startTime,
          duration,
          status
        );

        alert("Slot created.");

      }

      if (mode === "range") {

        const endDate =
          endDateInput.value;

        if (!endDate) {

          alert(
            "Please select end date."
          );

          return;

        }

        const current =
          new Date(dateStr);

        const end =
          new Date(endDate);

        let count = 0;

        while (current <= end) {

          const currentDateStr =
            current
              .toISOString()
              .split("T")[0];

          const startTime =
            buildDate(
              currentDateStr,
              timeStr
            );

          await createSlot(
            startTime,
            duration,
            status
          );

          current.setDate(
            current.getDate() + 1
          );

          count++;

        }

        alert(`${count} slots created.`);

      }

      if (mode === "weekly") {

        const untilDate =
          weeklyUntilInput.value;

        if (!untilDate) {

          alert(
            "Please select repeat until date."
          );

          return;

        }

        const selectedWeekdays =
          Array.from(
            document.querySelectorAll(
              ".weekday:checked"
            )
          ).map((cb) =>
            parseInt(cb.value)
          );

        if (
          selectedWeekdays.length === 0
        ) {

          alert(
            "Please select weekdays."
          );

          return;

        }

        const recurringId =
          `series-${Date.now()}`;

        const current =
          new Date(dateStr);

        const end =
          new Date(untilDate);

        let count = 0;

        while (current <= end) {

          if (
            selectedWeekdays.includes(
              current.getDay()
            )
          ) {

            const currentDateStr =
              current
                .toISOString()
                .split("T")[0];

            const startTime =
              buildDate(
                currentDateStr,
                timeStr
              );

            await createSlot(
              startTime,
              duration,
              status,
              recurringId
            );

            count++;

          }

          current.setDate(
            current.getDate() + 1
          );

        }

        alert(
          `${count} recurring lessons created.`
        );

      }

      blockForm.reset();

      blockDuration.value = "30";

      generateTimeOptions();

      await loadAllBookings();

    } catch (err) {

      console.error(err);

      alert("Failed to create slot.");

    }

  }
);

cleanupBtn.addEventListener(
  "click",
  async () => {

    const threeMonthsAgo =
      new Date();

    threeMonthsAgo.setMonth(
      threeMonthsAgo.getMonth() - 3
    );

    try {

      const snapshot =
        await getDocs(
          collection(db, "slots")
        );

      let deletedCount = 0;

      for (const docSnap of snapshot.docs) {

        const slot =
          docSnap.data();

        if (!slot.time) continue;

        const start =
          slot.time.toDate();

        const end =
          new Date(
            start.getTime() +
            (slot.duration || 30) *
            60000
          );

        if (end < threeMonthsAgo) {

          await deleteDoc(
            doc(
              db,
              "slots",
              docSnap.id
            )
          );

          deletedCount++;

        }

      }

      alert(
        `Deleted ${deletedCount} old slots.`
      );

      await loadAllBookings();

    } catch (err) {

      console.error(err);

      alert("Cleanup failed.");

    }

  }
);

loadAllBookings();