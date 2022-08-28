'use strict';

let etoNo = FORM["year"] %12
let etoAnimal = "";
let animalPicture = "";
switch(etoNo) {
    case 0 :
        etoAnimal = "さる";
        animalPicture = "./image/saru.png" ;
    break;
    case 1 :
        etoAnimal = "とり";
        animalPicture = "./image/tori.png" ;
    break;
    case 2 :
        etoAnimal = "いぬ";
        animalPicture = "./image/inu.png" ;
    break;
    case 3 :
        etoAnimal = "いのしし";
        animalPicture = "./image/i.png" ;
    break;
    case 4 :
        etoAnimal = "ねずみ";
        animalPicture = "./image/ne.png" ;
    break;
    case 5 :
        etoAnimal = "うし";
        animalPicture = "./image/ushi.png" ;
    break;
    case 6 :
        etoAnimal = "とら";
        animalPicture = "./image/tora.png" ;
    break;
    case 7 :
        etoAnimal = "うさぎ";
        animalPicture = "./image/u.png" ;
    break;
    case 8 :
        etoAnimal = "たつ";
        animalPicture = "./image/tatsu.png" ;
    break;
    case 9 :
        etoAnimal = "へび";
        animalPicture = "./image/mi.png" ;
    break;
    case 10 :
        etoAnimal = "うま";
        animalPicture = "./image/uma.png" ;
    break;
    case 11 :
        etoAnimal = "ひつじ";
        animalPicture = "./image/hitsuji.png" ;
    break;
}
let eto = document.getElementById("eto");
    eto.innerText = etoAnimal;
let etopic = document.getElementById("etoPic");
etopic.src = animalPicture;
// 次ページに送る情報
let sendNext = document.getElementsByName("etoNo");

sendNext[0].value = etoNo;