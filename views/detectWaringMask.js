const $input = document.querySelector("input[type=hidden]");
const $h1 = document.querySelector("h1");
const $loading = document.querySelector("#loading");
const $p = document.querySelector("p");

function withMask() {
  $p.textContent = "With mask";
  document.body.classList.add("with-mask");
}
function withoutMask() {
  $p.textContent = "Without mask";
  document.body.classList.add("without-mask");
}
function fail() {
  $p.innerHTML = "Your picture seems to be wrong. <br />Please try again.";
}

$(document).ready(function () {
  const delay = Math.random() * 1 * 1000 + 1;
  setTimeout(() => {
    $.ajax({
      url: "/detect",
      dataType: "json",
      type: "POST",
      data: { data: $input.value.slice(0, -3) },
      success: function ({ data }) {
        $loading.classList.add("hidden");
        $h1.innerHTML = `<i class="fas fa-arrow-left"></i>`;
        if (data === "error") {
          // file doesn't exist
          fail();
        } else if (data === "false") {
          // without mask
          withoutMask();
        } else if (data === "true") {
          // with mask
          withMask();
        }
      },
    });
  }, delay);
});
