let video;
let model;

// LOAD AI
async function init(){
  model = await mobilenet.load();
}
init();

// NAV
function go(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

// PROFILE
function saveProfile(){
  localStorage.setItem('h', height.value);
  localStorage.setItem('w', weight.value);
  localStorage.setItem('g', goal.value);
}

// BMI
function calcBMI(){
  let h = localStorage.getItem('h')/100;
  let w = localStorage.getItem('w');

  let bmi = (w/(h*h)).toFixed(1);
  let status = bmi<18.5?"Underweight":bmi<25?"Normal":"Overweight";

  bmiResult.innerText = `BMI: ${bmi} (${status})`;
}

// 📅 PLAN
function generatePlan(){
  let goal = localStorage.getItem('g');
  let text = "";

  if(goal==="lose"){
    text = "30-Day Plan:\n- Eat less sugar\n- Exercise 20min daily\n- Drink more water";
  } else if(goal==="gain"){
    text = "30-Day Plan:\n- Eat more protein\n- Strength training\n- Increase calories";
  } else {
    text = "30-Day Plan:\n- Maintain balance\n- Light exercise\n- Healthy meals";
  }

  planBox.innerText = text;
}

// DAILY TRACK
function saveDaily(){
  let weight = document.getElementById("dailyWeight").value;
  let days = JSON.parse(localStorage.getItem("days")||"[]");

  days.push(weight);
  localStorage.setItem("days", JSON.stringify(days));

  progress.innerText = "Progress:\n" + days.join(" kg\n") + " kg";
}

// CAMERA
function startCamera(){
  video = document.getElementById("video");
  navigator.mediaDevices.getUserMedia({video:true})
  .then(stream => video.srcObject = stream);
}

// 🤖 SMART AI (TOP 3)
async function scanFood(){
  let result = document.getElementById("scanResult");
  let choices = document.getElementById("choices");

  result.innerText = "🤖 AI analyzing...";
  choices.innerHTML = "";

  let predictions = await model.classify(video);
  let top3 = predictions.slice(0,3);

  result.innerText = "Select correct food:";

  top3.forEach(p=>{
    let label = p.className.split(",")[0];

    let btn = document.createElement("button");
    btn.innerText = `${label} (${(p.probability*100).toFixed(1)}%)`;
    btn.className = "choice-btn";

    btn.onclick = ()=> confirmFood(label);

    choices.appendChild(btn);
  });
}

// CONFIRM FOOD
async function confirmFood(food){
  let result = document.getElementById("scanResult");
  let choices = document.getElementById("choices");

  choices.innerHTML = "";
  result.innerText = `Fetching nutrition for ${food}...`;

  try{
    let res = await fetch(
      `https://api.spoonacular.com/recipes/complexSearch?query=${food}&addRecipeNutrition=true&number=1&apiKey=1ee90ad59f804cb5b4d6e418f04c732e`
    );

    let data = await res.json();

    let cal = data.results?.[0]?.nutrition?.nutrients?.find(n=>n.name==="Calories")?.amount || "N/A";

    result.innerText =
`🍽 ${food}
🔥 ${cal} kcal`;

  } catch{
    result.innerText = "API error";
  }
}