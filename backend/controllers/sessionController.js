const Session = require("../models/Session");
const Question = require("../models/Question");

//@desc Create a new session and linked questions
//@route POST/api/sessions/create
//@access Private
exports.createSession = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, description, questions } = req.body;
        const userID = req.user._id;

        // Step 1: Create the session first
        const session = await Session.create({
            user: userID,
            role,
            experience,
            topicsToFocus,
            description,
        });

        // Step 2: Create Question documents linked to this session
        const questionDocs = await Question.insertMany(
            questions.map((q) => ({
                session: session._id,
                question: q.question,
                answer: q.answer,
            }))
        );

        // Step 3: Update session with question IDs
        session.questions = questionDocs.map((q) => q._id);
        await session.save();

        res.status(201).json({ success: true, session });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

//@desc Get all sessions for the logged in user
//@route GET/api/sessions/my-sessions
//@access Private
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("questions");

    res.status(200).json(sessions);

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

//@desc Get a session by ID with populated questions
//@route GET/api/sessions/:id
//@access Private
exports.getSessionById = async (req,res)=>{
      try{
        const session = await Session.findById(req.params.id)
        .populate({
            path:"questions",
            options:{ sort:{isPinned:-1, createdAt:1 } },
        })
        .exec();
        
        if(!session){
            return res 
            .status(404)
            .json({success:false, message:"Session Not Found"});
        }

        res.status(200).json({success:true, session});

    } catch(err){
        res.status(500).json({success:false, message:"Server Error"});
    }
};

//@desc Delete a session and its questions
//@route GET/api/sessions/:id
//@access Private
exports.deleteSession = async (req,res)=>{
      try{
        const session = await Session.findById(req.params.id);
        if(!session){
            return res.status(404).json({message:"Session Not Found"});
        }

        //Check if the logged in user own this session
        if (session.user.toString() !== req.user._id.toString()) {
            return res
            .status(401)
            .json({message:"Not authorized to delete this session"});
        }

        //First, delete all questions linked to this session
        await Question.deleteMany({session:session._id});

        //Then, delete the session
        await Session.findByIdAndDelete(session._id);

        res.status(200).json({message:"Session deleted successfully"});

    } catch(err){
        res.status(500).json({success:false, message:"Server Error"});
    }
};