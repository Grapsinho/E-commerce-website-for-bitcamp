$(document).ready(function () {
  // Initial sorting option
  var sortOption = "low_to_high";

  // var filterAttribute = "";
  var filterValue = "";

  let cat_filters1 = [];
  let attr_filter_arr = [];

  var filtersString = JSON.stringify(cat_filters1);

  let filtersString_attr = JSON.stringify(attr_filter_arr);

  // Function to update the product list
  function updateProductList() {
    $.ajax({
      type: "GET",
      url: "/filter_products_for_collections/",

      data: {
        "sort": sortOption, // Send the sorting option to the server
        "filters_cat": filtersString,
        "filters_attr": filtersString_attr,
      },

      success: function (data) {
        // Handle the response data (filtered products) here
        var products = data.products;

        // Clear the product list before appending new data
        $("#product_list").empty();
        console.log($("#product_list"));

        console.log(products);

        for (var i = 0; i < products.length; i++) {
          var product = products[i];

          // Perform an action for each product, such as displaying it
          $("#product_list").append(
            `
              <div class="col-md-6 col-lg-4 col-xl-3">
                <div class="product">
                  <img src="${product.img_url}" alt="Product Image" />
                  <div class="product-info">
                    <h2>${product.name}</h2>
                    <p class="price">${product.price}</p>
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
