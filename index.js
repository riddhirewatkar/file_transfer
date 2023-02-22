const dropZone = document.querySelector(".drop-zone");
const browseBtn = document.querySelector(".browseBtn");
const fileInput = document.querySelector("#fileInput");

const progressContainer = document.querySelector("progress-container");
const bgProgress = document.querySelector(".bg-progress"); 
const progressBar = document.querySelector(".progress-bar");
const percentDiv = document.querySelector("#percent");

const sharingContainer = document.querySelector(".sharing-container")
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");

const emailForm = document.querySelector("#emailForm");

const alert = document.querySelector(".alert");

const host = "https://innshare.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 * 1024;

dropZone.addEventListener("dragover", (e)=>{
    e.preventDefault();

    if(!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged");
    }
});

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();  
    dropZone.classList.remove("dragged");

    const files = e.dataTransfer.files;
    console.table(files);
    if(files.length){
        fileInput.files = files;  //file transfer
        uploadFile()
    }
});

fileInput.addEventListener("change", () =>{
    uploadFile()
})

browseBtn.addEventListener("click", ()=>{
    fileInput.click()
});

copyBtn.addEventListener("click", ()=>{
    fileURLInput.select();
    Document.execCommand("copy");
    showAlert("Link copied")
})

const uploadFile = () => {
    if(fileInput.files.length > 1){
        resetFileInput();
        showAlert("Only upload 1 file!");
        return;
    }

    const file = fileInput.files[0];

    if(file.size > maxAllowedSize){
        showAlert("Can't upload more than 100MB");
        resetFileInput();
        return;
    }

    progressContainer.style.display = "block";
    //const file = fileInput.files[0];
    const formData = new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    //shows the status of file
    xhr.onreadystatechange = () => {
        if(xhr.readyState === XMLHttpRequest.DONE){
            console.log(xhr.response);
            showLink(JSON.parse(xhr.response));  //json.parse make javascript object
        }
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () =>{
        fileInput.value = "";
        showAlert('Error in upload: ${xhr.statusText}')
    }
    
    xhr.open("POST", uploadURL);
    xhr.send(formData);
};

const updateProgress = (e) =>{  // shows file upload progess how much percentage of file upload
    const percent = Math.round((e.loaded / e.total)*100);
    //console.log(percent);
    bgProgress.style.width = `${percent}%`;  //for animation purpose
    percentDiv.innertext = percent;
    progressBar.style.transform = 'scaleX(${percent/100})';
};

const showLink = ({file: url}) => {
    console.log(url);
    resetFileInput();
    emailForm[2].removeAttribute("disabled");
    progressContainer.style.display = "none";  //after uploading done it will hide container
    sharingContainer.style.display = "block";
    fileURLInput.value = url;  //show url  
};

const resetFileInput = () => {
    fileInput.value = "";
}

emailForm.addEventListener("submit", (e)=>{
    e.preventDefault()
    console.log("Submit form");
    const url = fileURLInput.value;

    const formData = {
        uuid: url.split("/").splice(-1, 1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailForm: emailForm.elements["form-email"],
    };

    emailForm[2].setAttribute("disabled", "true");
    console.table(formData); 

    fetch(emailURL, {
        method: "POST", 
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })

    .then((res) => res.json())
    .then(({success}) => {
        if(success){
            sharingContainer.style.display = "none";
            showAlert("Email sent");
        }
    });
});

let alertTimer;
const showAlert = (msg) => {
    alert.innertext = msg;
    alert.style.transform = "translateY(-50%, 0)"

    clearTimeout(alertTimer);
    alertTimer = setTimeout(() =>{
        alert.style.transform = "translate(-50%, 60px)";
    }, 2000);

};