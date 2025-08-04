import  { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePuterStore } from "~/lib/puter";
export const meta = () => {
    [
        { title: "Resumind | Auth" },
        { name: "description", content: "Log into your account" },
    ];
};
const auth = () => {
    const {isLoading, auth }=usePuterStore();
    const location=useLocation();
    const next=location.search.split("next=")[1];
    const navigate=useNavigate();

    useEffect(()=>{
        if(auth.isAuthenticated){

            navigate(next); 
        }
        
    },[auth.isAuthenticated])
    
    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover min-h-screenflex items-center justify-center pt-16 pb-4">
            <div className=" gra">

            </div>
        </main>
    )
};

export default auth;
