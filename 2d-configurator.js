const backBtn = document.getElementById("backBtn");

function isMobile() {
  return window.innerWidth <= 768;
}

/* ===============================
   SINGLE SOURCE OF TRUTH
================================ */
let answers = {};

const steps = [
  { key: "containerModel", question: "Which container model are you interested in?", options: ["Kennedy", "Ezra", "Augustine", "Custom Build"] },
  { key: "floorPlan", question: "Select your floor plan", options: ["Floorplan A", "Floorplan B"] },
  { key: "exteriorColor", question: "Select an Exterior Color", options: ["Black", "Grey", "White", "Custom"] },
  { key: "flooring", question: "Select Flooring", options: ["Wood", "Concrete", "Tile"] },
  { key: "wallFinish", question: "Select your wall finish", options: ["Drywall", "Pine", "White Shiplap"] },
  { key: "kitchenFinish", question: "Select your kitchen finish", options: ["Grey", "White", "Undecided"] },
  { key: "bathroomFixtures", question: "Select Your Bathroom Fixtures", options: ["Black", "Chrome", "Gold"] },
  { key: "showerPanel", question: "Select a Composite Shower Tile Panel Style", options: ["Urban Cement", "Marble", "Rustic"] },
  { key: "purchaseInterest", question: "How interested are you in purchasing?", options: ["Ready now", "3 months", "6 months", "Just exploring"] },
  { key: "hasLand", question: "Do you have land?", options: ["Yes", "No"] },
  { type: "form" }
];

let currentStep = 0;
let isTransitioning = false;

const title = document.getElementById("question-title");
const container = document.getElementById("options-container");

/* ===============================
   LOAD STEP
================================ */
function loadStep() {
  container.innerHTML = "";
  title.textContent = steps[currentStep].question || "";

  if (backBtn) {
    backBtn.style.display = currentStep === 0 ? "none" : "block";
    backBtn.classList.toggle("mobile-back", isMobile());
  }

  // FINAL FORM STEP
  if (steps[currentStep].type === "form") {
    container.innerHTML = `
      <form id="finalForm" class="final-form config-form">
        <div class="form-row">
          <input name="firstName" placeholder="First name" required />
          <input name="lastName" placeholder="Last name" required />
        </div>

        <input name="phone" placeholder="Phone number" required />
        <input name="email" placeholder="Email address" required />

        <label>
          <span>How do you prefer to be contacted?</span>
          <label><input type="checkbox" name="contactPref" value="Email"> Email</label>
          <label><input type="checkbox" name="contactPref" value="Phone"> Phone Call</label>
          <label><input type="checkbox" name="contactPref" value="Text"> Text</label>
        </label>

        <input name="zip" placeholder="Delivery Zip Code" required />
        <textarea name="comments" placeholder="Questions / Comments"></textarea>

        <label>
          <input type="checkbox" required /> I agree to the terms of service
        </label>

        <button type="submit" class="submit-btn">GET QUOTE</button>
      </form>
    `;

    document.getElementById("finalForm").onsubmit = handleSubmit;
    return;
  }

  // OPTION STEPS
  const grid = document.createElement("div");
  grid.className = "option-grid";

  steps[currentStep].options.forEach(opt => {
    const card = document.createElement("div");
    card.className = "option-card";
    card.textContent = opt;

    card.onclick = () => {
      answers[steps[currentStep].key] = opt;
      setTimeout(() => {
        currentStep++;
        loadStep();
      }, 300);
    };

    grid.appendChild(card);
  });

  container.appendChild(grid);
}

/* ===============================
   BACK BUTTON
================================ */
if (backBtn) {
  backBtn.onclick = () => {
    if (isTransitioning || currentStep === 0) return;
    isTransitioning = true;
    currentStep--;
    setTimeout(() => {
      loadStep();
      isTransitioning = false;
    }, 200);
  };
}

loadStep();

/* ===============================
   FORM SUBMIT
================================ */
function handleSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  const payload = {
    timestamp: new Date().toLocaleString(),

    // POPUP ANSWERS
    containerModel: answers.containerModel || "",
    floorPlan: answers.floorPlan || "",
    exteriorColor: answers.exteriorColor || "",
    flooring: answers.flooring || "",
    wallFinish: answers.wallFinish || "",
    kitchenFinish: answers.kitchenFinish || "",
    bathroomFixtures: answers.bathroomFixtures || "",
    showerPanel: answers.showerPanel || "",
    purchaseInterest: answers.purchaseInterest || "",
    hasLand: answers.hasLand || "",

    // FORM DATA
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    contactPreference: formData.getAll("contactPref").join(", "),
    zipCode: formData.get("zip"),
    comments: formData.get("comments")
  };

  // GOOGLE SHEET
  fetch("https://script.google.com/macros/s/AKfycbw04DfolWFtL57xJICc8ldt7UudfMAp6VOcJpg7gutNjWDogkSQj95XUQSypZ3Su3DGGQ/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  // EMAIL (ONLY HERE)
  emailjs.send("service_eveb6wg", "template_ji07jos", {
  // PROJECT SELECTION
  container_model: answers.containerModel || "",
  floor_plan: answers.floorPlan || "",
  exterior_color: answers.exteriorColor || "",
  flooring: answers.flooring || "",
  wall_finish: answers.wallFinish || "",
  kitchen_finish: answers.kitchenFinish || "",
  bathroom_fixtures: answers.bathroomFixtures || "",
  shower_panel: answers.showerPanel || "",

  // PURCHASE DETAILS
  purchase_interest: answers.purchaseInterest || "",
  land_status: answers.hasLand || "",

  // CUSTOMER DETAILS
  first_name: formData.get("firstName"),
  last_name: formData.get("lastName"),
  phone: formData.get("phone"),
  email: formData.get("email"),
  contact_method: formData.getAll("contactPref").join(", "),
  zip_code: formData.get("zip"),
  comments: formData.get("comments")
});


  title.textContent = "";
  container.innerHTML = `
    <div class="success-message">
      <h2>Thank you!</h2>
      <p>Your quote request has been submitted successfully.</p>
      <a href="/" class="back-home-btn">← Back to Home</a>
    </div>
  `;
  backBtn.style.display = "none";
}
