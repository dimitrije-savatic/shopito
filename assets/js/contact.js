$("#contactForm").submit(function (e) {
    e.preventDefault();
    checkContactForm();
});

function checkContactForm() {
    let name = document.getElementById("name");
    let email = document.getElementById("email");
    let subject = document.getElementById("subject");
    let message = document.getElementById("message");

    // Error elements
    let nameError = document.getElementById("nameError");
    let emailError = document.getElementById("emailError");
    let subjectError = document.getElementById("subjectError");
    let messageError = document.getElementById("messageError");


    clearErrors();

    let nameRegex = /^[a-zA-Z\s]{2,50}$/;
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let subjectRegex = /^.{3,100}$/;
    let messageRegex = /^.{10,500}$/;

    let isValid = true;

    if (!nameRegex.test(name.value.trim())) {
        setError(name, nameError, "Name must be 2-50 letters only.");
        isValid = false;
    }

    if (!emailRegex.test(email.value.trim())) {
        setError(email, emailError, "Invalid email format.");
        isValid = false;
    }

    if (!subjectRegex.test(subject.value.trim())) {
        setError(subject, subjectError, "Subject must be 3-100 characters.");
        isValid = false;
    }

    if (!messageRegex.test(message.value.trim())) {
        setError(message, messageError, "Message must be at least 10 characters.");
        isValid = false;
    }

    if (isValid) {
        showToast("Thank you for your message! We will get back to you soon.", "success");
        clearErrors();
        name.value = "";
        email.value = "";
        subject.value = "";
        message.value = "";
    }
}

function setError(input, errorElement, message) {
    errorElement.textContent = message;
    input.classList.add("error-border");
}

function clearErrors() {
    document.querySelectorAll(".error").forEach(el => el.textContent = "");
    document.querySelectorAll("input, textarea").forEach(el => el.classList.remove("error-border"));
}

function showToast(message, type) {
    let toast = document.createElement("div");
    toast.className = "shop-toast bg-" + type;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(function () {
        toast.classList.add("show");
    });

    setTimeout(function () {
        toast.classList.remove("show");
        setTimeout(function () {
            toast.remove();
        }, 220);
    }, 4000);
}