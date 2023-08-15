let checkBox = document.querySelectorAll("#checkBox");
let loader = document.querySelectorAll("#loader");
let toggleForm = document.querySelectorAll("#toggleForm");

checkBox.forEach((ele, ix) => {
  ele.addEventListener("change", () => {
    toggleForm[ix].submit();
    ele.style.display = "none";
    loader[ix].style.display = "inline-block";
  });
});
