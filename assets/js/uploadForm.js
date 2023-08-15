const form = document.querySelector(".upload-container");
const uploadLoader = document.querySelector(".upload-loader");
const waitingMsg = document.querySelector(".waiting-msg");
const fileInput = document.getElementById("csvFile");
const fileInputCont = document.querySelector(".file-input-cont");
const fileNameDisplay = document.querySelector(".upload-container .file-name");
const sendButton = document.querySelector(
  ".upload-container input[type='submit']"
);

fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    fileNameDisplay.textContent = file.name;
    fileInputCont.style.opacity = "0";
    fileInputCont.style.pointerEvents = "none";
    fileInputCont.style.position = "absolute";
    sendButton.style.display = "block";
  }
});

sendButton.addEventListener("click", () => {
  form.style.display = "none";
  waitingMsg.style.display = "block";
  uploadLoader.style.cssText = `
     --uib-size:6rem;
     display:flex;
     justify-content: center;
     margin:auto;
     margin-top : 2rem;
`;
});
