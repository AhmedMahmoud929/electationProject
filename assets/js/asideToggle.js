let openBtn = document.querySelector("header i.fa-bars");
let closeBtn = document.querySelector(".content-panel i.fa-xmark");
let aside = document.querySelector(".content-panel");

let opened = false;

openBtn.addEventListener("click", () => {
  if (!opened) {
    aside.classList.add("opened");
    opened = true;
  }
});

closeBtn.addEventListener("click", () => {
  if (opened) {
    aside.classList.remove("opened");
    opened = false;
  }
});
