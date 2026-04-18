console.log("This is a multi-step account form.");

const stepInfo = document.getElementById("stepInfo");
const navLeft = document.getElementById("navLeft");
const navRight = document.getElementById("navRight");

const usernameInput = document.getElementById("username");
const imageUpload = document.getElementById("imageUpload");
const shortBio = document.getElementById("bio");
const pronounInput = document.getElementById("pronouns");

const usernameVal = document.getElementById("username-val");
const photoVal = document.getElementById("photo-val");
const bioVal = document.getElementById("bio-val");
const pronounVal = document.getElementById("pronoun-val");

const form = document.getElementById("setupForm");
const formStepsID = ["one", "two", "three", "four"];
let currentFormStep = 0;

const editButtons = {
    "username-edit": 0,
    "photo-edit": 1,
    "bio-edit": 2,
    "pronoun-edit": 2
};

// provides a summary of form for user to review
function updateSummaryValues() {
    usernameVal.textContent = usernameInput.value.trim() || "Not provided";
    bioVal.textContent = shortBio.value.trim() || "Not provided";
    pronounVal.textContent = pronounInput.value.trim() || "Not provided";

    const selectedFile = imageUpload.files[0];

    if (selectedFile) {
        const fileName = selectedFile.name;
        const lastDotIndex = fileName.lastIndexOf(".");
        const hasExtension = lastDotIndex > 0;

        const baseName = hasExtension ? fileName.substring(0, lastDotIndex) : fileName;
        const extension = hasExtension ? fileName.substring(lastDotIndex + 1) : "";
        const truncatedName =
            baseName.length > 18 ? `${baseName.substring(0, 18)}...` : baseName;

        photoVal.textContent = extension
            ? `${truncatedName}.${extension}`
            : truncatedName;
    } else {
        photoVal.textContent = "No file selected";
    }
}

// Hides all sections and shows the current one
function updateStepVisibility() {
    formStepsID.forEach((stepId) => {
        const stepElement = document.getElementById(stepId);
        if (stepElement) {
            stepElement.style.display = "none";
            stepElement.setAttribute("aria-hidden", "true");
        }
    });

    const activeStep = document.getElementById(formStepsID[currentFormStep]);
    if (activeStep) {
        activeStep.style.display = "block";
        activeStep.setAttribute("aria-hidden", "false");
    }

    stepInfo.textContent = `Step ${currentFormStep + 1} of ${formStepsID.length}`;

    if (currentFormStep === formStepsID.length - 1) {
        updateSummaryValues();
    }

    navLeft.style.display = currentFormStep === 0 ? "none" : "inline-flex";
    navRight.style.display =
        currentFormStep === formStepsID.length - 1 ? "none" : "inline-flex";

    const firstInput = activeStep.querySelector("input, select, textarea, button");
    if (firstInput) {
        firstInput.focus();
    }
}

// Shows an error message for a field
function showError(input, message) {
    const formControl = input.parentElement;
    const errorSpan = formControl ? formControl.querySelector(".error-message") : null;

    input.classList.add("error");
    input.setAttribute("aria-invalid", "true");

    if (errorSpan) {
        if (!errorSpan.id) {
            errorSpan.id = `${input.id}-error`;
        }
        input.setAttribute("aria-describedby", errorSpan.id);
        errorSpan.textContent = message;
    }
}

// Clears an error message for a field
function clearError(input) {
    const formControl = input.parentElement;
    const errorSpan = formControl ? formControl.querySelector(".error-message") : null;

    input.classList.remove("error");
    input.removeAttribute("aria-invalid");
    input.removeAttribute("aria-describedby");

    if (errorSpan) {
        errorSpan.textContent = "";
    }
}

function validateStep(step) {
    let isValid = true;

    if (step === 0) {
        clearError(usernameInput);

        if (usernameInput.value.trim() === "") {
            showError(usernameInput, "Username is required.");
            isValid = false;
        }
    }

    if (step === 1) {
        clearError(imageUpload);

        if (!imageUpload.files[0]) {
            showError(imageUpload, "A profile photo is required.");
            isValid = false;
        }
    }

    if (step === 2) {
        clearError(shortBio);
        clearError(pronounInput);

        const bioText = shortBio.value.trim();
        const pronounText = pronounInput.value.trim();

        if (bioText === "") {
            showError(shortBio, "A short bio is required.");
            isValid = false;
        } else if (bioText.length > 1500) {
            showError(shortBio, "Your bio must be 1500 characters or fewer.");
            isValid = false;
        }

        if (pronounText === "") {
            showError(pronounInput, "Preferred pronouns are required.");
            isValid = false;
        }
    }

    return isValid;
}
//validation
function realtimeValidation() {
    usernameInput.addEventListener("input", () => {
        if (usernameInput.value.trim() !== "") {
            clearError(usernameInput);
        }
    });

    imageUpload.addEventListener("change", () => {
        if (imageUpload.files[0]) {
            clearError(imageUpload);
        }
    });

    shortBio.addEventListener("input", () => {
        if (shortBio.value.trim() !== "" && shortBio.value.trim().length <= 1500) {
            clearError(shortBio);
        }
    });

    pronounInput.addEventListener("input", () => {
        if (pronounInput.value.trim() !== "") {
            clearError(pronounInput);
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    navLeft.style.display = "none";
    updateStepVisibility();
    realtimeValidation();

    navRight.addEventListener("click", (e) => {
        e.preventDefault();

        // Only move forward if current step is valid
        if (validateStep(currentFormStep) && currentFormStep < formStepsID.length - 1) {
            currentFormStep++;
            updateStepVisibility();
        }
    });

    navLeft.addEventListener("click", (e) => {
        e.preventDefault();

        // Always allow moving backward
        if (currentFormStep > 0) {
            currentFormStep--;
            updateStepVisibility();
        }
    });

    Object.keys(editButtons).forEach((buttonId) => {
        const button = document.getElementById(buttonId);

        if (button) {
            button.addEventListener("click", (e) => {
                e.preventDefault();
                currentFormStep = editButtons[buttonId];
                updateStepVisibility();
            });
        }
    });
});

form.addEventListener("submit", (e) => {
    e.preventDefault();

    updateSummaryValues();

    alert("Woohoo You're All Set!");
    form.reset();
    currentFormStep = 0;
    updateStepVisibility();
});



