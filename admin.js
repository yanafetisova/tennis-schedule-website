import { db, auth } from "./firebase.js";
import {
  collection,
  query,
  where,
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

const bookingsTable = document.querySelector("#bookingsTable tbody");
const confirmedTable = document.querySelector("#confirmedTable tbody");
const pastConfirmedTable = document.querySelector("#pastConfirmedTable tbody");

const mensLessonsTable = document.querySelector("#mensLessonsTable tbody");
const womensLessonsTable = document.querySelector("#womensLessonsTable tbody");
const kidsLessonsTable = document.querySelector("#kidsLessonsTable tbody");
const summerCampTable = document.querySelector("#summerCampTable tbody");

const blockForm = document.getElementById("blockForm");
const blockDate = document.getElementById("blockDate");
const blockTime = document.getElementById("blockTime");
const blockDuration = document.getElementById("blockDuration");
const blockStatus = document.getElementById("blockStatus");
const logoutBtn = document.getElementById("logoutBtn");
const cleanupBtn = document.getElementById("cleanupOldSlots");

const bookingMode = document.getElementById("bookingMode");
const rangeFields = document.getElementById("rangeFields");
const weeklyFields = document.getElementById("weeklyFields");
const endDateInput = document.getElementById("endDate");
const weeklyUntilInput = document.getElementById("weeklyUntil");

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
  blockTime.innerHTML = "";

  const startHour = 6;
  const startMinute = 30;
  const endHour = 21;
  const endMinute = 0;

  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const endTime = new Date();
  endTime.setHours(endHour, endMinute, 0, 0);

  while (current <= endTime) {
    const h = current.getHours().toString().padStart(2, "0");
    const m = current.getMinutes().toString().padStart(2, "0");
});