console.log("This is an multi-step account form.")

const stepInfo = document.getElementById("stepInfo");
const navLeft = document.getElementById("navLeft");
const navRight = document.getElementById("navRight");

const usernameInput = document.getElementById("username");
const imageUpload = document.getElementById("imageUpload");
const shortBio = document.getElementById("shortBio");
const pronounInput = document.getElementById("pronouns");
const usernameVal = document.getElementById("username-val");
const photoVal = document.getElementById("photo-val");
const bioVal = document.getElementById("bio-val");
const pronounVal = document.getElementById("pronoun-val");

const form = document.getElementbyId("setupForm");
const formStepsID = ["one", "two", "three", "four"];
let currentFormStep = 0;

const editButtons = {
    "username-edit": 0,
    "photo-edit": 1,
    "bio-edit": 0,
    "pronouns-edit": 0
};

// summary event listner for form elements
function updateSummaryValues() {
    usernameVal.textContent = usernameInput.value;
    bioVal.textContent = shortBio.value;
    pronounVal.textContent = pronounInput.value;

    const photoVal = imageUpload.files[0]?.name;
    if (photoVal) {
        const extension = fileName.split(".").pop();
        const baseName = fileName.split(".")[0];
        const truncatedName = baseName.length > 10 ? baseName.substring(0, 10) + "..." : baseName;
        photoVal.textContent = `${truncatedName}.${extension}`;
    } else {
        photoVal.textContent = "No file selected";
    }
}

// hides all sections in form
function updateStepVisibility() {
    formStepsID.forEach((step) => {
        document.getElementbyId(step).style.display = "none";
    });
    // shows currently active section
    document.getElementById(formStepsID[currentFormStep]).style.display = "block";
    //    indicates the user's progress throughout the form
    stepInfo.textContent = `Step ${currentStep + 1} of ${formSteps.length}`;
    //loading summary info box
    if (currentStep === 3) {
        updateSummaryValues();
    }
    // moveent between sections of form
    navLeft.style.display = currentFormStep === 0 ? "none" : "block";
    navRight.style.display = currentFormStep === formStepsID.length - 1 ? "none" : "block";

    const currentStep = document.getElementById(formStepsID[currentFormStep]);
    const firstInput = currentStep.querySelector('input, select, textarea');
    if (firstInput) {
        firstInput.focus();
    }
}
//showing + clearing error message
function showError(input, message) {
    const formControl = input.parentElement;
    const errorSpan = formControl.querySelector(".error-message");
    input.classList.add("error");
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errorSpan.id);
    errorSpan.textContent = message;
}

const clearError = (input) => {
    const formControl = input.parentElement;
    const errorSpan = formControl.querySelector(".error-message");
    input.classList.remove("error");
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
    errorSpan.textContent = '';
}

//validation script for form + summary section content 

const validateStep = (step) => {
    let isValid = true;

    if (currentStep === 0) {
        if (usernameInput.value.trim() === "")
            showError(usernameInput, "Username is required");
        isValid = false;
    }

    if (shortBio.value.trim() === "") {
        showError(shortBio, "A small bio is required");
        isValid = false;
    } else if (step === 1) {
        if (!imageUpload.files[0]) {
            showError(imageUpload, "A profile photo is required");
            isValid = false;
        }
    }

    return isValid;
}


const realtimeValidation = () => {
    usernameInput.addEventListener("input", () => {
        if (usernameInput.value.trim() !== '') clearError(usernameInput);
    })

    shortBio.addEventListener("input", () => {
        if (shortBio.value.trim() !== "") clearError(shortBio);
    })

    imageUpload.addEventListener("change", () => {
        if (imageUpload.files[0]) clearError(imageUpload);
    })
}


//  eventListener for loading the next and previous sections
document.addEveentListener("DOMContentLoaded", () => {
    navLeft.style.display = "none";
    updateStepVisibility();
    realtimeValidation();


    navRight.addEventListener("click", () => {
        if (currentStep < formStep.length - 1) {
            currentStep++;
            updateStepVisibility();
        }
    });
    navLeft.addEventListener("click", () => {
        if (currentStep > 0) {
            currentStep--;
            updateStepVisibility();
        }
    });

    Object.keys(editButtons).forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        button.addEventListener("click", (e) => {
            e.preventDefault();
            currentStep = editButtons[buttonId];
            updateStepVisibility();
        });
    });
});

form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateStep(2)) {
        alert("You're All Set!");
        form.reset();
        currentFormStep = 0;
        updateStepVisibility();
    }
});






