import React from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import {AnimatePresence, motion} from "framer-motion";
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu';
import SpinnerLoader from '../../components/Loader/SpinnerLoader';
import {toast} from "react-hot-toast";
import { useState } from 'react';
import { useEffect } from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import RoleInfoHeader from './components/RoleInfoHeader';
import axios from 'axios';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import QuestionCard from '../../components/Cards/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/Loader/SkeletonLoader';

const InterviewPrep = () => {
  const {sessionId} = useParams();
  console.log("SessionId:", sessionId);
  const [sessionData,setSessionData] = useState(null);
  const [ errorMsg, setErrorMsg]=useState("");

  const [openLearnMoreDrawer, setOpenLearnMoreDrawer]=useState(false);
  const [explanation,setExplanation]=useState(null);

  const [isLoading,setIsLoading]=useState(false);
  const[isUpdateLaoder, setIsUpdateLoader] = useState(false);

  //Fetch session data by session Id
const fetchSessionDetailsById = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));

    console.log("FULL RESPONSE DATA:", response.data);
    console.log("SESSION OBJECT:", response.data?.session);
    console.log("QUESTIONS:", response.data?.session?.questions);  // ADD THIS

    if (response.data && response.data.session) {
      setSessionData(response.data.session);
    }
  } catch (err) {
    console.error("Error:", err);
  }
};

  //Generate concept explaination
  const generateConceptExplanation = async(question)=>{

    try{
      setErrorMsg("");
      setExplanation(null);
      setIsLoading(true);
      setOpenLearnMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question
        }
      );

      if(response.data){
        setExplanation(response.data);
      }
    } catch(err){
      setExplanation(null)
      setErrorMsg("Failed to generate explainations, Please try again afer sometime");
      console.error("Error:",err);
    } finally{
      setIsLoading(false);
    }

  };

  //Pin Question
  const toggleQuestionPinStatus = async(questionId)=>{

    try{
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );
      console.log(response);

      if(response.data && response.data.question){
        //toast.success('Question Pinned Successfully')
        fetchSessionDetailsById();
      }
    } catch(error){
      console.error("Error :", error);
    }

  };

  //Add more questions to a session
  const uploadMoreQuestion = async()=>{
    console.log("SESSION DATA:", {
    role: sessionData?.role,
    experience: sessionData?.experience,
    topicsToFocus: sessionData?.topicsToFocus,
});

    try{
      setIsUpdateLoader(true);

      //Call AI API to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role:sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 8,
        }
      );
      //Should be array  like [{question, answer},...]
      const generatedQuestions = aiResponse.data.questions;

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION,
        {
          sessionId,
          questions: generatedQuestions,
        }
        
      );

      if(response.data){
        toast.success("Added More Q&A!!!");
        fetchSessionDetailsById();
      }
    } catch(err){
      if(err.response && err.response.data.message){
        setErrorMsg("Something went wrong. Please try again.");
      }
    } finally{
      setIsUpdateLoader(false);
    }
  };

  useEffect(()=>{
    if(sessionId){
      fetchSessionDetailsById();
    }
  },[sessionId]);

  return (
    <DashboardLayout>
      <RoleInfoHeader
      role={sessionData?.role || ""}
      topicsToFocus={sessionData?.topicsToFocus||""}
      experience ={sessionData?.experience||"-"}
      questions={sessionData?.questions?.length || "-"}
      description={sessionData?.description||""}
      lastUpdated={
        sessionData?.updatedAt
        ?moment(sessionData.updatedAt).format("DD MM YYYY")
        :""
      }
      />

      <div className='container mx-auto pt-4 pb-4 px-4 md:px-0'>
        <h2 className='text-lg font-semibold text-black'>Interview Q&A</h2>
        <div className='grid grid-cols-12 gap-4 mt-5 mb-11'>
          <div 
          className={`col-span-12 ${
            openLearnMoreDrawer ? "md:col-span-7":"md:col-span-8"
          }`}
          >
            <AnimatePresence>
              {sessionData?.questions?.map((data,index)=>{
                return(
                  <motion.div
                  key={data._id || index}
                  initial={{opacity:0,y:-20}}
                  animate={{opacity:1,y:0}}
                  exit={{opacity:0,scale:0.95}}
                  transition={{
                    duration:0.4,
                    type:"spring",
                    stiffness:100,
                    delay: index*0.1,
                    damping:15
                  }}
                  layout
                  layoutId={`question-${data._id || index}`}
                  >
                    <>
                    <QuestionCard
                    question={data?.question}
                    answer={data?.answer}
                    onLearnMore={()=>
                      generateConceptExplanation(data.question)
                    }
                    isPinned={data?.isPinned}
                    onTogglePin={()=>toggleQuestionPinStatus(data._id)}
                    />
                    

                    {!isLoading && sessionData?.questions?.length === index +1 && (
                      <div className='flex items-center justify-center mt-5'>
                        <button
                        className="flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 rounded-md hover:bg-gray-900 transition"
                        disabled={isLoading || isUpdateLaoder}
                        onClick={uploadMoreQuestion}
                        >
                          {isUpdateLaoder?(
                            <SpinnerLoader/>
                          ):(
                            <LuListCollapse className='text-lg'/>
                          )}{" "}
                          Load More
                        </button>
                      </div>
                    )}
                    </>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

            <div>
              <Drawer
              isOpen={openLearnMoreDrawer}
              onClose={()=>setOpenLearnMoreDrawer(false)}
              title={!isLoading &&  explanation?.title}
              >
                {errorMsg && (
                  <p className='flex gap-2 text-sm text-amber-600 font-medium'>
                    <LuCircleAlert className='mt-1'/> {errorMsg}
                  </p>
                )}
                {isLoading && <SkeletonLoader/>}
                {!isLoading && explanation && (
                  <AIResponsePreview content={explanation?.explanation}/>
                )}
              </Drawer>
            </div>

      </div>

    </DashboardLayout>
  )
}

export default InterviewPrep