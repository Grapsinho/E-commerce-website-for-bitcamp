$(document).ready(function () {
  function sanitizeInput(userInput) {
    // Remove all HTML tags from user input
    let sanitizedInput = userInput.replace(/(<([^>]+)>)/gi, "");
    return sanitizedInput;
  }

  const category = JSON.parse(
    document.getElementById("category-term").textContent
  );
  const subCategory = JSON.parse(
    document.getElementById("subCategory-term").textContent
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

  let count1 = 1;

  let product_obj = {};
  let sub_prod_obj = {};

  // add attributes for first div that will shown on default
  $(".add_more_attr1")
    .off("click")
    .on("click", () => {
      if (
        $(".add_more_attr1").data("count") === $(".attr_cont1").data("count") &&
        document.querySelectorAll(".attributes_div1").length !== 2
      ) {
        $(`.attr_cont${$(".add_more_attr1").data("count")}`).append(
          `
                      <div class="attributes_div1 d-flex mt-2 mb-2" data-count="${1}">
                          <div class="col-md-6 attr_first">
                            <div class="d-flex align-items-center">
                              <input
                                type="text"
                                class="form-control product_attribute necessary_form"
                                id="formGroupExampleInput2"
                                placeholder="Color, Material etc..."
                                data-count="${1}"
                              />
                              :
                            </div>
                          </div>
                          <div class="col-md-6 attr_first_value">
                            <input
                              type="text"
                              class="form-control product_attribute_value necessary_form"
                              id="formGroupExampleInput"
                              placeholder="Red, Blue, Cotton etc..."
                              data-count="${1}"
                            />
                      </div>
                    </div>
                   `
        );
      }

      if (document.querySelectorAll(".attributes_div1").length == 2) {
        $(".add_more_attr1").addClass("d-none");
      }
    });

  $(".create_product_btn")
    .off("click")
    .on("click", () => {
      let everything_fine = true;
      let everything_fine1 = true;
      let everything_fine2 = true;
      let everything_fine3 = true;

      $(".necessary_form").each(function (index, element2) {
        if ($(element2).val() == "") {
          everything_fine = false;
        }
      });

      if (!everything_fine) {
        alert("Please fill out all fields");
      }

      if ($(".product_price").val() <= 0) {
        $(".price_error").text("Price Should Be above 0");
        everything_fine1 = false;
      }

      if ($(".product_stock").val() <= 0) {
        $(".stock_error").text("Stock Should Be above 0");
        everything_fine2 = false;
      }

      if (!$(".form-check-input").is(":checked")) {
        alert("You must choose one default product");
        everything_fine3 = false;
      }

      const product_category = document.querySelector(".category");
      const product_sub_category = document.querySelector(".sub_category");
      const product_name = document.querySelector(".product_name");
      const product_desc = document.querySelector(".product_desc");

      const product_sku = document.querySelector(".product_sku");
      const product_price = document.querySelector(".product_price");
      const product_stock = document.querySelector(".product_stock");
      const product_attribute = document.querySelectorAll(".product_attribute");
      const product_attribute_value = document.querySelectorAll(
        ".product_attribute_value"
      );

      const product_image = document.querySelector(".product_image");
      var formData = new FormData();
      formData.append("image", product_image.files[0]);

      if (
        everything_fine &&
        everything_fine1 &&
        everything_fine2 &&
        everything_fine3
      ) {
        product_obj = {
          "category": sanitizeInput(product_category.value),
          "product_sub_category": sanitizeInput(product_sub_category.value),
          "product_name": sanitizeInput(product_name.value),
          "product_desc": sanitizeInput(product_desc.value),
        };
        const id = product_sku.attributes.getNamedItem("data-count").value;

        sub_prod_obj = {
          [`product_id_${id}`]: {
            "product_sku": sanitizeInput(product_sku.value),
            "product_price": sanitizeInput(product_price.value),
            "product_stock": sanitizeInput(product_stock.value),
          },
        };

        product_attribute.forEach((element, index) => {
          if (
            sub_prod_obj[`product_id_${id}`][
              `attr_${sanitizeInput(element.value)}`
            ]
          ) {
            sub_prod_obj[`product_id_${id}`][
              `attr_${sanitizeInput(element.value)}`
            ] += `,${sanitizeInput(product_attribute_value[index].value)}`;
          } else {
            sub_prod_obj[`product_id_${id}`][
              `attr_${sanitizeInput(element.value)}`
            ] = sanitizeInput(product_attribute_value[index].value);
          }
        });

        formData.append("product_obj", JSON.stringify(product_obj));
        formData.append("sub_prod_obj", JSON.stringify(sub_prod_obj));

        console.log(product_obj, "magari");
        console.log(sub_prod_obj, "magari2");
      }

      let modalAdded = false;

      if (
        everything_fine &&
        everything_fine1 &&
        everything_fine2 &&
        everything_fine3
      ) {
        $.ajax({
          url: `${location.protocol}//${location.host}/ajax_viewFor_CreteProducts/`,
          type: "POST",
          headers: {
            "X-CSRFToken": csrftoken,
            "Authorization": `Bearer ${jwtToken}`,
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
                    <h3 style="font-size: 1.4rem">Your Product Is Created</h3>
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
            console.error(error);

            if (error.responseJSON.error == "Token has expired") {
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

                  ////////////////////////////////////////////////////
                  // when we refresh token we sending one more request
                  $.ajax({
                    url: `${location.protocol}//${location.host}/ajax_viewFor_CreteProducts/`,
                    type: "POST",
                    headers: {
                      "X-CSRFToken": csrftoken,
                      "Authorization": `Bearer ${localStorage.getItem(
                        "access_token"
                      )}`,
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
                                <h3 style="font-size: 1.4rem">Your Product Is Created</h3>
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
                      console.error(error);
                    },
                  });
                },
                error: function (error) {
                  console.error(error);
                },
              });
            }
          },
        });
      }
    });

  // all codes from above are for the first sub-product

  $(".add_more_sbProduct")
    .off("click")
    .on("click", () => {
      count1++;

      // adding new sub product
      $(".cont_for_sub_pro").append(
        `
              <div class="sub_prod${count1} sub_prod1 row g-3" data-count="${count1}">
                <div class="col-md-6">
                  <label for="formGroupExampleInput" class="form-label"
                    >Sku</label
                  >
                  <input
                    type="text"
                    class="form-control product_sku necessary_form"
                    id="formGroupExampleInput"
                    placeholder="Enter Your Products SKU."
                    data-count="${count1}"
                  />
                </div>
                <div class="col-md-6">
                  <label for="formGroupExampleInput2" class="form-label"
                    >Price $</label
                  >
                  <input
                    type="number"
                    min="1"
                    max="100000"
                    class="form-control product_price necessary_form"
                    id="formGroupExampleInput2"
                    placeholder="Enter your Products Price."
                    data-count="${count1}"
                  />

                  <span
                    style="font-size: 0.8; color: red"
                    class="price_error"
                  ></span>
                </div>
                <div class="col-md-6">
                  <label for="formGroupExampleInput" class="form-label"
                    >Stock</label
                  >
                  <input
                    type="number"
                    min="1"
                    class="form-control product_stock necessary_form"
                    id="formGroupExampleInput"
                    placeholder="Stock."
                    data-count="${count1}"
                  />

                  <span
                  style="font-size: 0.8; color: red"
                  class="stock_error"
                ></span>
                </div>
                <div class="col-md-6">
                  <label for="formFile" class="form-label">Choose image</label>
                  <input
                    class="form-control product_image necessary_form"
                    type="file"
                    id="formFile"
                    data-count="${count1}"
                  />
                </div>

                <h2 class="mt-5">Write down the features of the product</h2>

                <div class="attr_cont${count1}" data-count="${count1}">
                  <div class="attributes_div1 d-flex" data-count="${count1}">
                    <div class="col-md-6 attr_first">
                      <label for="formGroupExampleInput2" class="form-label"
                        >Attributes</label
                      >
                      <div class="d-flex align-items-center">
                        <input
                          type="text"
                          class="form-control product_attribute necessary_form"
                          id="formGroupExampleInput2"
                          placeholder="Color, Material etc..."
                          data-count="${count1}"
                        />
                        :
                      </div>
                    </div>
                    <div class="col-md-6 attr_first_value">
                      <label for="formGroupExampleInput" class="form-label"
                        >Attribute Value</label
                      >
                      <input
                        type="text"
                        class="form-control product_attribute_value necessary_form"
                        id="formGroupExampleInput"
                        placeholder="Red, Blue, Cotton etc..."
                        data-count="${count1}"
                      />
                    </div>
                  </div>
                </div>
                <button
                  class="btn btn-secondary w-50 add_more_attr"
                  style="margin: 1rem auto"
                  type="button"
                  data-count="${count1}"
                >
                  Add More
                </button>

                <div class="col-12">
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="gridCheck${count1}"
                      data-count="${count1}"
                    />
                    <label class="form-check-label" for="gridCheck${count1}">
                      Is Default
                    </label>
                  </div>

                  <div
                    class="d-flex"
                    style="flex-direction: column; font-size: 0.9rem"
                  >
                    <span>If You Check This</span>
                    <p>This Sub Product Will Be Shown On Default</p>
                  </div>

                  <div class="col-md-6 align-items-center">
                    <button
                      class="btn btn-danger w-50 remove_sub_product"
                      style="margin: 1rem auto"
                      type="button"
                      data-count="${count1}"
                    >
                      Delete
                    </button>
                   </div>
                </div>
              </div>
              `
      );

      // when we add one more sub product then we can add more attribute to it
      $(".add_more_attr").each(function (index, element) {
        $(element)
          .off("click")
          .on("click", () => {
            if (
              $(element).data("count") ===
              $(`.attr_cont${$(element).data("count")}`).data("count")
            ) {
              $(`.attr_cont${$(element).data("count")}`).append(
                `
                      <div class="attributes_div1 d-flex mt-2" data-count="${count1}">
                          <div class="col-md-6 attr_first">
                            <div class="d-flex align-items-center">
                              <input
                                type="text"
                                class="form-control product_attribute"
                                id="formGroupExampleInput2"
                                placeholder="Color, Material etc..."
                                data-count="${count1}"
                              />
                              :
                            </div>
                          </div>
                          <div class="col-md-6 attr_first_value">
                            <input
                              type="text"
                              class="form-control product_attribute_value"
                              id="formGroupExampleInput"
                              placeholder="Red, Blue, Cotton etc..."
                              data-count="${count1}"
                            />
                      </div>
                    </div>
                   `
              );
            }

            if (
              $(element).data("count") ===
              $(`.attr_cont${$(element).data("count")}`).data("count")
            ) {
              $(element).addClass("d-none");
            }
          });
      });

      // doing same but now i remove sub product forms
      $(".remove_sub_product").each(function (index, element1) {
        $(element1)
          .off("click")
          .on("click", () => {
            if (
              $(element1).data("count") ===
              $(`.sub_prod${$(element1).data("count")}`).data("count")
            ) {
              $(`.sub_prod${$(element1).data("count")}`).remove();
            }
          });
      });

      $(".create_product_btn")
        .off("click")
        .on("click", () => {
          let everything_fine = true;
          let everything_fine1 = true;
          let everything_fine2 = true;
          let everything_fine3 = false;

          $(".necessary_form").each(function (index, element2) {
            if (element2.value == "") {
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
          let duplicateFound = true;

          // Iterate through each product SKU
          for (let index = 0; index < prd_sku.length; index++) {
            const sku = prd_sku[index].value;

            // Check if the SKU is already in the set
            if (uniqueSKUs.has(sku)) {
              alert(`Duplicate SKU found: ${sku}. Please change it.`);
              duplicateFound = false;
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
            "product_desc": sanitizeInput(product_desc.value),
          };

          let arrt435 = [];

          formData.append("product_obj", JSON.stringify(product_obj));

          let modalAdded = false;

          for (
            let iFor_cont = 0;
            iFor_cont < $(".sub_prod1").length;
            iFor_cont++
          ) {
            let iFor_cont2 = iFor_cont + 1;
            const product_sku = document.querySelectorAll(".product_sku");
            const product_price = document.querySelectorAll(".product_price");
            const product_stock = document.querySelectorAll(".product_stock");
            const product_attribute =
              document.querySelectorAll(".product_attribute");
            const product_attribute_value = document.querySelectorAll(
              ".product_attribute_value"
            );
            const form_check_input =
              document.querySelectorAll(".form-check-input");

            const product_image = document.querySelectorAll(".product_image");

            if (
              everything_fine &&
              everything_fine1 &&
              everything_fine2 &&
              everything_fine3 &&
              duplicateFound
            ) {
              const id = iFor_cont;

              formData.append("image", product_image[iFor_cont].files[0]);

              sub_prod_obj = {
                [`product_id_${id}`]: {
                  "product_sku": sanitizeInput(product_sku[id].value),
                  "product_price": sanitizeInput(product_price[id].value),
                  "product_stock": sanitizeInput(product_stock[id].value),
                  "form_check_input": form_check_input[id].checked,
                },
              };

              arrt435.push(sub_prod_obj);

              product_attribute.forEach((element, index) => {
                if ($(element).data("count") - 1 === id) {
                  if (
                    sub_prod_obj[`product_id_${id}`][
                      `attr_${sanitizeInput(element.value)}`
                    ]
                  ) {
                    sub_prod_obj[`product_id_${id}`][
                      `attr_${sanitizeInput(element.value)}`
                    ] += sanitizeInput(
                      `,${product_attribute_value[index].value}`
                    );
                  } else {
                    sub_prod_obj[`product_id_${id}`][
                      `attr_${sanitizeInput(element.value)}`
                    ] = sanitizeInput(product_attribute_value[index].value);
                  }
                }
              });
              formData.append("sub_prod_obj", JSON.stringify(arrt435));
              formData.append("lent", $(".sub_prod1").length);
            }
          }

          if (
            everything_fine &&
            everything_fine1 &&
            everything_fine2 &&
            everything_fine3 &&
            duplicateFound
          ) {
            $.ajax({
              url: `${location.protocol}//${location.host}/ajax_viewFor_CreteProducts/`,
              type: "POST",
              headers: {
                "X-CSRFToken": csrftoken,
                "Authorization": `Bearer ${jwtToken}`,
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
                                <h3 style="font-size: 1.4rem">Your Product Is Created</h3>
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
                console.error(error);

                if (error.responseJSON.error == "Token has expired") {
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

                      ////////////////////////////////////////////////////
                      // when we refresh token we sending one more request
                      $.ajax({
                        url: `${location.protocol}//${location.host}/ajax_viewFor_CreteProducts/`,
                        type: "POST",
                        headers: {
                          "X-CSRFToken": csrftoken,
                          "Authorization": `Bearer ${localStorage.getItem(
                            "access_token"
                          )}`,
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
                                <h3 style="font-size: 1.4rem">Your Product Is Created</h3>
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
                          console.error(error);
                        },
                      });
                    },
                    error: function (error) {
                      console.error(error);
                    },
                  });
                }
              },
            });
          }
        });
    });
});
