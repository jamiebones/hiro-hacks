"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import ChainHookDisplay from "@/components/ChainHookDisplay"
import axios from 'axios'; 


export default function Home() {
  const [isClient, setIsClient] = useState(false);
  
  const [data, setData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const fetchData = async () => {
      try {
          const response = await axios.get('/api/vault');
          console.log("response ", response.data)
          let chainData = response.data.reverse();
          setData(chainData);
          setErrorMessage(null);
      } catch (error) {
          console.error(error);
          setErrorMessage('Error fetching data');
      }
  };

  useEffect(() => {
      fetchData(); 
  }, []);




  useEffect(() => {
    setIsClient(true);
    
  }, []);


  if (!isClient) return null;

  return (

      <main>
        <Navbar />

        <div className="flex">
          <div className="flex-grow">
            <div className="mt-6">
                { errorMessage && <p>{errorMessage}</p>}
                    {data && data.length > 0 && 
                    data.map((chainData, index) => {
                        return <ChainHookDisplay data={chainData} key={index}/>
                    }
                          
                    
                    )}
             
            </div>
          </div>
      
        </div>

      </main>

  );
}

