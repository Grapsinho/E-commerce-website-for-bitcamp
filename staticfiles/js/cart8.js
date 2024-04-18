$(document).ready(function () {
  let cartItems = document.cookie
    .split(";")
    .find((cookie) => cookie.trim().startsWith("cart_items="));

  // this is for the registered users
  if (document.getElementById("wishproducts")) {
    $(".deleteBtn").on("click", function () {
      const delete_btn = $(this);
      const skuToDelete = delete_btn.data("count"); // Get the SKU of the product to delete
      delete_btn.parent().parent().remove();

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

            let totalDiv = document.querySelector(".totalPriceCart");

            let decreasedValueCart =
              parseFloat(totalDiv.textContent) -
              parseFloat(response.decreased_price);

            totalDiv.textContent = decreasedValueCart.toFixed(2);
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

  const quantity_inp = document.querySelectorAll("#product_stock");
  const save_CH = document.querySelector(".save_changes");
  const checkout_process = document.querySelector(".checkout_process");
  const tr_for_cart = document.querySelectorAll(".tr_for_cart");
  const productPrice = document.querySelectorAll(".product_price");
  const which_to_buy = document.querySelectorAll(".which_to_buy");
  const totalPriceCart = document.querySelector(".totalPriceCart");
  const one_prod_sum = document.querySelectorAll(".one_prod-sum");

  const cart_items_sum = parseFloat(totalPriceCart.textContent);

  // cart for not registered users
  if (cartItems && !document.getElementById("wishproducts")) {
    $.ajax({
      type: "GET",
      url: "/get_cart_data/",
      success: function (data) {
        if (!data.message) {
          for (let index = 0; index < data.cart_products.length; index++) {
            const element = data.cart_products[index];

            $(".deleteBtn").on("click", function () {
              const delete_btn = $(this);
              const skuToDelete = delete_btn.data("count"); // Get the SKU of the product to delete
              delete_btn.parent().parent().remove();

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
          }
        }
      },
      error: function (xhr, status, error) {
        console.error(xhr.responseText);
      },
    });

    $(document).on("click", ".save_changes", () => {
      let isValid = true;
      let new_price = [];
      let updatedQuantities = {}; // Object to store updated quantities

      let productPrice2 = document.querySelectorAll(".product_price");
      let quantity_inp2 = document.querySelectorAll("#product_stock");
      let tr_for_cart2 = document.querySelectorAll(".tr_for_cart");

      for (let index = 0; index < tr_for_cart2.length; index++) {
        const qnt = quantity_inp2[index];
        const prod_price = productPrice2[index];

        if (parseInt(qnt.value) !== parseInt(qnt.dataset.first_qnt)) {
          // If the quantity has changed, add it to updatedQuantities object
          updatedQuantities[qnt.dataset.prodid] = parseInt(qnt.value);

          qnt.dataset.first_qnt = parseInt(qnt.value);
        }

        // Calculate the new price regardless of whether the quantity has changed
        new_price.push(
          parseFloat(prod_price.textContent) * parseInt(qnt.value)
        );
      }

      // Send AJAX request only if there are updated quantities
      if (Object.keys(updatedQuantities).length > 0) {
        $.ajax({
          type: "POST",
          url: "/update_cart_guest/",
          headers: {
            "X-CSRFToken": csrftoken,
          },
          data: {
            "updated_quantities": JSON.stringify(updatedQuantities), // Send updated quantities object as JSON string
          },
          success: function (data) {
            if (data.message && isValid) {
              alert(data.message);
              isValid = false;
            }

            // Update UI elements based on the response
            one_prod_sum.forEach((element, index) => {
              element.textContent = new_price[index].toFixed(2);
            });

            let sum = 0;
            new_price.forEach((num) => {
              sum += num;
            });
            totalPriceCart.textContent = sum.toFixed(2);

            save_CH.classList.add("d-none");
          },
          error: function (xhr, status, error) {
            console.log(error);
          },
        });
      }
    });
  }

  quantity_inp.forEach((element) => {
    element.addEventListener("change", () => {
      const inputVal = Number(element.value);
      const prodId = element.dataset.prodid;

      which_to_buy.forEach((btn, index) => {
        if (btn.checked) {
          btn.checked = false;
          totalPriceCart.textContent = 0.0;
        }
      });

      if (inputVal < 1 && Number.isInteger(inputVal)) {
        alert("Please enter a valid number");
        element.value = 1;
        return;
      }

      save_CH.classList.remove("d-none");
    });
  });

  let new_price_which = 0;

  let totalPrice232 = 0; // Initialize total price
  let checkboxClicked = false; // Initialize flag to track checkbox click

  which_to_buy.forEach((checkbox, index) => {
    checkbox.addEventListener("change", () => {
      let checkedCount = 0;
      let checkedIndex = -1;
      const one_sum = one_prod_sum[index];

      // Count the number of checked checkboxes and store the index of the checked checkbox
      which_to_buy.forEach((cb, idx) => {
        if (cb.checked) {
          checkedCount++;
          checkedIndex = idx;
        }
      });

      if (checkedCount === 1) {
        if (checkbox.checked) {
          totalPriceCart.textContent = 0;
          new_price_which = (
            parseFloat(totalPriceCart.textContent) +
            parseFloat(one_sum.textContent)
          ).toFixed(2);

          totalPriceCart.textContent = new_price_which;
        } else if (!checkbox.checked) {
          totalPriceCart.textContent -= parseFloat(one_sum.textContent);
          totalPriceCart.textContent = parseFloat(
            totalPriceCart.textContent
          ).toFixed(2);

          if (parseFloat(totalPriceCart.textContent) < 0) {
            totalPriceCart.textContent = 0;
          }
        }
      } else {
        const one_sum = one_prod_sum[index];

        if (checkbox.checked) {
          new_price_which = (
            parseFloat(totalPriceCart.textContent) +
            parseFloat(one_sum.textContent)
          ).toFixed(2);

          totalPriceCart.textContent = new_price_which;
        } else if (!checkbox.checked) {
          totalPriceCart.textContent -= parseFloat(one_sum.textContent);
          totalPriceCart.textContent = parseFloat(
            totalPriceCart.textContent
          ).toFixed(2);

          if (parseFloat(totalPriceCart.textContent) < 0) {
            totalPriceCart.textContent = 0;
          }
        }
      }
    });
  });

  let isAnyChecked = false;

  checkout_process.addEventListener("click", () => {
    if (document.getElementById("wishproducts")) {
      if (save_CH.classList.contains("d-none")) {
        let selectedProducts = [];
        let totalPrice = document.querySelector(".totalPriceCart").innerText;

        // Iterate over each product in the cart
        tr_for_cart.forEach((row, index) => {
          const qnt = quantity_inp[index];
          const prod_price = productPrice[index];
          const which_buy = which_to_buy[index];

          if (which_buy.checked) {
            // Add information about the selected product to the array
            selectedProducts.push({
              quantity: qnt.value,
              productId: qnt.dataset.prodid,
              price: prod_price.innerText,
            });
          }
        });

        if (selectedProducts.length > 0) {
          // At least one product is selected, construct the URL with parameters
          let url = "checkout_page?";
          selectedProducts.forEach((product, index) => {
            // Append product information to the URL
            url += `product_quantity${index + 1}=${product.quantity}&`;
            url += `product_id${index + 1}=${product.productId}&`;
            url += `product_price${index + 1}=${product.price}&`;
          });

          // Append total price to the URL
          url += `total_price=${totalPrice}`;

          // Redirect to the checkout page with the constructed URL
          window.location.href = url;
        } else {
          alert(
            "Please select at least one product from the cart before proceeding with checkout."
          );
        }
      } else {
        alert("First Save Changes and then Proceed to checkout");
      }
    } else {
      alert("Please log in or register to continue shopping.");
    }
  });

  // this is for the registered users
  if (document.getElementById("wishproducts")) {
    $(document).on("click", ".save_changes", () => {
      let isValid = true;
      let new_price = [];
      let updatedQuantities = {}; // Object to store updated quantities

      let productPrice2 = document.querySelectorAll(".product_price");
      let quantity_inp2 = document.querySelectorAll("#product_stock");
      let tr_for_cart2 = document.querySelectorAll(".tr_for_cart");

      for (let index = 0; index < tr_for_cart2.length; index++) {
        const qnt = quantity_inp2[index];
        const prod_price = productPrice2[index];

        if (parseInt(qnt.value) !== parseInt(qnt.dataset.first_qnt)) {
          // If the quantity has changed, add it to updatedQuantities object
          updatedQuantities["sku"] = qnt.dataset.prodid;
          updatedQuantities["quantity"] = parseInt(qnt.value);

          qnt.dataset.first_qnt = parseInt(qnt.value);
        }

        // Calculate the new price regardless of whether the quantity has changed
        new_price.push(
          parseFloat(prod_price.textContent) * parseInt(qnt.value)
        );
      }

      console.log(updatedQuantities);

      // Send AJAX request only if there are updated quantities
      if (Object.keys(updatedQuantities).length > 0) {
        $.ajax({
          type: "POST",
          url: "/updateCart/",
          headers: {
            "X-CSRFToken": csrftoken,
          },
          data: {
            "updated_quantities": JSON.stringify(updatedQuantities), // Send updated quantities object as JSON string
          },
          success: function (data) {
            if (data.success_message && isValid) {
              alert(data.success_message);
              isValid = false;
            }

            // Update UI elements based on the response
            one_prod_sum.forEach((element, index) => {
              element.textContent = new_price[index].toFixed(2);
            });

            let sum = 0;
            new_price.forEach((num) => {
              sum += num;
            });
            totalPriceCart.textContent = sum.toFixed(2);

            save_CH.classList.add("d-none");
          },
          error: function (xhr, status, error) {
            console.log(error);
          },
        });
      }
    });
  }
});
