$(document).ready(function () {
  // Set up variables

  const jwtToken = localStorage.getItem("access_token");

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

  var mainImage = $(".main-image");
  var thumbnails = $(".thumbnail");

  const attributes_values_const = JSON.parse(
    document.getElementById("attributes_values").textContent
  );

  const most_imp_attr = JSON.parse(
    document.getElementById("most_imp_attr").textContent
  );

  let most_imp_attr2 = "";
  let current_filter = "";

  const sku_for_prod = JSON.parse(
    document.getElementById("sku_for_prod").textContent
  );

  let filters = [];

  if (attributes_values_const && most_imp_attr2 == "") {
    const filter_div54 = document.querySelectorAll(".filter-products-values");

    filter_div54.forEach((element) => {
      if (element.dataset.filter == most_imp_attr) {
        console.log(element.dataset.filter, most_imp_attr);
        if (
          attributes_values_const[element.dataset.filter] &&
          attributes_values_const[element.dataset.filter][0] ===
            element.dataset.value
        ) {
          element.childNodes.item(1).childNodes.item(3).classList.add("active");
          filters.push(attributes_values_const[element.dataset.filter][0]);
        }
      }

      if (
        attributes_values_const[element.dataset.filter][0] !==
          element.dataset.value &&
        element.dataset.filter !== most_imp_attr
      ) {
        element.childNodes
          .item(1)
          .childNodes.item(3)
          .classList.add("no_in_stock");
      }
    });
  }

  // Function to remove "active" class from other elements with most_imp_attr
  function removeActiveFromOthers() {
    const filter_div = document.querySelectorAll(".filter-products-values");
    filter_div.forEach((element) => {
      if (element.dataset.filter === most_imp_attr) {
        element.childNodes
          .item(1)
          .childNodes.item(3)
          .classList.remove("active");
      }
    });
  }

  let res = JSON.stringify(filters);

  function updateFilter() {
    $.ajax({
      type: "GET",
      url: "/filter_sub_products_forproduct_detail/",
      data: {
        "filters_data": res,
        "sku_for_prod": sku_for_prod,
      },
      success: function (response) {
        var products = response;
        var values = products.values;

        if (
          values.length > 2 &&
          products.most_important_attribute1 !== most_imp_attr
        ) {
          most_imp_attr2 = products.most_important_attribute1;
          current_filter = products.values_for_current_item[0];
        }

        for (let index = 0; index < $(".filter-value-sty").length; index++) {
          const element = $(".filter-value-sty")[index];

          if (values.includes(element.innerText.trim())) {
            // თუ ველიუებში არის ისეთი ელემენტი რომელიც არის ამ დივებში ჩვენ მას გადავცემთ
            // აქტივ კლასს და თუ ელემენტს ანუ მაგალითად size ქონდა ნო ინ სტოკ მაშინ ვუთიშავთ
            element.classList.add("active");
            if (element.classList.contains("no_in_stock")) {
              element.classList.remove("no_in_stock");
            }

            if (
              values.length > 2 &&
              element.dataset.filter == products.most_important_attribute1 &&
              element.dataset.value !== products.values_for_current_item[1]
            ) {
              element.classList.remove("active");
            }
          }

          if (
            !values.includes(element.innerText.trim()) &&
            element.dataset.filter !== products.most_important_attribute1 &&
            element.dataset.filter !== most_imp_attr
          ) {
            element.classList.add("no_in_stock");
          }
        }

        // Clear the product list before appending new data
        $(".name").empty();
        $(".price").empty();
        $(".description").empty();
        $(".code32").empty();
        $(".main-image").empty();

        $(".code32").text(`${products.sku}`);
        $(".price").text(`$${products.price}`);
        $(".name").text(`${products.name}`);
        $(".description").text(`${products.desc}`);
        $(".unit").text(`${products.stock}`);
        $('input[name="quantity"]').attr("max", products.stock);

        if (products.img_url == "/static/images/No Image.svg") {
          $(".defaultimg-div").append(
            `<img src="/static/images/No Image.svg" alt="">`
          );
        } else {
          $(".main-image").attr("src", `/static${products.img_url}`);
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText);
      },
    });
  }

  // Add click event to thumbnails
  thumbnails.click(function () {
    // Change the source of the main image to the clicked thumbnail's source
    var imgSrc = $(this).attr("src");
    mainImage.attr("src", imgSrc);

    // Toggle the "active" class on the clicked thumbnail
    $(this).toggleClass("active");

    // Remove the "active" class and border from other thumbnails
    thumbnails.not(this).removeClass("active").css("border", "none");

    // Add or remove border based on the presence of the "active" class
    if ($(this).hasClass("active")) {
      $(this).css("border", "2px solid #008CBA");
    }
  });

  const filter_div = document.querySelectorAll(".filter-products-values");

  filter_div.forEach((element, index) => {
    element.addEventListener("click", () => {
      let attr = element.dataset.filter;
      let value_attr = element.dataset.value;

      if (attr == most_imp_attr && most_imp_attr !== most_imp_attr2) {
        filters = [];

        filters.push(value_attr);

        removeActiveFromOthers();

        element.childNodes.item(1).childNodes.item(3).classList.add("active");

        console.log(filters);

        res = JSON.stringify(filters);

        updateFilter();
      }

      if (attr == most_imp_attr2 && most_imp_attr2 !== "") {
        console.log(current_filter);

        filters = [];

        filters.push(value_attr);
        filters.push(current_filter);

        //removeActiveFromOthers();

        element.childNodes.item(1).childNodes.item(3).classList.add("active");

        console.log(filters);

        res = JSON.stringify(filters);

        updateFilter();
      }
    });
  });

  updateFilter();

  let avg_rating = JSON.parse(
    document.getElementById("avg_rating").textContent
  );

  // Calculate the average rating and number of filled stars
  var averageRating = parseFloat(avg_rating);
  console.log(averageRating);
  var numFilledStars = Math.round(averageRating);

  // Clear any existing star elements
  $(".rating-stars").empty();

  // Generate star elements and fill them based on the average rating
  for (var i = 1; i <= 5; i++) {
    var star = $("<i></i>").addClass("fas fa-star star");

    console.log(i, numFilledStars);

    if (i > numFilledStars) {
      star.addClass("not_filled");
    }
    $(".rating-stars").append(star);
  }

  // Star rating
  $("#rating-stars").on("click", ".star", function () {
    var rating = $(this).data("value");
    $("#rating").val(rating);
    $(this).prevAll(".star").addBack().addClass("fas").removeClass("far");
    $(this).nextAll(".star").removeClass("fas").addClass("far");
  });
  // Submit review form via Ajax
  $(".rating_review_btn").on("click", () => {
    let comment = document.querySelector("#comment").value;
    let rating = document.querySelector("#rating").value;
    $.ajax({
      type: "POST",
      url: "/submit_review/",
      headers: {
        "X-CSRFToken": csrftoken,
        "Authorization": `Bearer ${jwtToken}`,
      },
      data: {
        "comment": comment,
        "rating": rating,
        "product_id": sku_for_prod,
      },
      success: function (response) {
        // Update reviews list with new review
        $("#reviews-list").append(
          "<li><p>User: " +
            response.user +
            "</p><p>Rating: " +
            response.rating +
            "</p><p>Comment: " +
            response.comment +
            "</p></li>"
        );
        // Update average rating and number of ratings
        $("#average-rating").text(
          "Average Rating: " + response.average_rating.toFixed(1)
        );
        $("#num-ratings").text("Number of Ratings: " + response.num_ratings);
        // Update star rating display based on the new average rating
        $(".rating-stars").empty();
        for (var i = 1; i <= 5; i++) {
          if (i <= response.average_rating) {
            $(".rating-stars").append('<i class="fas fa-star star"></i>');
          } else {
            $(".rating-stars").append('<i class="far fa-star star"></i>');
          }
        }
      },
      error: function (xhr, errmsg, err) {
        console.log(xhr.status + ": " + xhr.responseText);
      },
    });
  });
});
