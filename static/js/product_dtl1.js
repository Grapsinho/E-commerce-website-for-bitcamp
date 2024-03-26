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

  let sku_for_prod = document.querySelector(".card1.active").dataset.sku;
  const id_for_prod = document.getElementById("sku_for_prod").textContent;

  function updateFilter() {
    $.ajax({
      type: "GET",
      url: "/filter_sub_products_forproduct_detail/",
      data: {
        "sku_for_prod": sku_for_prod,
      },
      success: function (response) {
        var products = response;
        let attrs = products.rec_data;

        $(".attrs_and_values").text(``);

        for (const key in attrs) {
          const element12 = attrs[key];

          $(".attrs_and_values").append(`
            
              <li class="list-group-item attr_values">
                ${key}:
                <span data-attrValue="${element12[0]}">${element12[0]}</span>
              </li> 
            
            `);
        }

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

  const card = document.querySelectorAll(".card1");

  card.forEach((element) => {
    element.addEventListener("click", () => {
      sku_for_prod = element.dataset.sku;

      card.forEach((element5) => {
        if (element5.classList.contains("active")) {
          element5.classList.remove("active");
        }
      });

      element.classList.add("active");

      updateFilter();
    });
  });

  var mainImage = $(".main-image");
  var thumbnails = $(".thumbnail");

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

  updateFilter();

  let avg_rating = JSON.parse(
    document.getElementById("avg_rating").textContent
  );

  // Calculate the average rating and number of filled stars
  var averageRating = parseFloat(avg_rating);
  var numFilledStars = Math.round(averageRating);

  // Clear any existing star elements
  $(".rating-stars").empty();

  // Generate star elements and fill them based on the average rating
  for (var i = 1; i <= 5; i++) {
    var star = $("<i></i>").addClass("fas fa-star star");

    if (i > numFilledStars) {
      star.addClass("not_filled");
    }
    $(".rating-stars").append(star);
  }

  console.log(id_for_prod);

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
        "product_id": JSON.parse(id_for_prod),
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
