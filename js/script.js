/* =========================================================
   PAWS ANIMAL RESCUE
   Main JavaScript File

   This file controls:
   1. Mobile navigation
   2. Enquiry form
   3. Contact form
========================================================= */


/* =========================================================
   1. MOBILE NAVIGATION
========================================================= */

// Find the mobile menu button
const menuToggle = document.getElementById("menuToggle");

// Find the navigation links container
const navLinks = document.querySelector(".nav-links");


if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        // Add or remove the "show" class
        navLinks.classList.toggle("show");

    });

}


if (navLinks) {

    const navigationItems = navLinks.querySelectorAll("a");

    navigationItems.forEach(function (link) {

        link.addEventListener("click", function () {

            navLinks.classList.remove("show");

        });

    });

}


// Find the enquiry form
const enquiryForm = document.getElementById("enquiryForm");

// Find the message area below the form
const formMessage = document.getElementById("formMessage");


const animalNotice = document.getElementById("animalNotice");
const animalField = document.getElementById("animalOfInterest");
const enquiryTypeField = document.getElementById("enquiryType");

if (enquiryForm && animalField && enquiryTypeField) {

    const params = new URLSearchParams(window.location.search);
    const animalName = params.get("animal");

    if (animalName) {

        animalField.value = animalName;
        enquiryTypeField.value = "adoption";

        if (animalNotice) {

            animalNotice.textContent =
                `🐾 You're applying to adopt ${animalName}! We've pre-filled the enquiry type and animal name below — just complete your details and submit.`;

            animalNotice.className = "form-message success";

        }

    }

}


if (enquiryForm && formMessage) {

    enquiryForm.addEventListener("submit", function (event) {

        event.preventDefault();


        // Get the values entered by the visitor
        const firstName =
            document.getElementById("firstName").value.trim();

        const lastName =
            document.getElementById("lastName").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const enquiryType =
            document.getElementById("enquiryType").value;

        const message =
            document.getElementById("message").value.trim();

        const animalOfInterest =
            document.getElementById("animalOfInterest").value.trim();


        /*
           Check that the required fields have been
           completed.
        */

        if (
            firstName === "" ||
            lastName === "" ||
            email === "" ||
            enquiryType === "" ||
            message === ""
        ) {

            formMessage.textContent =
                "Please complete all required fields before submitting.";

            formMessage.className =
                "form-message error";

            return;

        }

        formMessage.textContent = animalOfInterest
            ? `Thank you, ${firstName}! Your application to adopt ${animalOfInterest} has been received. A member of the Paws team will contact you soon.`
            : `Thank you, ${firstName}! Your enquiry has been received. A member of the Paws team will contact you soon.`;

        formMessage.className =
            "form-message success";


        // Clear the form after successful submission
        enquiryForm.reset();

        // Clear the animal pre-fill notice, since the form is now empty
        if (animalNotice) {

            animalNotice.textContent = "";
            animalNotice.className = "form-message";

        }

    });

}


/* =========================================================
   3. CONTACT FORM
========================================================= */

// Find the contact form
const contactForm = document.getElementById("contactForm");

// Find the contact form message area
const contactFormMessage =
    document.getElementById("contactFormMessage");


/*
   The contact form only exists on contact.html.

   Check that it exists before adding the event.
*/

if (contactForm && contactFormMessage) {

    contactForm.addEventListener("submit", function (event) {

        // Prevent page refresh
        event.preventDefault();


        // Get values entered by the visitor
        const name =
            document.getElementById("contactName").value.trim();

        const email =
            document.getElementById("contactEmail").value.trim();

        const subject =
            document.getElementById("subject").value.trim();

        const message =
            document.getElementById("contactMessage").value.trim();


        /*
           Check required fields.
        */

        if (
            name === "" ||
            email === "" ||
            subject === "" ||
            message === ""
        ) {

            contactFormMessage.textContent =
                "Please complete all required fields before sending your message.";

            contactFormMessage.className =
                "form-message error";

            return;

        }


        /*
           Display confirmation message.
        */

        contactFormMessage.textContent =
            `Thank you, ${name}! Your message has been received. We will get back to you soon.`;

        contactFormMessage.className =
            "form-message success";


        // Clear the form
        contactForm.reset();

    });

}