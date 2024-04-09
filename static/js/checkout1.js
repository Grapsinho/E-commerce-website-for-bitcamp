function getCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
      var cookie = jQuery.trim(cookies[i]);
      // Check if this cookie string begins with the name provided
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}
var csrftoken = getCookie("csrftoken");

function sanitizeInput(userInput) {
  // Remove all HTML tags from user input
  let sanitizedInput = userInput.replace(/(<([^>]+)>)/gi, "");
  return sanitizedInput;
}

function isValidEmail(email) {
  // Use a regular expression to check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

let skuArr = [];

document.querySelectorAll("#checkout-product_sku").forEach((element) => {
  skuArr.push(sanitizeInput($(element).val()));
});

console.log(skuArr);

$(".start_checkout_process_btn")
  .off("click")
  .on("click", function (event) {
    event.preventDefault(); // Prevent form submission

    // Perform basic form validation
    let isValid = true;
    let isValid2 = true;

    // Check if email field is empty or invalid
    const emailValue = sanitizeInput($("#checkout-email").val());
    if (!emailValue || !isValidEmail(emailValue)) {
      isValid = false;
      alert("Please enter a valid email address.");
    }

    // Perform other validation checks for remaining fields as needed

    $(".necessary_form").each(function () {
      const fieldValue = sanitizeInput($(this).val().trim());
      if (!fieldValue) {
        isValid2 = false;
        const fieldName = $(this).attr("name");
        alert(`Please fill in the ${fieldName} field.`);
        return false;
      } else {
        isValid2 = true;
      }
    });

    if (isValid && isValid2) {
      // Proceed with the AJAX call if the form is valid
      $.ajax({
        type: "POST",
        url: "/processOrder/",
        headers: { "X-CSRFToken": csrftoken },
        data: {
          email: sanitizeInput($("#checkout-email").val()),
          number: sanitizeInput($("#checkout-phone").val()),
          full_name: sanitizeInput($("#checkout-name").val()),
          address: sanitizeInput($("#checkout-address").val()),
          city: sanitizeInput($("#checkout-city").val()),
          postalCode: sanitizeInput($("#checkout-postal").val()),
          sku: JSON.stringify(skuArr),
        },
        success: function (data) {
          console.log(data);
          $(".modal_forCheckout").addClass("show");
        },
        error: function (xhr, status, err) {
          console.error("Error processing order: ", err);
          alert(
            "An unexpected error occurred while processing your order. Please try again later."
          );
        },
      });
    }
  });
