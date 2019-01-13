// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

let charRNN;
let textInput;
//let lengthSlider;
//let tempSlider;
let temperature=0.5;
let len=256;

let button;
let runningInference = false;

function setup() {

  noCanvas();

  console.log("temperature="+temperature,len+"characters")

  // Create the LSTM Generator passing it the model directory
  //charRNN = ml5.charRNN('./models/trump/', modelReady);
  charRNN = ml5.charRNN('./models/bible/', modelReady);

  // Grab the DOM elements
  //textInput = select('#textInput');
  //lengthSlider = select('#lenSlider');
  //tempSlider = select('#tempSlider');
  //button = select('#generate');

  // DOM element events
  //button.mousePressed(generate);
  //lengthSlider.input(updateSliders);
  //tempSlider.input(updateSliders);
}

// Update the slider values
/*
function updateSliders() {
  select('#length').html(lengthSlider.value());
  select('#temperature').html(tempSlider.value());
}
*/

function modelReady() {
  console.log('Model Loaded');
  generate();
}

// Generate new text
function generate() {

  console.log('generate()');
  // prevent starting inference if we've already started another instance
  // TODO: is there better JS way of doing this?
 if(!runningInference) {

    runningInference = true;

    // Update the status log
    console.log('Generating...');

    // Grab the original text
    let original = rnd(100)+":"+rnd(100);

    // Make it to lower case
    let txt = original.toLowerCase();

    // Check if there's something to send
    if (txt.length > 0) {

      // This is what the LSTM generator needs
      // Seed text, temperature, length to outputs
      // TODO: What are the defaults?

      let data = {
        seed: txt,
        temperature: temperature,
        length: len
      };

      // Generate text with the charRNN
      charRNN.generate(data, gotData);

      // When it's done
      function gotData(err, result) {
        // Update the status log
        //select('#status').html('Ready!');
        //select('#result').html(txt + result.sample);
        //
        console.log(result.sample);

        //post process
        let x=result.sample.split(".");
        if(x.length>1){
          result.sample=x[0]+'.';
        }


        var node = document.createElement("li");                 // Create a <li> node
        var textnode = document.createTextNode(txt+' '+result.sample);         // Create a text node
        node.appendChild(textnode);                              // Append the text to <li>
        document.getElementById("result").appendChild(node);

        speak(result.sample);

        runningInference = false;

        //generate();//repeat
      }
    }
  }
}


function rnd(n){
  return Math.round(Math.random()*n);
}



var synth = window.speechSynthesis;
var voices = [];

function populateVoiceList() {

  console.log('populateVoiceList()');

  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });

  //console.log(voices);

}



/*
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}
*/

function speak(str){

    populateVoiceList();

    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }


      var utterThis = new SpeechSynthesisUtterance(str);

      utterThis.onend = function (event) {
          //console.log('SpeechSynthesisUtterance.onend');
          generate();
      }

      utterThis.onerror = function (event) {
          console.error('SpeechSynthesisUtterance.onerror');
      }

      var selectedOption = 'Google UK English Male';

      for(i = 0; i < voices.length ; i++) {
        if(voices[i].name === selectedOption) {
          utterThis.voice = voices[i];
        }
      }

      //utterThis.voice = ;
      utterThis.pitch = 0.4;
      utterThis.rate = 0.8;
      synth.speak(utterThis);
}
