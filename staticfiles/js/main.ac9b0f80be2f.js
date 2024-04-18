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

let jwtToken = localStorage.getItem("access_token");

let cartItems = document.cookie
  .split(";")
  .find((cookie) => cookie.trim().startsWith("cart_items="));

// the products that a guest user adds to the cart will also be added for registered users. when user logins
if (cartItems && document.getElementById("wishproducts")) {
  $.ajax({
    type: "GET",
    url: "/get_cart_data/",
    success: function (response_cookie) {
      console.log(response_cookie);

      let sku_cookie = [];
      let quantity_cookie = [];

      if (!response_cookie.message) {
        for (let i = 0; i < response_cookie.cart_products.length; i++) {
          const element = response_cookie.cart_products[i];
          console.log(element);
          sku_cookie.push(element.sku);
          quantity_cookie.push(element.quantity);
        }
      }

      if (!response_cookie.message) {
        $.ajax({
          type: "POST",
          url: "/add_to_cart_users/",
          headers: {
            "X-CSRFToken": csrftoken,
            "Authorization": `Bearer ${jwtToken}`,
          },
          data: {
            "sku_cookie": JSON.stringify(sku_cookie),
            "quantity_cookie": JSON.stringify(quantity_cookie),
          },
          success: function (data) {
            console.log(data);

            if (data.message_already) {
              alert(data.message_already);
              return;
            }

            if (data.good_message) {
              alert(data.good_message);
              return;
            }
          },
          error: function (xhr, status, error) {
            console.log(xhr);
            if (xhr.responseText == '{"error25": "Token has expired"}') {
              $.ajax({
                url: `${location.protocol}//${location.host}/auth/jwt/refresh/`,
                type: "POST",
                headers: {
                  "X-CSRFToken": csrftoken,
                },
                contentType: "application/json",
                data: JSON.stringify({
                  refresh: localStorage.getItem("refresh_token"),
                }),
                success: function (data) {
                  console.log(data);
                  localStorage.setItem("access_token", data.access);

                  const jwtToken2 = localStorage.getItem("access_token");

                  let sku_cookie = [];
                  let quantity_cookie = [];

                  if (!response_cookie.message) {
                    for (
                      let i = 0;
                      i < response_cookie.cart_products.length;
                      i++
                    ) {
                      const element = response_cookie.cart_products[i];
                      console.log(element);
                      sku_cookie.push(element.sku);
                      quantity_cookie.push(element.quantity);
                    }
                  }

                  $.ajax({
                    type: "POST",
                    url: "/add_to_cart_users/",
                    headers: {
                      "X-CSRFToken": csrftoken,
                      "Authorization": `Bearer ${jwtToken2}`,
                    },
                    data: {
                      "sku_cookie": JSON.stringify(sku_cookie),
                      "quantity_cookie": JSON.stringify(quantity_cookie),
                    },
                    success: function (data) {
                      console.log(data);

                      if (data.message_already) {
                        alert(data.message_already);
                        return;
                      }

                      if (data.good_message) {
                        alert(data.good_message);
                        return;
                      }
                    },
                    error: function (error) {
                      console.log(error);
                    },
                  });
                },
                error: function (xhr, status, error) {
                  console.error(error);
                },
              });
            }
          },
        });

        document.cookie =
          "cart_items" + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    },
    error: function (xhr, status, error) {
      console.error(xhr.responseText);
    },
  });
} else {
  if (cartItems) {
    $.ajax({
      type: "GET",
      url: "/get_cart_data/",
      success: function (data) {
        console.log(data);
        if (!data.message) {
          for (let index = 0; index < data.cart_products.length; index++) {
            const element = data.cart_products[index];

            let cart_total_value = parseInt($(".produ_count_cart").text());

            $(".produ_count_cart").text(cart_total_value + 1);

            $(".cart_empt").remove();

            $(".off_body_forProd").append(`
                        <div style="margin-bottom: 1rem;">

                          <a href="${location.protocol}//${location.host}/product_detail/${element.unique_id}/" class="result_a_tag"
                                style="display: flex;align-items: center;"><img
                                        src="/static${element.img_url}"
                                        alt=""
                                        style="max-width: 70px"
                                      /> <span class="result-span" style="
                                      display: flex;
                                      flex-direction: column;
                                  ">

                                        <span style="color: black;"> ${element.name} </span>
                                        <span class="price_prod" style="color: black;"> ${element.prod_price}$ </span>
                                        <span class="quantity" style="color: black;">Quantity: ${element.quantity} </span>

                                      </span>
                          </a>

                          <div
                            class="p-2 prod_cart_delete"
                            style="background-color: red; cursor: pointer; text-align: center;"
                            data-count="${element.sku}"
                          >
                            <i class="bi bi-trash text-light"></i>
                          </div>
                        </div>
                  `);

            $(".cart_sum").text(`${data.total_price}`);

            const prod_cart_delete =
              document.querySelectorAll(".prod_cart_delete");

            prod_cart_delete.forEach((delete_btn) => {
              delete_btn.addEventListener("click", () => {
                const skuToDelete = delete_btn.dataset.count; // Get the SKU of the product to delete
                delete_btn.parentElement.classList.add("d-none");

                let cartItems = document.cookie
                  .split(";")
                  .find((cookie) => cookie.trim().startsWith("cart_items="));

                if (cartItems) {
                  cartItems = cartItems.split("=")[1];
                  cartItems = cartItems
                    .replace(/^"|"$/g, "")
                    .replace(/\\054/g, ",")
                    .replace(/\\/g, "")
                    .replace(/'sku':\s*["']([^"']*)["']/g, '"sku": "$1"')
                    .replace(/'quantity':\s*(\d+)/g, '"quantity": $1');

                  let items = JSON.parse(cartItems); // Parse the JSON string into an array of objects

                  // Find and remove the item with the corresponding SKU from the cart
                  items = items.filter((item) => item.sku !== skuToDelete);

                  // Update the cart_items cookie with the modified array
                  document.cookie =
                    "cart_items=" +
                    JSON.stringify(items) +
                    "; expires=Thu, 01 Jan 2070 00:00:00 UTC; path=/;";

                  // Calculate the updated total value of items in the cart
                  let cart_total_value = items.reduce(
                    (total, item) => total + item.quantity,
                    0
                  );

                  $(".cart-total").text(cart_total_value);

                  // Reload the page after a short delay to reflect the changes in the cart
                  setTimeout(function () {
                    location.reload();
                  }, 500); // Reload the page after a short delay (500 milliseconds)
                }
              });
            });
          }
        }
      },
      error: function (xhr, status, error) {
        console.error(error);
      },
    });
  }
}

if (document.getElementById("wishproducts")) {
  $(document).on("click", ".prod_cart_delete", function () {
    const delete_btn = $(this);
    const skuToDelete = delete_btn.data("count"); // Get the SKU of the product to delete
    delete_btn.parent().addClass("d-none");

    $.ajax({
      url: "/remove_product_from_cart/",
      type: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
      },
      data: {
        product_id: skuToDelete,
      },
      success: function (response) {
        if (response.success) {
          let cart_total_value = parseInt($(".produ_count_cart").text());
          $(".produ_count_cart").text(cart_total_value - 1);

          let cart_total_cart_sum = parseFloat(
            $(".cart_sum").text().split("$")[0]
          );
          $(".cart_sum").text(
            cart_total_cart_sum - parseFloat(response.decreased_price)
          );
        } else {
          // Product not found in the cart
          alert("Product not found in the cart");
        }
      },
      error: function (xhr, status, error) {
        console.error("Error removing product from cart:", error);
      },
    });
  });
}

$(document).on("click", ".wish_delete", function () {
  const wish_delete = document.querySelectorAll(".wish_delete");
  let count_wish = wish_delete.length;

  const delete_bnt_wish = $(this);

  let itsOk = true;
  const wish_count = document.querySelector(".wish_count");

  $.ajax({
    type: "POST",
    url: "/delete_to_wishlist/",
    headers: {
      "X-CSRFToken": csrftoken,
    },
    data: {
      "product_id": delete_bnt_wish.data("count"),
    },
    success: function (response) {
      console.log(response);

      delete_bnt_wish.parent().remove();

      count_wish--;

      if (response.success) {
        wish_count.textContent = count_wish;

        if (count_wish < 1 && itsOk) {
          $(".modal-body").append("You Don't Have Any Wished Products Yet.");
          itsOk = false;
        }
      } else {
        alert(response.message);
      }
    },
    error: function (xhr, status, error) {
      alert("Error occurred while deleting product from wishlist.");
      console.error(xhr.responseText);
    },
  });
});
