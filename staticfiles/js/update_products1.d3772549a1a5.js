function sanitizeInput(userInput) {
  // Remove all HTML tags from user input
  let sanitizedInput = userInput.replace(/(<([^>]+)>)/gi, "");
  return sanitizedInput;
}

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

const category = JSON.parse(
  document.getElementById("category-term").textContent
);
const subCategory = JSON.parse(
  document.getElementById("subCategory-term").textContent
);
const unique_id_for_prod = JSON.parse(
  document.getElementById("unique_id_for_prod").textContent
);

$(function () {
  $(".category").autocomplete({
    source: category,
    minLength: 1,
  });
});

$(function () {
  $(".sub_category").autocomplete({
    source: subCategory,
    minLength: 1,
  });
});

const sub_prod = document.querySelectorAll(".sub_prod1");

const product_sku = document.querySelectorAll(".product_sku");
product_sku.forEach((element) => {
  element.value = element.value.split("-")[0];
});

const attr_delete = document.querySelectorAll(`.attr_delete`);

attr_delete.forEach((element, index2) => {
  element.addEventListener("click", () => {
    element.parentElement.remove();
  });
});

for (let index = 0; index < sub_prod.length; index++) {
  const attr_cont = document.querySelector(`.attr_cont${index}`);
  const all_attributes_div = document.querySelectorAll(`.all_attr_div`);

  // add attributes for first div that will shown on default
  $(`.add_more_attr${index}`)
    .off("click")
    .on("click", () => {
      if (
        $(`.add_more_attr${index}`).data("count") === $(attr_cont).data("count")
      ) {
        $(`.attr_cont${$(`.add_more_attr${index}`).data("count")}`).append(
          `
            <div class="d-flex align-items-end gap-3">
              <div class="attributes_div1 d-flex mt-2 mb-2" data-count="${index}" style="width: 70%">
                <div class="col-md-6 attr_first">
                  <label for="formGroupExampleInput2" class="form-label">
                    Attributes
                  </label>
                  <div class="d-flex align-items-center">
                    <input
                      type="text"
                      class="form-control product_attribute necessary_form"
                      id="formGroupExampleInput2"
                      placeholder="Color, Material etc..."
                      data-count="${index}"
                    />
                    :
                  </div>
                </div>
                <div class="col-md-6 attr_first_value">
                  <label for="formGroupExampleInput" class="form-label">
                    Attribute Value
                  </label>
                  <input
                    type="text"
                    class="form-control product_attribute_value necessary_form"
                    id="formGroupExampleInput"
                    placeholder="Red, Blue, Cotton etc..."
                    data-count="${index}"
                  />
                </div>
              </div>

            <div
              class="p-2 attr_delete"
              style="background-color: red; cursor: pointer; margin-top: -0.5rem;"
              data-count="${index}"
            >
              <i class="bi bi-trash text-light"></i>
            </div>
          </div>        
          `
        );
      }
    });
}

let product_obj = {};
let sub_prod_obj = {};

