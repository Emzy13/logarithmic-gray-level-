const API_LINK = "https://dog.ceo/api/breeds/image/random" // URL API
const TIMEOUT_LENGTH =  1000 // Lungimea timeout-ului pentru afisarea imaginii prelucrate

// Folosind functia fetch dam un request pe API iar rezultatul il vom afisa in pagina
fetch(API_LINK)
.then((response) => response.json())
.then((data) => {
    console.log(data)
    let jsonInfo = document.getElementById("json-info")
    jsonInfo.append(JSON.stringify(data, undefined, 4))
    renderImage(data["message"]) // Functia renderImage creeaza canvas-ul unde vom prelucra imaginea primita de la API
});

// getMax este o functie ajutatoare pentru a putea calcula maximul dintr-un array mai lung folosit de mine la calcularea celui mai mare pixel dintr-o imagine
function getMax(arr) {
    let len = arr.length;
    let max = -Infinity;

    while (len--) {
        max = arr[len] > max ? arr[len] : max;
    }
    return max;
}

// renderImage este o functie ce primeste ca parametru url-ul imaginii, construieste canvas-ul si prelucreaza imaginea 
function renderImage(url){
    let myCanvas =  document.getElementById("myCanvas")
    let ctx =  myCanvas.getContext("2d")
    
    // Creeam o imagine noua pentru a o desena
    let initialImage = new Image()
    initialImage.src = url  // setam url-ul imaginii
    initialImage.crossOrigin = "Anonymous"; // pentru a nu aparea probleme la getImageData vom seta crossOrigin pe Anonymous
    // Folosim functia onload pentru a desena imaginea atunci cand primim tot continutul acesteia de la API 
    // vom desena in canvas doar dupa un timp prestabilit folosind functia setTimeout din JavaScript folosind ca prim parametru functia handler si al doilea timpul de asteptare
    initialImage.onload = setTimeout(function(){
        //setam dimensiunile canvas-ului, deoarece vrem sa desenam doua imaginii am ales sa pun in spatiu de 10px intre ele 
        myCanvas.width =  initialImage.width * 2 + 10; 
        myCanvas.height = initialImage.height;

        // Pentru a putea da mirror la imagine este nevoie sa translatam pozitia acesteia pentru a nu iesi din pagina
        ctx.translate(initialImage.width,0);
        // Folosind functia scale modificam scalam negativ lungimea pentru a realiza efectul de mirror
        ctx.scale(-1, 1);
        // desenam imaginea mirrored 
        ctx.drawImage(initialImage, 0, 0);
        // pentru a putea desena si cealalta imagine va trebui sa resetam translatia canvas-ului
        ctx.setTransform(1,0,0,1,0,0);

        // a doua imagine o vom desena la un offset de 10 px de cea mirrored
        ctx.drawImage(initialImage, initialImage.width + 10, 0)

        // folosim functia getImageData pentru a manipula pixelii imagini
        imgData = ctx.getImageData(initialImage.width + 10, 0, initialImage.width, initialImage.height);

        // vom avea nevoie de cel mai mare pixel pentru a calcula constanta din formula de transformare logaritmica a nivelului gri
        maxPixel = getMax(imgData.data)

        // calculam constanta folosind formula: 255/log(1+ valoareMaximaPixel) 
        c = 255 / Math.log(1 + maxPixel)

        // pentru fiecare pixel aplicam formula c * log(pixel +1) Adaugam 1 deoarece este posibil ca valoarea pixel sa fie 0 si atunci log(0) genereaza o eroare
        for(let i = 0; i < imgData.data.length; i += 4) {
            imgData.data[i] = c * Math.log(imgData.data[i] + 1)
            imgData.data[i+1] = c * Math.log(imgData.data[i+1] + 1)
            imgData.data[i+2] = c * Math.log(imgData.data[i+2] + 1)
            imgData.data[i+3] = c * Math.log(imgData.data[i+3] + 1)
        }
        // aplicam modificarile facute imaginii
        ctx.putImageData(imgData, initialImage.width + 10, 0)
    }, TIMEOUT_LENGTH)



    
}