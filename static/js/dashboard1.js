const delete_btn = document.querySelectorAll("#delete_product");
const update_product_modal_btn = document.querySelectorAll(
  "#update_product_modal-btn"
);

let jwtToken = localStorage.getItem("access_token");

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

// delete product from database using AJAX request
delete_btn.forEach((element) => {
  element.addEventListener("click", () => {
    let is_default = element.dataset.default == "False" ? false : true;

    jwtToken = localStorage.getItem("access_token");

    if (is_default) {
      console.log("aq aris exla");
      // If the product is default, show a modal to choose the next default product
      $.ajax({
        type: "POST",
        url: "/deleteProduct/",
        headers: {
          "X-CSRFToken": csrftoken,
          "Authorization": `Bearer ${jwtToken}`,
        },
        data: {
          "sku": element.dataset.sku,
          "default": element.dataset.default,
          "uniqueId": element.dataset.uniqueid,
        },
        success: function (response) {
          console.log("aq aris exla");
          if (response.warning && response.alternatives) {
            console.log("aq aris exla2");
            $(".bots_modal").modal("hide");

            // Display a modal with the warning message and options to choose the next default product
            const warningModal = document.getElementById("warningModal");
            const modalBody = warningModal.querySelector(".modal-body");
            modalBody.innerHTML = `<p class='text-dark' style='text-align: left;'>${
              response.warning
            }</p><ul>${response.alternatives
              .map(
                (alternative) =>
                  `<li class='mb-2'><button class="select-alternative" data-sku="${alternative.sku}">${alternative.sku}</button></li>`
              )
              .join("")}</ul>`;

            // Show the modal
            $(warningModal).modal("show");

            // Handle click event on alternative selection
            const selectAlternativeButtons = modalBody.querySelectorAll(
              ".select-alternative"
            );
            selectAlternativeButtons.forEach((button) => {
              button.addEventListener("click", () => {
                // Handle the selection of the alternative sub-product
                const selectedSku = button.dataset.sku;

                $.ajax({
                  type: "POST",
                  url: "/delete_default_product/",
                  headers: {
                    "X-CSRFToken": csrftoken,
                    "Authorization": `Bearer ${jwtToken}`,
                  },
                  data: {
                    "selectedSku": selectedSku,
                    "product_for_delete": response.delete_product,
                  },
                  success: function (response) {
                    window.location.href = "/";
                  },
                  error: function (xhr, status, error) {
                    console.error(xhr.responseText);
                    // Handle errors
                  },
                });
              });
            });
          } else {
            window.location.href = "/";
          }
        },
        error: function (xhr, status, error) {
          console.error(xhr.responseText);

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

                ////////////////////////////////////////////////////
                // when we refresh token we sending one more request
                alert("Try Again!!");
              },
              error: function (error) {
                console.error(error);
              },
            });
          }
        },
      });
    } else {
      $.ajax({
        type: "POST",
        url: "/deleteProduct/",
        headers: {
          "X-CSRFToken": csrftoken,
          "Authorization": `Bearer ${jwtToken}`,
        },
        data: {
          "sku": element.dataset.sku,
          "default": element.dataset.default,
          "uniqueId": element.dataset.uniqueid,
        },
        success: function (response) {
          window.location.href = "/";
        },

        error: function (xhr, status, error) {
          console.error(xhr.responseText);

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

                ////////////////////////////////////////////////////
                // when we refresh token we sending one more request
                $.ajax({
                  type: "POST",
                  url: "/deleteProduct/",
                  headers: {
                    "X-CSRFToken": csrftoken,
                    "Authorization": `Bearer ${jwtToken}`,
                  },
                  data: {
                    "sku": element.dataset.sku,
                    "default": element.dataset.default,
                    "uniqueId": element.dataset.uniqueid,
                  },
                  success: function (response) {
                    window.location.href = "/";
                  },
                  error: function (xhr, status, error) {
                    alert(`Error! ${xhr.status}: ${xhr.responseJSON}`);
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

// ---------- CHARTS ----------

const firstProd1 = JSON.parse(
  document.getElementById("firstProd1").textContent
);
const secondProd2 = JSON.parse(
  document.getElementById("secondProd2").textContent
);
const thirdProd3 = JSON.parse(
  document.getElementById("thirdProd3").textContent
);
const fourthProd4 = JSON.parse(
  document.getElementById("fourthProd4").textContent
);
const fifthProd = JSON.parse(document.getElementById("fifthProd5").textContent);

const firstProd241 = JSON.parse(
  document.getElementById("firstProd241").textContent
);
const secondProd252 = JSON.parse(
  document.getElementById("secondProd252").textContent
);
const thirdProd263 = JSON.parse(
  document.getElementById("thirdProd263").textContent
);
const fourthProd274 = JSON.parse(
  document.getElementById("fourthProd274").textContent
);
const fifthProd285 = JSON.parse(
  document.getElementById("fifthProd285").textContent
);

// BAR CHART
const barChartOptions = {
  series: [
    {
      data: [firstProd1, secondProd2, thirdProd3, fourthProd4, fifthProd],
      name: "Products",
    },
  ],
  chart: {
    type: "bar",
    background: "transparent",
    height: 350,
    toolbar: {
      show: false,
    },
  },
  colors: ["#2962ff", "#d50000", "#2e7d32", "#ff6d00", "#583cb3"],
  plotOptions: {
    bar: {
      distributed: true,
      borderRadius: 4,
      horizontal: false,
      columnWidth: "40%",
    },
  },
  dataLabels: {
    enabled: false,
  },
  fill: {
    opacity: 1,
  },
  grid: {
    borderColor: "#55596e",
    yaxis: {
      lines: {
        show: true,
      },
    },
    xaxis: {
      lines: {
        show: true,
      },
    },
  },
  legend: {
    labels: {
      colors: "#f5f7ff",
    },
    show: true,
    position: "top",
  },
  stroke: {
    colors: ["transparent"],
    show: true,
    width: 2,
  },
  tooltip: {
    shared: true,
    intersect: false,
    theme: "dark",
  },
  xaxis: {
    categories: [
      firstProd241,
      secondProd252,
      thirdProd263,
      fourthProd274,
      fifthProd285,
    ],
    title: {
      style: {
        color: "#f5f7ff",
      },
    },
    axisBorder: {
      show: true,
      color: "#55596e",
    },
    axisTicks: {
      show: true,
      color: "#55596e",
    },
    labels: {
      style: {
        colors: "#f5f7ff",
      },
    },
  },
  yaxis: {
    title: {
      text: "Rating",
      style: {
        color: "#f5f7ff",
      },
    },
    axisBorder: {
      color: "#55596e",
      show: true,
    },
    axisTicks: {
      color: "#55596e",
      show: true,
    },
    labels: {
      style: {
        colors: "#f5f7ff",
      },
    },
  },
};

const barChart = new ApexCharts(
  document.querySelector("#bar-chart"),
  barChartOptions
);
barChart.render();
