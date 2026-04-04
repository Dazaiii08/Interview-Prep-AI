const Groq = require("groq-sdk");

const ai = new Groq({
  apiKey: process.env.GROQ_API_KEY
});
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");


//Generate interview question and ans using Gemini
//POST api/ai/generate-questions
//Pvt access
const generateInterviewQuestions = async(req,res)=>{
    try{
        const {role,experience,topicsToFocus, numberOfQuestions}= req.body;

        if(!role||!experience||!topicsToFocus||!numberOfQuestions){
            return res.status(400).json({message:"Missing required fields"});
        }

        const prompt = questionAnswerPrompt(role,experience,topicsToFocus,numberOfQuestions);
const completion = await ai.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: prompt
    }
  ],
  response_format: {
    type: "json_object"
  }
});
const rawText = completion.choices[0].message.content;

        //Clean it : remove json from begg and end
        const cleanedText = rawText
        .replace(/^```json\s*/,"")//Removing starting ``` json
        .replace(/```$/,"")//Removing ending ```
        .trim();//removing extra spaces

        //Now safe to parse
        const data = JSON.parse(cleanedText);

        res.status(200).json(data);
    }
    catch(err){
        res.status(500).json({
            message:"Failed to generate questions",
            error:err.message,
        })
    }
};

//Generate explains a interview question
//POST api/ai/generate-explaination
//Pvt access
const generateConceptExplaination = async(req,res)=>{
    try{
        const {question}=req.body;

        if(!question){
            return res.status(400).json({message:"Missing required fields"});
        }
        const prompt = conceptExplainPrompt(question);

const completion = await ai.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "user",
      content: prompt
    }
  ],
  response_format: {
    type: "json_object"
  }
});
const content = completion.choices[0].message.content;

let data;

try {
  data = JSON.parse(content);
} catch (parseError) {
  console.log("AI RAW RESPONSE:", content);

  return res.status(500).json({
    message: "Invalid JSON returned by AI",
    error: parseError.message
  });
}

res.status(200).json(data);
    }
    catch(err){
         res.status(500).json({
            message:"Failed to generate questions",
            error:err.message,
        })
    }
};

module.exports = {generateConceptExplaination,generateInterviewQuestions}