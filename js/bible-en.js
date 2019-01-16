let charRNN;
let textInput;
let temperature=0;//0 works great!
let len=200;
let button;
let runningInference = false;
var synth = window.speechSynthesis;
var voices = [];
let t;//timeout watchdog

function setup() {

  noCanvas();

  if (synth) {
    synth.cancel();//in case it's running?
  }

  // Create the LSTM Generator passing it the model directory
  charRNN = ml5.charRNN('./models/bible/', modelReady);
}


function modelReady() {
  console.log('Model Loaded');
  populateVoiceList();
  let btn=document.getElementById('generate');
  btn.disabled = false;
  btn.innerText="Click to start";

  btn.onclick=function(){
    document.getElementById('audio1').play();
    generate();
  }
}


function generate(){// Generate new text

  document.getElementById('generate').style.display = 'none';

  // prevent starting inference if we've already started another instance
  if(runningInference) {
    console.warn("already running");
    return;
  }

  runningInference = true;

  // Update the status log
  console.log('Generating...');

  // Grab the original text
  let txt = rnd(100)+":"+rnd(100);
  //let txt = original.toLowerCase();

  // Check if there's something to send
  if (txt.length > 0) {

    // This is what the LSTM generator needs
    // Seed text, temperature, length to outputs
    let data = {
      seed: txt,
      temperature: temperature,
      length: len
    };

    // Generate text with the charRNN
    charRNN.generate(data, gotData);

    // When it's done
    function gotData(err, result) {

      //post process
      let x=result.sample.split(".");
      if(x.length>1){
        result.sample=x[0]+'.';
      }

      document.getElementById("result").innerHTML=result.sample;
      speak(result.sample);//lol
      runningInference = false;
    }
  }
}

function rnd(n){
  return Math.round(Math.random()*n);
}

function populateVoiceList() {

  console.log('populateVoiceList()');

  voices = synth.getVoices().sort(function (a, b) {
      const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
      if ( aname < bname ) return -1;
      else if ( aname == bname ) return 0;
      else return +1;
  });

  if(voices.length==0){
    console.error("no voices");
  }else{
    console.log(voices.length+" voices");
  }

}

/*
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}
*/

function speak(str){

    if (synth.speaking) {
      synth.cancel();
    }

    clearTimeout(t);
    t=setTimeout(function(){
      console.warn("oops, retrying!");
      synth.cancel();
      generate();
    }, 30000);

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
          console.error('SpeechSynthesisUtterance.onerror', event);
      }

      var selectedOption = 'Google UK English Male';

      for(i = 0; i < voices.length ; i++) {
        if(voices[i].name === selectedOption) {
          //console.log(voices[i].name);
          utterThis.voice = voices[i];
        }
      }

      //utterThis.voice = ;
      utterThis.pitch = 0.4;
      utterThis.rate = 0.8;
      synth.speak(utterThis);
}
