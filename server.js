import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app=express();
app.use(cors());
app.use(express.json());

app.post("/generate",async(req,res)=>{
const {committee,country,agenda,seconds}=req.body;

const prompt=`Draft a ${seconds}-second UN-style General Speakers List speech.
Committee: ${committee}
Country: ${country}
Agenda: ${agenda}
Tone: Diplomatic, authoritative, institutional.
Structure: Opening, National Position, Critique, Solution, Closing.`;

const r=await fetch("https://api.openai.com/v1/chat/completions",{
method:"POST",
headers:{
"Authorization":`Bearer ${process.env.AI_KEY}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
model:"gpt-4.1-mini",
messages:[{role:"user",content:prompt}]
})
});

const d=await r.json();
res.json({text:d.choices[0].message.content});
});

app.listen(3000,()=>console.log("Delegatus backend running"));