const necessary_form = document.querySelectorAll(".necessary_form");
$(".create_product_btn")
  .off("click")
  .on("click", () => {
    let everything_fine = true;
    let everything_fine1 = true;
    let everything_fine2 = true;
    let everything_fine3 = false;
    let everything_fine4 = true;

    necessary_form.forEach((element532, index) => {
      if (
        $(element532).val() == "" &&
        !necessary_form[index].classList.contains("product_image")
      ) {
        everything_fine = false;
      }
    });

    if (!everything_fine) {
      alert("Please fill out all fields");
    }

    $(".product_price").each(function (index, element21) {
      if (parseFloat(element21.value) <= 0) {
        $(".price_error").each(function (index, element22) {
          $(element22).text("Price Should Be above 0");
        });
        everything_fine1 = false;
      }
    });

    let prd_sku = document.querySelectorAll(".product_sku");

    // Initialize a set to store unique SKUs
    const uniqueSKUs = new Set();
    let duplicateFound = false;

    // Iterate through each product SKU
    for (let index = 0; index < prd_sku.length; index++) {
      const sku = prd_sku[index].value;

      // Check if the SKU is already in the set
      if (uniqueSKUs.has(sku)) {
        alert(`Duplicate SKU found: ${sku}. Please change it.`);
        duplicateFound = true;
        break; // Exit the loop early since a duplicate is found
      } else {
        // Add the SKU to the set if it's not a duplicate
        uniqueSKUs.add(sku);
      }
    }

    $(".product_stock").each(function (index, element23) {
      if (parseInt(element23.value) <= 0) {
        $(".stock_error").each(function (index, element24) {
          $(element24).text("Stock Should Be above 0");
        });
        everything_fine2 = false;
      }
    });

    let arr55 = [];
    let arr56 = [];

    $(".form-check-input").each(function (index, element26) {
      if (!$(element26).is(":checked")) {
        arr55.push(element26);
      } else if ($(element26).is(":checked")) {
        arr56.push(element26);
      }
    });

    if (arr56.length === 1) {
      everything_fine3 = true;
    } else if (arr56.length > 1) {
      everything_fine3 = false;
      alert("You Must Have Only One Default Product");
    } else if (arr56.length === 0) {
      everything_fine3 = false;
      alert("You Must Have One Default Product");
    }

    const product_category = document.querySelector(".category");
    const product_sub_category = document.querySelector(".sub_category");
    const product_name = document.querySelector(".product_name");
    const product_desc = document.querySelector(".product_desc");

    var formData = new FormData();

    product_obj = {
      "category": sanitizeInput(product_category.value),
      "product_sub_category": sanitizeInput(product_sub_category.value),
      "product_name": sanitizeInput(product_name.value),
      "product_desc": sanitizeInput(product_desc.value).trim(),
    };

    let arrt435 = [];

    formData.append("product_obj", JSON.stringify(product_obj));

    let modalAdded = false;

    for (let iFor_cont = 0; iFor_cont < $(".sub_prod1").length; iFor_cont++) {
      let iFor_cont2 = iFor_cont + 1;
      const product_sku = document.querySelectorAll(".product_sku");
      const product_price = document.querySelectorAll(".product_price");
      const product_stock = document.querySelectorAll(".product_stock");
      const product_attribute = document.querySelectorAll(".product_attribute");
      const product_attribute_value = document.querySelectorAll(
        ".product_attribute_value"
      );
      const form_check_input = document.querySelectorAll(".form-check-input");

      const product_image = document.querySelectorAll(".product_image");

      if (
        everything_fine &&
        everything_fine1 &&
        everything_fine2 &&
        everything_fine3 &&
        everything_fine4
      ) {
        const id = iFor_cont;

        if (product_image[iFor_cont].files[0]) {
          formData.append(`image-${id}`, product_image[iFor_cont].files[0]);
        } else {
          formData.append("image", "same");
        }

        sub_prod_obj = {
          [`product_id_${id}`]: {
            "product_sku": sanitizeInput(product_sku[id].value),
            "product_price": sanitizeInput(product_price[id].value),
            "product_stock": sanitizeInput(product_stock[id].value),
            "form_check_input": form_check_input[id].checked,
          },
        };

        arrt435.push(sub_prod_obj);

        console.log(id);

        product_attribute.forEach((element, index) => {
          if (parseInt(element.dataset.count) === id) {
            if (
              sub_prod_obj[`product_id_${id}`][
                `attr_${sanitizeInput(element.value)}`
              ]
            ) {
              sub_prod_obj[`product_id_${id}`][
                `attr_${sanitizeInput(element.value)}`
              ] += sanitizeInput(`,${product_attribute_value[index].value}`);
            } else {
              sub_prod_obj[`product_id_${id}`][
                `attr_${sanitizeInput(element.value)}`
              ] = sanitizeInput(product_attribute_value[index].value);
            }
          }
        });
        formData.append("lent", $(".sub_prod1").length);
      }
    }

    formData.append("sub_prod_obj", JSON.stringify(arrt435));
    formData.append("unique_id_prod", unique_id_for_prod);

    console.log(arrt435);

    if (
      everything_fine &&
      everything_fine1 &&
      everything_fine2 &&
      everything_fine3 &&
      everything_fine4
    ) {
      $.ajax({
        url: `${location.protocol}//${location.host}/update_product_ajax/`,
        type: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
        },
        processData: false,
        contentType: false,
        data: formData,
        success: function (data) {
          console.log(!data.message12521);
          if (!data.message12521) {
            if (!modalAdded) {
              $(".modal_container").css({
                "display": "grid",
              });

              $(".modal_container").append(
                `
                        <div class="modal12" style="text-align: center">
                          <h3 style="font-size: 1.4rem">Your Product Is Updated</h3>
                          <a href="${location.protocol}//${location.host}/product_detail/${data.product.product_id}/" class="btn155">See Product</a>
                        </div>
                      `
              );

              modalAdded = true;
            }
          } else {
            if (!modalAdded) {
              alert(data.message12521);
            }
            modalAdded = true;
          }
        },
        error: function (error) {
          console.error(error.responseJSON.error);
        },
      });
    }
  });
