$(document).ready(function () {
  let chat_seen_bol = JSON.parse(
    document.getElementById("chat_seen_bol_id").textContent
  );
  let chat_seen = JSON.parse(
    document.getElementById("chat_seen_id").textContent
  );

  if (chat_seen_bol) {
    $(".modal_for_seen").addClass("show");
    $(".modal_seen").append(chat_seen);
    document
      .querySelector("#btn_remove_modal")
      .addEventListener("click", () => {
        $(".modal_for_seen").removeClass("show");
      });

    document.querySelector(".for_modal_close").addEventListener("click", () => {
      $(".modal_for_seen").removeClass("show");
    });
  }

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

  // Initial sorting option
  var sortOption = "low_to_high";

  // var filterAttribute = "";
  var filterValue = "";

  let cat_filters1 = [];
  let attr_filter_arr = [];

  var filtersString = JSON.stringify(cat_filters1);

  let filtersString_attr = JSON.stringify(attr_filter_arr);

  let search_q = JSON.parse(document.getElementById("search_q").textContent);

  // Function to update the product list
  function updateProductList() {
    $.ajax({
      type: "GET",
      url: "/filter_products_for_collections/",

      data: {
        "sort": sortOption, // Send the sorting option to the server
        "filters_cat": filtersString,
        "filters_attr": filtersString_attr,
        "search_q": search_q,
      },

      success: function (data) {
        // Handle the response data (filtered products) here
        var products = data.products;

        // Clear the product list before appending new data
        $("#product_list").empty();

        if (document.querySelector(".wish_count")) {
          for (var i = 0; i < products.length; i++) {
            var product = products[i];

            // Perform an action for each product, such as displaying it
            $("#product_list").append(
              `
              <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="product">
                  <img src="${product.img_url}" alt="Product Image" />
                  <div class="product-info">
                  <div class="d-flex" style="align-items: center;
                  justify-content: space-between;">
                    <div>
                      <h2>${product.name}</h2>
                      <p class="price">$${product.price}</p>
                    </div>
            
                    <button type="button" class="btn btn-secondary heart_wish" data-uniq="${product.pk_forWish}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart" viewBox="0 0 16 16">
                        <path d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143q.09.083.176.171a3 3 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15"></path>
                      </svg>
                    </button>
                  </div>
                  <a
                    href="${location.protocol}//${location.host}/product_detail/${product.unique_id}/"
                    class="btn15"
                    >See Product</a
                  >
                </div>
                </div>
            </div>

            `
            );
          }

          const heart_wish = document.querySelectorAll(".heart_wish");
          const wish_count = document.querySelector(".wish_count");
          let count_wish = parseInt(wish_count.textContent);

          wish_count.textContent = count_wish;

          heart_wish.forEach((element1234, index) => {
            element1234.addEventListener("click", () => {
              element1234.classList.remove("btn-secondary");
              element1234.classList.add("btn-danger");

              $.ajax({
                type: "POST",
                url: "/add_to_wishlist/",
                headers: {
                  "X-CSRFToken": csrftoken,
                },
                data: {
                  "product_id": element1234.dataset.uniq,
                },
                success: function (response) {
                  console.log(response);
                  count_wish++;
                  if (response.success) {
                    wish_count.textContent = count_wish;

                    $(".no-products_inwish").addClass("d-none");

                    $(".wish_mod_body").prepend(`
                          <div class="d-flex-sm mb-2">
                            <a
                              href="${location.protocol}//${location.host}/product_detail/${response.product_unique_id}/"
                              class="result_a_tag"
                              style="display: flex; align-items: center"
                              ><img
                                src="/static${response.image}"
                                alt=""
                                style="max-width: 70px"
                              />
                              <span
                                class="result-span"
                                style="display: flex; flex-direction: column"
                              >
                                <span style="color: black">
                                ${response.product_name}
                                </span>
                                <span class="price" style="color: black">
                                  $ ${response.price}
                                </span>
                              </span>
                            </a>

                            <div
                              class="p-2 wish_delete wish_delete${response.product_id}"
                              style="background-color: red; cursor: pointer"
                              data-count="${response.product_id}"
                            >
                              <i class="bi bi-trash text-light"></i>
                            </div>
                          </div>
                    `);
                  } else {
                    alert(response.message);
                  }
                },
                error: function (xhr, status, error) {
                  alert("Error occurred while adding product to wishlist.");
                  console.error(xhr.responseText);
                },
              });
            });
          });
        } else {
          for (var i = 0; i < products.length; i++) {
            var product = products[i];

            // Perform an action for each product, such as displaying it
            $("#product_list").append(
              `
              <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="product">
                  <img src="${product.img_url}" alt="Product Image" />
                  <div class="product-info">
                  <div class="d-flex" style="align-items: center;
                  justify-content: space-between;">
                    <div>
                      <h2>${product.name}</h2>
                      <p class="price">$${product.price}</p>
                    </div>
                  </div>
                  <a
                    href="${location.protocol}//${location.host}/product_detail/${product.unique_id}/"
                    class="btn15"
                    >See Product</a
                  >
                </div>
                </div>
            </div>

            `
            );
          }
        }
      },
    });
  }

  $(".low_to_high-sty").addClass("active");
  // Handle the "Price, low to high" button click
  $(".low_to_high")
    .off("click")
    .on("click", function () {
      if (sortOption !== "low_to_high") {
        sortOption = "low_to_high";

        if ($(this).is(":checked")) {
          $(".low_to_high-sty").addClass("active");
          $(".high_to_low-sty").removeClass("active");
        } else {
          $(".low_to_high-sty").removeClass("active");
        }
        // Update the product list
        updateProductList();
      }
    });

  // Handle the "Price, high to low" button click
  $(".high_to_low")
    .off("click")
    .on("click", function () {
      if (sortOption !== "high_to_low") {
        sortOption = "high_to_low";

        if ($(this).is(":checked")) {
          $(".high_to_low-sty").addClass("active");
          $(".low_to_high-sty").removeClass("active");
        } else {
          $(".high_to_low-sty").removeClass("active");
        }

        // Update the product list
        updateProductList();
      }
    });

  const cat_filter = document.querySelectorAll(
    ".filter-products-values_forCat"
  );
  const attr_filter = document.querySelectorAll(".filter-products-values");

  attr_filter.forEach((element1) => {
    element1.addEventListener("click", () => {
      let filter_val = element1.dataset.cat;

      let index = attr_filter_arr.indexOf(filter_val);

      if (index === -1) {
        // If not found, add it to the array
        attr_filter_arr.push(filter_val);
        element1.childNodes[1].childNodes[3].classList.add("active");
      } else {
        // If found, remove it from the array
        attr_filter_arr.splice(index, 1);

        element1.childNodes[1].childNodes[3].classList.remove("active");
      }

      filtersString_attr = JSON.stringify(attr_filter_arr);

      updateProductList();
    });
  });

  cat_filter.forEach((element) => {
    element.addEventListener("click", () => {
      let filter_val = element.dataset.cat;

      let index = cat_filters1.indexOf(filter_val);

      if (index === -1) {
        // If not found, add it to the array
        cat_filters1.push(filter_val);
        element.childNodes[1].childNodes[3].classList.add("active");
      } else {
        // If found, remove it from the array
        cat_filters1.splice(index, 1);

        element.childNodes[1].childNodes[3].classList.remove("active");
      }

      filtersString = JSON.stringify(cat_filters1);

      updateProductList();
    });
  });

  // Initial product list load
  updateProductList();
});
